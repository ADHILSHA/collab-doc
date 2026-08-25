"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, MessageSquare, RotateCcw, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";

export type CommentT = {
  id: string;
  body: string;
  quotedText: string;
  resolved: boolean;
  createdAt: string;
  author: { id: string; name: string; colorHex: string };
};

export function CommentsDialog({
  open,
  onOpenChange,
  comments,
  canDelete,
  focusedCommentId,
  onToggleResolved,
  onDelete,
  onFocusAnchor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comments: CommentT[];
  canDelete: (comment: CommentT) => boolean;
  focusedCommentId: string | null;
  onToggleResolved: (commentId: string, resolved: boolean) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onFocusAnchor: (commentId: string) => void;
}) {
  const unresolved = comments.filter((c) => !c.resolved);
  const resolved = comments.filter((c) => c.resolved);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>
            Comments are anchored to the text they were added on.
          </DialogDescription>
        </DialogHeader>

        {comments.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No comments yet"
            description="Select text in the document and click Comment to start a discussion."
          />
        ) : (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            {unresolved.length > 0 && (
              <ul className="space-y-2">
                {unresolved.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    isFocused={focusedCommentId === comment.id}
                    canDelete={canDelete(comment)}
                    onToggleResolved={onToggleResolved}
                    onDelete={onDelete}
                    onFocusAnchor={onFocusAnchor}
                  />
                ))}
              </ul>
            )}

            {resolved.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Resolved
                </p>
                <ul className="space-y-2">
                  {resolved.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      isFocused={focusedCommentId === comment.id}
                      canDelete={canDelete(comment)}
                      onToggleResolved={onToggleResolved}
                      onDelete={onDelete}
                      onFocusAnchor={onFocusAnchor}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CommentItem({
  comment,
  isFocused,
  canDelete,
  onToggleResolved,
  onDelete,
  onFocusAnchor,
}: {
  comment: CommentT;
  isFocused: boolean;
  canDelete: boolean;
  onToggleResolved: (commentId: string, resolved: boolean) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onFocusAnchor: (commentId: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (isFocused) ref.current?.scrollIntoView({ block: "nearest" });
  }, [isFocused]);

  async function handleToggle() {
    setBusy(true);
    try {
      await onToggleResolved(comment.id, !comment.resolved);
    } catch {
      toast.error("Couldn't update comment. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this comment?")) return;
    setBusy(true);
    try {
      await onDelete(comment.id);
    } catch {
      toast.error("Couldn't delete comment. Try again.");
      setBusy(false);
    }
  }

  return (
    <li
      ref={ref}
      className={`rounded-lg border p-3 transition-colors ${
        isFocused
          ? "border-accent bg-accent-muted"
          : "border-border bg-surface"
      } ${comment.resolved ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={comment.author.name} colorHex={comment.author.colorHex} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {comment.author.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(new Date(comment.createdAt))}
            </p>
          </div>
        </div>
        {comment.resolved && <Badge variant="success">Resolved</Badge>}
      </div>

      {comment.quotedText && (
        <button
          type="button"
          onClick={() => onFocusAnchor(comment.id)}
          className="focus-ring mt-2 block w-full truncate rounded border-l-2 border-warning bg-warning-muted px-2 py-1 text-left text-xs text-muted-foreground italic hover:text-foreground"
          title="Jump to this text in the document"
        >
          &ldquo;{comment.quotedText}&rdquo;
        </button>
      )}

      <p className="mt-2 text-sm text-foreground">{comment.body}</p>

      <div className="mt-2 flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          disabled={busy}
          className="h-7 px-2 text-xs"
        >
          {comment.resolved ? (
            <>
              <RotateCcw className="size-3.5" />
              Reopen
            </>
          ) : (
            <>
              <Check className="size-3.5" />
              Resolve
            </>
          )}
        </Button>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={busy}
            className="h-7 px-2 text-xs text-error hover:text-error"
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        )}
      </div>
    </li>
  );
}
