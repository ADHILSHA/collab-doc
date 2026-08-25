"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";

export type BaseDoc = { id: string; title: string; updatedAtLabel: string };
type OwnedDoc = BaseDoc;
type SharedDoc = BaseDoc & { owner: { name: string; colorHex: string } };

export function DocumentRow({
  doc,
  canDelete,
  ownerLabel,
}: {
  doc: OwnedDoc | SharedDoc;
  canDelete: boolean;
  ownerLabel?: string;
}) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(doc.title);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleRename() {
    const trimmed = title.trim();
    setRenaming(false);
    if (!trimmed) {
      setTitle(doc.title);
      toast.error("Title can't be empty");
      return;
    }
    if (trimmed === doc.title) {
      setTitle(doc.title);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Rename failed");
      setTitle(doc.title);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setConfirmOpen(false);
    setBusy(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`"${doc.title}" deleted`);
      router.refresh();
    } catch {
      toast.error("Delete failed");
      setBusy(false);
    }
  }

  return (
    <li className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <FileText className="size-4 text-muted-foreground" strokeWidth={1.75} />
      </div>

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
            className="focus-ring w-full max-w-sm rounded border-b border-border-strong bg-transparent text-sm font-medium text-foreground"
          />
        ) : (
          <Link
            href={`/documents/${doc.id}`}
            className="focus-ring truncate text-sm font-medium text-foreground hover:text-accent"
          >
            {doc.title}
          </Link>
        )}
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {ownerLabel ? `Owner: ${ownerLabel} · ` : ""}
          Updated {doc.updatedAtLabel}
        </p>
      </div>

      {"owner" in doc && (
        <Avatar name={doc.owner.name} colorHex={doc.owner.colorHex} size="sm" className="hidden sm:flex" />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={busy}
            aria-label="More actions"
            className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 focus-visible:opacity-100"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={() => {
              setTitle(doc.title);
              setRenaming(true);
            }}
          >
            <Pencil className="size-4" />
            Rename
          </DropdownMenuItem>
          {canDelete && (
            <DropdownMenuItem
              onSelect={() => setConfirmOpen(true)}
              className="text-error data-[highlighted]:bg-error-muted"
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{doc.title}&rdquo;?</DialogTitle>
            <DialogDescription>
              This can&apos;t be undone. The document will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}
