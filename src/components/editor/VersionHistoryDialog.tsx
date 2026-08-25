"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { History, RotateCcw } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
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

export type VersionT = {
  id: string;
  title: string;
  createdAt: string;
  createdBy: { id: string; name: string; colorHex: string };
};

export function VersionHistoryDialog({
  open,
  onOpenChange,
  documentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Version history</DialogTitle>
          <DialogDescription>
            Checkpoints are saved automatically as the document is edited.
            Restoring saves your current content as a version first, so it
            isn&apos;t lost.
          </DialogDescription>
        </DialogHeader>

        {/* Remounted every time the dialog opens, so its fetch always
            starts fresh instead of resetting state inside an effect. */}
        {open && <VersionList key={documentId} documentId={documentId} />}
      </DialogContent>
    </Dialog>
  );
}

function VersionList({ documentId }: { documentId: string }) {
  const [versions, setVersions] = useState<VersionT[] | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/documents/${documentId}/versions`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: VersionT[]) => {
        if (!cancelled) setVersions(data);
      })
      .catch(() => {
        if (!cancelled) setVersions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  async function handleRestore(versionId: string) {
    if (
      !confirm(
        "Restore this version? Your current content will be saved as a version too, so you can undo this.",
      )
    ) {
      return;
    }
    setRestoringId(versionId);
    try {
      const res = await fetch(
        `/api/documents/${documentId}/versions/${versionId}/restore`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error();
      toast.success("Version restored. Reloading…");
      window.location.reload();
    } catch {
      toast.error("Couldn't restore this version. Try again.");
      setRestoringId(null);
    }
  }

  if (versions === null) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No earlier versions yet"
        description="A checkpoint is saved automatically a few minutes into your first editing session."
      />
    );
  }

  return (
    <ul className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
      {versions.map((version) => (
        <li
          key={version.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar
              name={version.createdBy.name}
              colorHex={version.createdBy.colorHex}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {version.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {version.createdBy.name} ·{" "}
                {formatRelativeTime(new Date(version.createdAt))}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            disabled={restoringId === version.id}
            loading={restoringId === version.id}
            onClick={() => handleRestore(version.id)}
            className="h-7 shrink-0 px-2 text-xs"
          >
            <RotateCcw className="size-3.5" />
            Restore
          </Button>
        </li>
      ))}
    </ul>
  );
}
