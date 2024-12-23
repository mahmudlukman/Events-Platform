"use client";

import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import Checkout from "./Checkout";
import { IEvent, RootState } from "@/types";
import { useSelector } from "react-redux";

interface CheckoutButtonProps {
  event: IEvent;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ event }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const hasEventFinished = new Date(event.endDateTime) < new Date();

  return (
    <div className="flex items-center gap-3">
      {hasEventFinished ? (
        <p className="p-2 text-red-400">
          Sorry, tickets are no longer available.
        </p>
      ) : (
        <>
          {!user ? (
            <Button asChild className="button rounded-full" size="lg">
              <Link href="/login">Get Tickets</Link>
            </Button>
          ) : (
            <Checkout event={event} userId={user._id} />
          )}
        </>
      )}
    </div>
  );
};

export default CheckoutButton;
