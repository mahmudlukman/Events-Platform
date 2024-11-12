import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <section className="container mx-auto">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Skeleton
          key={item}
          className="h-60 w-full rounded-2xl"
        />
      ))}
    </div>
  </section>
  );
};

export default Loading;
