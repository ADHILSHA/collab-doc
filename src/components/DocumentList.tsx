"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NewDocumentButton } from "./NewDocumentButton";
import { UploadDocumentButton } from "./UploadDocumentButton";

type BaseDoc = { id: string; title: string; updatedAtLabel: string };
type OwnedDoc = BaseDoc;
type SharedDoc = BaseDoc & { owner: { name: string; colorHex: string } };

export function DocumentList({
  owned,
  shared,
}: {
  owned: OwnedDoc[];
  shared: SharedDoc[];
}) {
  return (
    <>
      <section className="mb-10">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            My Documents
          </h2>
          <div className="flex items-center gap-2">
            <UploadDocumentButton />
            <NewDocumentButton />
          </div>
        </div>
        <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
          Upload creates a new document from a .txt or .md file. Other file
          types aren&apos;t supported.
        </p>
        {owned.length === 0 ? (
          <EmptyState text="No documents yet. Create one or upload a .txt/.md file to get started." />
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {owned.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} canDelete />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Shared with Me
        </h2>
        {shared.length === 0 ? (
          <EmptyState text="Nothing shared with you yet." />
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {shared.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                canDelete={false}
                ownerLabel={doc.owner.name}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
      {text}
    </div>
  );
}

function DocumentRow({
  doc,
  canDelete,
  ownerLabel,
}: {
  doc: BaseDoc;
  canDelete: boolean;
  ownerLabel?: string;
}) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(doc.title);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRename() {
    const trimmed = title.trim();
    setRenaming(false);
    if (!trimmed || trimmed === doc.title) {
      setTitle(doc.title);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Rename failed");
      setTitle(doc.title);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${doc.title}"? This can't be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Delete failed");
      setBusy(false);
    }
  }

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        {renaming ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setTitle(doc.title);
                setRenaming(false);
              }
            }}
            className="w-full border-b border-zinc-300 bg-transparent text-sm font-medium text-zinc-900 focus:outline-none dark:text-zinc-50"
          />
        ) : (
          <Link
            href={`/documents/${doc.id}`}
            className="truncate text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
          >
            {doc.title}
          </Link>
        )}
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {ownerLabel ? `Owner: ${ownerLabel} · ` : ""}
          Updated {doc.updatedAtLabel}
          {error && <span className="ml-2 text-red-500">{error}</span>}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-xs">
        <button
          onClick={() => setRenaming(true)}
          disabled={busy}
          className="rounded px-2 py-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Rename
        </button>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={busy}
            className="rounded px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}
