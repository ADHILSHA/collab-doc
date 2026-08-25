import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-50 dark:bg-black">
      <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
        We couldn&apos;t find that page.
      </p>
      <Link
        href="/dashboard"
        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
