import Link from "next/link";
import { FileText } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

export type RecentDoc = {
  id: string;
  title: string;
  updatedAtLabel: string;
  owner?: { name: string; colorHex: string };
};

export function RecentCard({ doc }: { doc: RecentDoc }) {
  return (
    <Link
      href={`/documents/${doc.id}`}
      className="focus-ring group flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm"
    >
      <div className="flex h-20 items-center justify-center rounded-md bg-muted">
        <FileText className="size-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground group-hover:text-accent">
          {doc.title}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          {doc.owner && (
            <Avatar name={doc.owner.name} colorHex={doc.owner.colorHex} size="sm" className="size-4 text-[9px]" />
          )}
          <span>Edited {doc.updatedAtLabel}</span>
        </div>
      </div>
    </Link>
  );
}
