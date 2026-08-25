"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-error-muted">
        <AlertTriangle className="size-6 text-error" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-base font-medium text-foreground">
          Something went wrong.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          An unexpected error occurred. You can try again.
        </p>
      </div>
      <Button variant="primary" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
