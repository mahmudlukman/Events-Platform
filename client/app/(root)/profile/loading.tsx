import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <section className="wrapper my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((item) => (
          <Skeleton
            key={`ticket-${item}`}
            className="h-[320px] w-full rounded-2xl"
          />
        ))}
      </div>
    </section>
  );
};

export default Loading;
