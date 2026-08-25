"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Share2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";

type ShareUser = { id: string; name: string; colorHex: string };

export function ShareDialog({
  documentTitle,
  documentId,
  owner,
  sharedUsers,
  candidates,
}: {
  documentTitle: string;
  documentId: string;
  owner: ShareUser;
  sharedUsers: ShareUser[];
  candidates: ShareUser[];
}) {
  const router = useRouter();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  async function toggle(userId: string, isShared: boolean) {
    setPendingUserId(userId);
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
      toast.error("Couldn't update sharing. Try again.");
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Share2 />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share &ldquo;{documentTitle}&rdquo;</DialogTitle>
          <DialogDescription>
            People with access can view and edit this document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              People with access
            </p>
            <ul className="space-y-2">
              <li className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2.5">
                  <Avatar name={owner.name} colorHex={owner.colorHex} size="sm" />
                  <span className="truncate text-sm text-foreground">{owner.name}</span>
                </span>
                <Badge variant="neutral">Owner</Badge>
              </li>
              {sharedUsers.map((u) => {
                const isPending = pendingUserId === u.id;
                return (
                  <li key={u.id} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={u.name} colorHex={u.colorHex} size="sm" />
                      <span className="truncate text-sm text-foreground">{u.name}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <Badge variant="accent">Can edit</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${u.name}`}
                        disabled={isPending}
                        onClick={() => toggle(u.id, true)}
                        className="size-6 text-muted-foreground hover:text-error"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {candidates.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Add people
              </p>
              <ul className="space-y-2">
                {candidates.map((candidate) => {
                  const isPending = pendingUserId === candidate.id;
                  return (
                    <li
                      key={candidate.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Avatar name={candidate.name} colorHex={candidate.colorHex} size="sm" />
                        <span className="truncate text-sm text-foreground">
                          {candidate.name}
                        </span>
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isPending}
                        loading={isPending}
                        onClick={() => toggle(candidate.id, false)}
                        className="h-7 px-2 text-xs"
                      >
                        <UserPlus className="size-3.5" />
                        Add
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" size="sm">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
