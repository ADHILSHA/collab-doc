import { Skeleton } from "@/components/ui/Skeleton";

export default function DocumentLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-surface px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-7 flex-1 max-w-sm" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Skeleton className="mb-2 h-11 w-full" />
        <div className="space-y-3 rounded-b-lg border border-t-0 border-border p-6">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </main>
    </div>
  );
}
