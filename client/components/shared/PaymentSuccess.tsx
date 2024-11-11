/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const [router, setRouter] = useState<ReturnType<typeof useRouter> | null>(null);

  useEffect(() => {
    setRouter(useRouter());
  }, []);

  if (!router) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-600">
              Loading...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { orderId } = router.query;

  const handleViewEvents = () => {
    router.push('/profile');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for your purchase! Your order has been confirmed.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500">
              Order ID: <span className="font-mono font-medium">{orderId}</span>
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleViewEvents}
            className="bg-blue-600 hover:bg-blue-700"
          >
            View My Courses
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;