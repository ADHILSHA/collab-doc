"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { useEditor, useEditorState } from "@tiptap/react";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { ArrowLeft } from "lucide-react";
import { getSharedExtensions } from "@/lib/editor-extensions";
import { DocumentTitle } from "@/components/documents/DocumentTitle";
import { DocumentEditor } from "@/components/editor/DocumentEditor";
import { ShareDialog } from "@/components/sharing/ShareDialog";
import { PresenceCluster } from "@/components/presence/PresenceCluster";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

const COLLAB_WS_URL =
  process.env.NEXT_PUBLIC_COLLAB_WS_URL ?? "ws://localhost:1234";

type ShareUser = { id: string; name: string; colorHex: string };

export function DocumentWorkspace({
  documentId,
  documentTitle,
  isOwnerView,
  owner,
  sharedUsers,
  candidates,
  currentUser,
}: {
  documentId: string;
  documentTitle: string;
  isOwnerView: boolean;
  owner: ShareUser;
  sharedUsers: ShareUser[];
  candidates: ShareUser[];
  currentUser: { id: string; name: string; colorHex: string };
}) {
  const [connection, setConnection] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  const { ydoc, provider } = useMemo(() => {
    const ydoc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: COLLAB_WS_URL,
      name: documentId,
      document: ydoc,
      token: currentUser.id,
    });
    return { ydoc, provider };
  }, [documentId, currentUser.id]);

  useEffect(() => {
    const handleStatus = ({ status }: { status: string }) => {
      setConnection(status as "connecting" | "connected" | "disconnected");
    };
    provider.on("status", handleStatus);
    return () => {
      provider.off("status", handleStatus);
      provider.destroy();
      ydoc.destroy();
    };
  }, [provider, ydoc]);

  const editor = useEditor(
    {
      extensions: [
        ...getSharedExtensions(),
        Collaboration.configure({ document: ydoc }),
        CollaborationCaret.configure({
          provider,
          user: {
            id: currentUser.id,
            name: currentUser.name,
            color: currentUser.colorHex,
          },
        }),
      ],
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            "prose prose-zinc dark:prose-invert max-w-none min-h-[60vh] focus:outline-none",
        },
      },
    },
    [ydoc, provider],
  );

  const viewers = useEditorState({
    editor,
    selector: (ctx) =>
      (ctx.editor?.storage.collaborationCaret?.users ?? []) as {
        clientId: number;
        id?: string;
        name?: string;
        color?: string;
      }[],
  });

  const otherViewers = (viewers ?? [])
    .filter((v) => v.id && v.id !== currentUser.id && v.name && v.color)
    .filter(
      (v, index, arr) => arr.findIndex((o) => o.id === v.id) === index,
    ) as { id: string; name: string; color: string }[];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="focus-ring flex shrink-0 items-center gap-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Documents</span>
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <DocumentTitle documentId={documentId} initialTitle={documentTitle} />
            <Badge variant="neutral" className="hidden shrink-0 sm:inline-flex">
              {isOwnerView ? "Owned by you" : `Shared by ${owner.name}`}
            </Badge>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {isOwnerView && (
              <ShareDialog
                documentTitle={documentTitle}
                documentId={documentId}
                owner={owner}
                sharedUsers={sharedUsers}
                candidates={candidates}
              />
            )}
            <div className="flex items-center -space-x-2">
              <PresenceCluster
                viewers={otherViewers.map((v) => ({
                  id: v.id,
                  name: v.name,
                  colorHex: v.color,
                }))}
              />
              <Avatar
                name={currentUser.name}
                colorHex={currentUser.colorHex}
                size="sm"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <DocumentEditor
          editor={editor}
          documentId={documentId}
          currentUserId={currentUser.id}
          isOwner={isOwnerView}
          connectionStatus={connection}
        />
      </main>
    </div>
  );
}
