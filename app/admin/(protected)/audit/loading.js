import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="card divide-y divide-white/5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 flex items-start gap-3">
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}