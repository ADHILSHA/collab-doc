import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import type { JSONContent } from "@tiptap/react";
import { requireCurrentUser } from "@/lib/auth";
import { getDocumentWithAccess } from "@/lib/documents";
import { getAllUsers } from "@/lib/users";
import { DocumentTitle } from "@/components/documents/DocumentTitle";
import { DocumentEditor } from "@/components/editor/DocumentEditor";
import { PresenceIndicator } from "@/components/presence/PresenceIndicator";
import { ShareDialog } from "@/components/sharing/ShareDialog";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const { doc, access } = await getDocumentWithAccess(id, user.id);

  if (!doc) notFound();

  if (!access) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <EmptyState
          icon={Lock}
          title="You don't have access to this document"
          description="Ask the owner to share it with you."
          action={
            <Button asChild variant="primary" size="sm">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const isOwnerView = doc.ownerId === user.id;
  const allUsers = isOwnerView ? await getAllUsers() : [];
  const sharedUserIds = new Set(doc.shares.map((s) => s.userId));
  const candidates = allUsers.filter(
    (u) => u.id !== user.id && !sharedUserIds.has(u.id),
  );
  const sharedUsers = doc.shares.map((s) => s.user);

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
            <DocumentTitle documentId={doc.id} initialTitle={doc.title} />
            <Badge variant="neutral" className="hidden shrink-0 sm:inline-flex">
              {isOwnerView ? "Owned by you" : `Shared by ${doc.owner.name}`}
            </Badge>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {isOwnerView && (
              <ShareDialog
                documentTitle={doc.title}
                documentId={doc.id}
                owner={doc.owner}
                sharedUsers={sharedUsers}
                candidates={candidates}
              />
            )}
            <div className="flex items-center -space-x-2">
              <PresenceIndicator documentId={doc.id} />
              <Avatar name={user.name} colorHex={user.colorHex} size="sm" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <DocumentEditor
          documentId={doc.id}
          currentUserId={user.id}
          isOwner={isOwnerView}
          initialContent={doc.content as unknown as JSONContent}
        />
      </main>
    </div>
  );
}
