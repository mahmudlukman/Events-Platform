"use client";
import React from "react";
import EventForm from "@/components/shared/EventForm";
import { useGetEventByIdQuery } from "@/redux/features/event/eventApi";
import { RootState } from "@/types";
import { useSelector } from "react-redux";

type UpdateEventProps = {
  params: Promise<{
    id: string;
  }>;
};

const UpdateEvent = ({ params }: UpdateEventProps) => {
  const { id } = React.use(params);

  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?._id as string;
  const { data: event } = useGetEventByIdQuery({ id });

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Update Event
        </h3>
      </section>

      <div className="wrapper my-8">
        <EventForm
          type="Update"
          event={event}
          eventId={event?._id}
          userId={userId}
        />
      </div>
    </>
  );
};

export default UpdateEvent;
