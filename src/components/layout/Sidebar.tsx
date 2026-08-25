"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutGrid, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", hash: "", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard", hash: "#my-documents", label: "My Documents", icon: FileText },
  { href: "/dashboard", hash: "#shared", label: "Shared with Me", icon: Share2 },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-60 flex-col border-r border-border bg-surface px-3 py-4">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="focus-ring mb-6 flex items-center gap-2 rounded-md px-2 py-1"
      >
        <span className="flex size-7 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground">
          C
        </span>
        <span className="text-sm font-semibold text-foreground">Collab Doc</span>
      </Link>

      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.hash
            ? false
            : pathname === item.href || pathname.startsWith("/documents/");
          return (
            <li key={item.label}>
              <Link
                href={`${item.href}${item.hash}`}
                onClick={onNavigate}
                className={cn(
                  "focus-ring flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent-muted text-accent"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                )}
              >
                <item.icon className="size-4" strokeWidth={2} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-4 text-xs text-muted-foreground">
        <p className="px-2.5">Collab Doc · demo workspace</p>
      </div>
    </nav>
  );
}
