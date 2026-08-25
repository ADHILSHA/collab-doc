import { requireCurrentUser } from "@/lib/auth";
import { getDocumentsForUser } from "@/lib/documents";
import { formatRelativeTime } from "@/lib/format";
import { AppShell } from "@/components/layout/AppShell";
import { DocumentsView } from "@/components/documents/DocumentsView";
import { logout } from "./actions";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const { owned, shared } = await getDocumentsForUser(user.id);

  return (
    <AppShell user={{ name: user.name, colorHex: user.colorHex }} onLogout={logout}>
      <div className="border-b border-border bg-surface px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {getGreeting()}, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your documents.
          </p>
        </div>
      </div>

      <DocumentsView
        owned={owned.map((doc) => ({
          id: doc.id,
          title: doc.title,
          updatedAtLabel: formatRelativeTime(doc.updatedAt),
          updatedAt: doc.updatedAt.toISOString(),
        }))}
        shared={shared.map((doc) => ({
          id: doc.id,
          title: doc.title,
          updatedAtLabel: formatRelativeTime(doc.updatedAt),
          updatedAt: doc.updatedAt.toISOString(),
          owner: doc.owner,
        }))}
      />
    </AppShell>
  );
}
