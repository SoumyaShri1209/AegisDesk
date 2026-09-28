import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        {[1, 2].map((i) => (
          <div key={i} className="card p-4 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="card p-4 space-y-3">
            <Skeleton className="h-4 w-28" />
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}