"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

export function DocumentTitle({
  documentId,
  initialTitle,
}: {
  documentId: string;
  initialTitle: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "error" | "empty"
  >("idle");

  async function save() {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(initialTitle);
      setStatus("empty");
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
    <div className="flex min-w-0 items-center gap-2.5">
      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setStatus("idle");
        }}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        aria-label="Document title"
        className="focus-ring min-w-0 flex-1 rounded-sm border-b border-transparent bg-transparent text-lg font-semibold text-foreground transition-colors hover:border-border focus:border-border-strong sm:text-xl"
      />
      {status === "saving" && (
        <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
      )}
      {status === "saved" && (
        <Check className="size-3.5 shrink-0 text-success" />
      )}
      {status === "error" && (
        <span className="shrink-0 text-xs text-error">Couldn&apos;t save</span>
      )}
      {status === "empty" && (
        <span className="shrink-0 text-xs text-error">Title can&apos;t be empty</span>
      )}
    </div>
  );
}
