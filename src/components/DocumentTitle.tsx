"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DocumentTitle({
  documentId,
  initialTitle,
}: {
  documentId: string;
  initialTitle: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function save() {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(initialTitle);
      return;
    }
    if (trimmed === initialTitle) return;

    setStatus("saving");
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res.ok) throw new Error();
      setStatus("saved");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="w-full max-w-lg border-b border-transparent bg-transparent text-xl font-semibold text-zinc-900 focus:border-zinc-300 focus:outline-none dark:text-zinc-50"
      />
      {status === "saving" && (
        <span className="shrink-0 text-xs text-zinc-400">Saving…</span>
      )}
      {status === "saved" && (
        <span className="shrink-0 text-xs text-emerald-500">Saved</span>
      )}
      {status === "error" && (
        <span className="shrink-0 text-xs text-red-500">Couldn&apos;t save</span>
      )}
    </div>
  );
}
