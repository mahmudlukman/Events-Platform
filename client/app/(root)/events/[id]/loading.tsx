import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <>
      <section className="flex justify-center bg-primary-50 bg-dotted-pattern bg-contain">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:max-w-7xl">
          {/* Image skeleton */}
          <Skeleton className="h-[400px] w-full object-cover" />

          {/* Content section */}
          <div className="flex w-full flex-col gap-8 p-5 md:p-10">
            {/* Title and tags */}
            <div className="flex flex-col gap-6">
              <Skeleton className="h-9 w-full max-w-[500px]" />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-24 rounded-full" />
                  <Skeleton className="h-10 w-32 rounded-full" />
                </div>
                <Skeleton className="ml-2 h-6 w-36 sm:mt-0" />
              </div>
            </div>

            {/* Checkout button */}
            <Skeleton className="h-14 w-full max-w-[200px]" />

            {/* Event details */}
            <div className="flex flex-col gap-5">
              {/* Date and time */}
              <div className="flex gap-2 md:gap-3">
                <Skeleton className="h-8 w-8" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-48" />
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-6 w-56" />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-6 w-72" />
            </div>
          </div>
        </div>
      </section>

      {/* Related Events section */}
      <section className="wrapper my-8 flex flex-col gap-8 md:gap-12">
        <Skeleton className="h-9 w-48" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((item) => (
            <Skeleton
              key={`related-event-${item}`}
              className="h-[320px] w-full rounded-2xl"
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default Loading;