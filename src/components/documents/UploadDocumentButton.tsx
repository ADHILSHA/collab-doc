"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  getFileExtension,
  MAX_UPLOAD_SIZE_BYTES,
} from "@/lib/upload";
import { Button } from "@/components/ui/Button";

export function UploadDocumentButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (
      !ALLOWED_UPLOAD_EXTENSIONS.includes(
        getFileExtension(file.name) as "txt" | "md",
      )
    ) {
      toast.error("Only .txt and .md files are supported.");
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      toast.error("File is too large (max 1MB).");
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
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" asChild>
      <label
        className={
          loading ? "pointer-events-none cursor-default opacity-50" : "cursor-pointer"
        }
      >
        <Upload />
        {loading ? "Uploading…" : "Upload .txt/.md"}
        <input
          type="file"
          accept=".txt,.md,text/plain,text/markdown"
          className="hidden"
          disabled={loading}
          onChange={handleChange}
        />
      </label>
    </Button>
  );
}
