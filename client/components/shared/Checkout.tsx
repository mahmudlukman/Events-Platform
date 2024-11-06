"use client";

import { FC } from "react";
import { Button } from "../ui/button";
import { useInitializePaymentMutation } from "@/redux/features/order/orderApi";
import { useRouter } from "next/navigation";
import { IEvent } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CheckoutProps {
  event: IEvent;
  userId: string;
}

interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  order?: {
    _id: string;
  };
}

const Checkout: FC<CheckoutProps> = ({ event }) => {
  const router = useRouter();
  const [initializePayment, { isLoading, error }] =
    useInitializePaymentMutation();

  const onCheckout = async () => {
    try {
      const amount = event.isFree ? 0 : Number(event.price);

      const response = (await initializePayment({
        eventId: event._id,
        amount,
      }).unwrap()) as PaymentResponse;

      if (response.success) {
        if (event.isFree) {
          if (response.order?._id) {
            router.push(`/payment/success?orderId=${response.order._id}`);
          } else {
            throw new Error("Order ID not received for free event");
          }
        } else {
          if (response.paymentUrl) {
            window.location.href = response.paymentUrl;
          } else {
            throw new Error("Payment URL not received for paid event");
          }
        }
      }
    } catch (error) {
      console.error("Payment initialization failed:", error);
    }
  };

  if (error && "data" in error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {(error.data as { message?: string })?.message ||
            "Failed to process payment"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <Button
        onClick={onCheckout}
        disabled={isLoading}
        size="lg"
        className="button sm:w-fit"
      >
        {isLoading
          ? "Processing..."
          : event.isFree
          ? "Get Ticket"
          : "Buy Ticket"}
      </Button>
    </div>
  );
};

export default Checkout;
