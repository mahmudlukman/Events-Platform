"use client";

import CheckoutButton from "@/components/shared/CheckoutButton";
import {
  useGetEventByIdQuery,
  useGetRelatedEventsByCategoryQuery,
} from "@/redux/features/event/eventApi";
import Collection from "@/components/shared/Collection";
import { formatDateTime } from "@/lib/utils";
import { SearchParamProps } from "@/types";
import Image from "next/image";
import { use } from "react";

const EventDetails = ({ params, searchParams }: SearchParamProps) => {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const id = resolvedParams.id;

  const {
    data: event,
    isLoading: isEventLoading,
    isError: isEventError,
  } = useGetEventByIdQuery({ id });

  const eventData = event?.event || event;

  const {
    data: relatedEventsData,
    isLoading: isRelatedLoading,
    isError: isRelatedError,
  } = useGetRelatedEventsByCategoryQuery(
    {
      categoryId: eventData?.category?._id || "",
      eventId: id,
      page: resolvedSearchParams.page?.toString() || "1",
      pageSize: 3,
    },
    {
      skip: !eventData?.category?._id,
    }
  );

  if (isEventLoading || isRelatedLoading) {
    return <div>Loading...</div>;
  }

  if (isEventError || isRelatedError) {
    return <div>Error loading event details</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  const image = eventData.image?.url || "/assets/images/placeholder.png";

  return (
    <>
      <section className="flex justify-center bg-primary-50 bg-dotted-pattern bg-contain">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:max-w-7xl">
          <Image
            src={image}
            alt={`${eventData.title} image`}
            width={1000}
            height={1000}
            className="h-full min-h-[300px] object-cover object-center"
          />

          <div className="flex w-full flex-col gap-8 p-5 md:p-10">
            <div className="flex flex-col gap-6">
              <h2 className="h2-bold">{eventData.title}</h2>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex gap-3">
                  <p className="p-bold-20 rounded-full bg-green-500/10 px-5 py-2 text-green-700">
                    {eventData.isFree ? "FREE" : `₦${eventData.price}`}
                  </p>
                  <p className="p-medium-16 rounded-full bg-grey-500/10 px-4 py-2.5 text-grey-500">
                    {eventData.category.name}
                  </p>
                </div>

                <p className="p-medium-18 ml-2 mt-2 sm:mt-0">
                  by{" "}
                  <span className="text-primary-500">
                    {eventData.organizer.firsName}{" "}
                    {/* {eventData.organizer.lastName} */}
                  </span>
                </p>
              </div>
            </div>

            <CheckoutButton event={event} />

            <div className="flex flex-col gap-5">
              <div className="flex gap-2 md:gap-3">
                <Image
                  src="/assets/icons/calendar.svg"
                  alt="calendar"
                  width={32}
                  height={32}
                />
                <div className="p-medium-16 lg:p-regular-20 flex flex-wrap items-center">
                  <p>
                    {formatDateTime(eventData.startDateTime).dateOnly} -{" "}
                    {formatDateTime(eventData.startDateTime).timeOnly}
                  </p>
                  <p>
                    {formatDateTime(eventData.endDateTime).dateOnly} -{" "}
                    {formatDateTime(eventData.endDateTime).timeOnly}
                  </p>
                </div>
              </div>

              <div className="p-regular-20 flex items-center gap-3">
                <Image
                  src="/assets/icons/location.svg"
                  alt="location"
                  width={32}
                  height={32}
                />
                <p className="p-medium-16 lg:p-regular-20">
                  {eventData.location}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="p-bold-20 text-grey-600">What You&apos;ll Learn:</p>
              <p className="p-medium-16 lg:p-regular-18">
                {eventData.description}
              </p>
              {eventData.url && (
                <p className="p-medium-16 lg:p-regular-18 truncate text-primary-500 underline cursor-pointer">
                  {eventData.url}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS with the same category */}
      <section className="wrapper my-8 flex flex-col gap-8 md:gap-12">
        <h2 className="h2-bold">Related Events</h2>

        <Collection
          data={relatedEventsData?.events}
          emptyTitle="No Events Found"
          emptyStateSubtext="Come back later"
          collectionType="All_Events"
          limit={3}
          page={resolvedSearchParams.page?.toString() || "1"}
          totalPages={Math.ceil((relatedEventsData?.totalEvents || 0) / 3)}
        />
      </section>
    </>
  );
};

export default EventDetails;
