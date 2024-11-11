/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useVerifyPaymentQuery } from '@/redux/features/order/orderApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PaymentCallback = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !router.isReady) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Initializing Payment Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>Please wait...</p>
        </CardContent>
      </Card>
    );
  }

  const { status, tx_ref, transaction_id } = router.query;

  const { data, error, isLoading } = useVerifyPaymentQuery(
    {
      status: status as string,
      tx_ref: tx_ref as string,
      transaction_id: transaction_id as string,
    },
    {
      skip: !status || !tx_ref || !transaction_id,
    }
  );

  useEffect(() => {
    if (data) {
      if (data.success && data.orderId) {
        router.push(`/payment/success?orderId=${data.orderId}`);
      } else {
        router.push('/payment/failure');
      }
    }
  }, [data, router]);

  useEffect(() => {
    if (error) {
      console.error('Payment verification error:', error);
      router.push('/payment/failure');
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Verifying Payment</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>Please wait while we confirm your payment...</p>
        </CardContent>
      </Card>
    );
  }

  return null; // No UI to render, as the component will redirect to success or failure page
};

export default PaymentCallback;