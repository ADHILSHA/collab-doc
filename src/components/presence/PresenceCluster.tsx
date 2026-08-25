import { Avatar } from "@/components/ui/Avatar";
import { Tooltip } from "@/components/ui/Tooltip";

type Viewer = { id: string; name: string; colorHex: string };

export function PresenceCluster({ viewers }: { viewers: Viewer[] }) {
  if (viewers.length === 0) return null;

  const shown = viewers.slice(0, 4);
  const overflow = viewers.length - shown.length;

  return (
    <div
      className="flex items-center -space-x-2"
      aria-label="Other people viewing this document"
    >
      {shown.map((viewer) => (
        <Tooltip key={viewer.id} content={`${viewer.name} is viewing`}>
          <Avatar name={viewer.name} colorHex={viewer.colorHex} size="sm" />
        </Tooltip>
      ))}
      {overflow > 0 && (
        <span className="ml-1.5 text-xs text-muted-foreground">+{overflow}</span>
      )}
    </div>
  );
}
