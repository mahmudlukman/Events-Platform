"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, SearchParamProps } from "@/types";
import { useGetEventsByUserQuery } from "@/redux/features/event/eventApi";
import { useGetOrdersByUserQuery } from "@/redux/features/order/orderApi";
import Collection from "@/components/shared/Collection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Loading from "./loading";

const ProfilePage = ({ searchParams }: SearchParamProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?._id as string;

  const [ordersPage, setOrdersPage] = useState<number>(1);
  const [eventsPage, setEventsPage] = useState<number>(1);

  useEffect(() => {
    const resolveSearchParams = async () => {
      const resolvedSearchParams = await searchParams;
      setOrdersPage(Number(resolvedSearchParams?.ordersPage) || 1);
      setEventsPage(Number(resolvedSearchParams?.eventsPage) || 1);
    };
    resolveSearchParams();
  }, [searchParams]);

  const {
    data: orders,
    isLoading: isLoadingOrders,
    isError: isErrorOrders,
  } = useGetOrdersByUserQuery({ userId, page: ordersPage });
  const {
    data: organizedEvents,
    isLoading: isLoadingEvents,
    isError: isErrorEvents,
  } = useGetEventsByUserQuery({ userId, page: eventsPage });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderedEvents = orders?.orders.map((order: any) => order.event) || [];
  console.log(orderedEvents);

  if (isLoadingOrders || isLoadingEvents) {
    return <Loading />;
  }

  if (isErrorOrders || isErrorEvents) {
    return <div>Error loading data</div>;
  }

  return (
    <>
      {/* My Tickets */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">My Tickets</h3>
          <Button asChild size="lg" className="button hidden sm:flex">
            <Link href="/#events">Explore More Events</Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        <Collection
          data={orderedEvents}
          emptyTitle="No event tickets purchased yet"
          emptyStateSubtext="No worries - plenty of exciting events to explore!"
          collectionType="My_Tickets"
          limit={3}
          page={ordersPage}
          urlParamName="ordersPage"
          totalPages={orders?.totalPages}
        />
      </section>

      {/* Events Organized */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">Events Organized</h3>
          <Button asChild size="lg" className="button hidden sm:flex">
            <Link href="/events/create">Create New Event</Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        <Collection
          data={organizedEvents?.events}
          emptyTitle="No events have been created yet"
          emptyStateSubtext="Go create some now"
          collectionType="Events_Organized"
          limit={3}
          page={eventsPage}
          urlParamName="eventsPage"
          totalPages={organizedEvents?.totalPages}
        />
      </section>
    </>
  );
};

export default ProfilePage;
