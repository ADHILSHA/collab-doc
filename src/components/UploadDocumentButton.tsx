"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

const ALLOWED_EXTENSIONS = ["txt", "md"];

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.slice(idx + 1).toLowerCase();
}

export function UploadDocumentButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);

    if (!ALLOWED_EXTENSIONS.includes(getExtension(file.name))) {
      setError("Only .txt and .md files are supported.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}) as { error?: string });
        throw new Error(body.error || "Upload failed");
      }
      const doc = await res.json();
      router.push(`/documents/${doc.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-500">{error}</span>}
      <label className="cursor-pointer rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
        {loading ? "Uploading…" : "Upload .txt/.md"}
        <input
          type="file"
          accept=".txt,.md,text/plain,text/markdown"
          className="hidden"
          disabled={loading}
          onChange={handleChange}
        />
      </label>
    </div>
  );
}
