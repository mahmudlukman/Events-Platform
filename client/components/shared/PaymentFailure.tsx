/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const PaymentFailure = () => {
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

  const handleReturnHome = () => {
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Payment Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">
            We&apos;re sorry, but your payment could not be processed. Please try again or contact support if the issue persists.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={handleReturnHome}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentFailure;