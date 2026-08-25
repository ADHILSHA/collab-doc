"use client";

import { Menu, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

export function Topbar({
  user,
  onMenuClick,
  onLogout,
}: {
  user: { name: string; colorHex: string };
  onMenuClick: () => void;
  onLogout: () => void | Promise<void>;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="focus-ring -ml-1.5 flex size-8 items-center justify-center rounded-md text-foreground hover:bg-surface-hover md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden md:block" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="focus-ring flex items-center gap-2 rounded-full p-0.5 hover:bg-surface-hover"
          >
            <Avatar name={user.name} colorHex={user.colorHex} size="sm" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => onLogout()}>
            <LogOut className="size-4" />
            Switch user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
