"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";

export function AddCommentDialog({
  open,
  onOpenChange,
  quotedText,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotedText: string;
  onSubmit: (body: string) => Promise<void>;
}) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setBody("");
    } catch {
      toast.error("Couldn't add comment. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!submitting) {
          onOpenChange(next);
          if (!next) setBody("");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add comment</DialogTitle>
          <DialogDescription>
            &ldquo;{quotedText.length > 120 ? `${quotedText.slice(0, 120)}…` : quotedText}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <textarea
          autoFocus
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment…"
          rows={4}
          className="focus-ring w-full resize-none rounded-md border border-border bg-background p-2.5 text-sm text-foreground placeholder:text-muted-foreground"
        />

        <DialogFooter>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!body.trim()}
            loading={submitting}
          >
            Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
