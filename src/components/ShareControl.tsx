"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ShareUser = { id: string; name: string; colorHex: string };

export function ShareControl({
  documentId,
  candidates,
  sharedUserIds,
}: {
  documentId: string;
  candidates: ShareUser[];
  sharedUserIds: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sharedSet = new Set(sharedUserIds);

  async function toggle(userId: string, isShared: boolean) {
    setPendingUserId(userId);
    setError(null);
    try {
      const res = isShared
        ? await fetch(`/api/documents/${documentId}/share/${userId}`, {
            method: "DELETE",
          })
        : await fetch(`/api/documents/${documentId}/share`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Couldn't update sharing. Try again.");
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Share
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Share with
            </p>
            {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
            {candidates.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No other users to share with.
              </p>
            ) : (
              <ul className="space-y-2">
                {candidates.map((candidate) => {
                  const isShared = sharedSet.has(candidate.id);
                  const isPending = pendingUserId === candidate.id;
                  return (
                    <li
                      key={candidate.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-2 text-sm text-zinc-900 dark:text-zinc-50">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: candidate.colorHex }}
                        >
                          {candidate.name.charAt(0)}
                        </span>
                        {candidate.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggle(candidate.id, isShared)}
                        disabled={isPending}
                        className={`shrink-0 rounded px-2 py-1 text-xs font-medium disabled:opacity-50 ${
                          isShared
                            ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {isPending ? "…" : isShared ? "Remove" : "Add"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
