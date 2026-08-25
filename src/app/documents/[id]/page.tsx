import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth";
import { getDocumentWithAccess } from "@/lib/documents";
import { DocumentTitle } from "@/components/DocumentTitle";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const { doc, access } = await getDocumentWithAccess(id, user.id);

  if (!doc) notFound();

  if (!access) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-50 dark:bg-black">
        <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          You don&apos;t have access to this document.
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

  const isOwnerView = doc.ownerId === user.id;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          ← Dashboard
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <DocumentTitle documentId={doc.id} initialTitle={doc.title} />
          <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {isOwnerView ? "Owned by you" : `Shared by ${doc.owner.name}`}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Rich text editing lands in Phase 3.
        </div>
      </main>
    </div>
  );
}
