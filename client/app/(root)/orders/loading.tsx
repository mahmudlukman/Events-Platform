import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
      <section className="wrapper mt-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </section>
  );
};

export default Loading;
