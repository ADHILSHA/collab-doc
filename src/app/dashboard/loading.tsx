import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden w-60 shrink-0 border-r border-border bg-surface p-4 md:block">
        <Skeleton className="mb-6 h-7 w-32" />
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-14 shrink-0 items-center justify-end border-b border-border bg-surface px-6">
          <Skeleton className="size-8 rounded-full" />
        </div>
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="mb-8 h-9 w-full max-w-md" />
          <Skeleton className="mb-3 h-5 w-24" />
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="mb-3 h-5 w-32" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
