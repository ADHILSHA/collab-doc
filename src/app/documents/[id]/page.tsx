import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { requireCurrentUser } from "@/lib/auth";
import { getDocumentWithAccess } from "@/lib/documents";
import { getAllUsers } from "@/lib/users";
import { DocumentWorkspace } from "@/components/documents/DocumentWorkspace";
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
    <DocumentWorkspace
      documentId={doc.id}
      documentTitle={doc.title}
      isOwnerView={isOwnerView}
      owner={doc.owner}
      sharedUsers={sharedUsers}
      candidates={candidates}
      currentUser={{ id: user.id, name: user.name, colorHex: user.colorHex }}
    />
  );
}
