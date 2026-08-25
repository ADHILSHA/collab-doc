import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="size-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-base font-medium text-foreground">
          We couldn&apos;t find that page.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          It may have been moved or deleted.
        </p>
      </div>
      <Button asChild variant="primary" size="sm">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
