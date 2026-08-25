"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Tooltip } from "@/components/ui/Tooltip";

const POLL_INTERVAL_MS = 5000;

type Viewer = { id: string; name: string; colorHex: string };

export function PresenceIndicator({ documentId }: { documentId: string }) {
  const [viewers, setViewers] = useState<Viewer[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function beat() {
      try {
        const res = await fetch(`/api/documents/${documentId}/presence`, {
          method: "POST",
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { viewers?: Viewer[] };
        setViewers(data.viewers ?? []);
      } catch {
        // Presence is best-effort UI sugar; silently ignore failures.
      }
    }

    beat();
    const interval = setInterval(beat, POLL_INTERVAL_MS);

    // Browsers throttle setInterval in backgrounded tabs, which can leave a
    // tab's heartbeat stale for well over the active window while it's
    // hidden. Firing one immediately on refocus keeps switching between
    // tabs/windows (the common way to test this) from looking broken.
    function onVisibilityChange() {
      if (document.visibilityState === "visible") beat();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      fetch(`/api/documents/${documentId}/presence`, {
        method: "DELETE",
        keepalive: true,
      }).catch(() => {});
    };
  }, [documentId]);

  if (viewers.length === 0) return null;

  const shown = viewers.slice(0, 4);
  const overflow = viewers.length - shown.length;

  return (
    <div className="flex items-center" aria-label="Other people viewing this document">
      <div className="flex -space-x-2">
        {shown.map((viewer) => (
          <Tooltip key={viewer.id} content={`${viewer.name} is viewing`}>
            <Avatar name={viewer.name} colorHex={viewer.colorHex} size="sm" />
          </Tooltip>
        ))}
      </div>
      {overflow > 0 && (
        <span className="ml-1.5 text-xs text-muted-foreground">+{overflow}</span>
      )}
    </div>
  );
}
