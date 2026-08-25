"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

export function NewDocumentButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to create document");
      const doc = await res.json();
      router.push(`/documents/${doc.id}`);
    } catch {
      toast.error("Couldn't create a document. Try again.");
      setLoading(false);
    }
  }

  return (
    <Button variant="primary" size="sm" onClick={handleClick} loading={loading}>
      <Plus />
      New document
    </Button>
  );
}
