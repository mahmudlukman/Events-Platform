"use client";

import { FC } from "react";
import { Button } from "../ui/button";
import { useInitializePaymentMutation } from "@/redux/features/order/orderApi";
import { useRouter } from "next/navigation";
import { IEvent } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CheckoutProps {
  event: IEvent;
  userId: string;
}

interface PaymentResponse {
  success: boolean;
  isFreeEvent: boolean;
  paymentUrl?: string;
  orderId: string;
  tx_ref?: string;
  message?: string;
  order?: {
    _id: string;
    paymentId: string;
    totalAmount: string;
    event: string;
    buyer: string;
    status: 'pending' | 'completed' | 'failed';
  };
}

const Checkout: FC<CheckoutProps> = ({ event }) => {
  const router = useRouter();
  const [initializePayment, { isLoading }] = useInitializePaymentMutation();

  // Get the base URL dynamically
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  };

  const onCheckout = async () => {
    try {
      const amount = event.isFree ? 0 : Number(event.price);

      // Validate amount
      if (!event.isFree && (isNaN(amount) || amount <= 0)) {
        throw new Error("Invalid ticket price");
      }

      // Add redirect_url to the payment initialization
      const baseUrl = getBaseUrl();
      const response = await initializePayment({
        eventId: event._id,
        amount,
        redirect_url: `${baseUrl}/payment/callback` // Add this to your payment initialization
      }).unwrap() as PaymentResponse;

      if (response.success) {
        if (response.isFreeEvent) {
          toast.success("You have successfully registered for this free event.");
          router.push(`/payment/success?orderId=${response.orderId}`);
        } else {
          if (response.paymentUrl) {
            // Save payment details to localStorage for verification
            localStorage.setItem('pendingPayment', JSON.stringify({
              orderId: response.orderId,
              tx_ref: response.tx_ref,
              eventId: event._id,
              amount: amount
            }));
            
            // Redirect to Flutterwave payment page
            window.location.href = response.paymentUrl;
          } else {
            throw new Error("Payment URL not received for paid event");
          }
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      toast.error("Failed to initialize payment. Please try again.");
    }
  };

  // Rest of the component remains the same...
  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={onCheckout}
        disabled={isLoading}
        size="lg"
        className="button sm:w-fit relative"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : (
          event.isFree ? "Get Ticket" : `Buy Ticket - ₦${Number(event.price).toLocaleString()}`
        )}
      </Button>
      
      {event.isFree && (
        <p className="text-sm text-muted-foreground">
          This is a free event
        </p>
      )}
    </div>
  );
};

export default Checkout;