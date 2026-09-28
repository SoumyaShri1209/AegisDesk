import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="mb-5 space-y-2">
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="card p-4 h-[72vh] flex flex-col">
        <div className="flex-1 space-y-4">
          <div className="flex justify-end">
            <Skeleton className="h-10 w-56 rounded-2xl" />
          </div>
          <div className="flex justify-start">
            <Skeleton className="h-24 w-80 rounded-2xl" />
          </div>
        </div>
        <div className="border-t border-white/10 pt-3">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}