import { requireCurrentUser } from "@/lib/auth";
import { logout } from "./actions";

export default async function DashboardPage() {
  const user = await requireCurrentUser();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: user.colorHex }}
          >
            {user.name.charAt(0)}
          </span>
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              {user.name}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Logged in
            </p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Switch user
          </button>
        </form>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            My Documents
          </h2>
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No documents yet. Document creation lands in Phase 2.
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Shared with Me
          </h2>
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            Nothing shared with you yet.
          </div>
        </section>
      </main>
    </div>
  );
}
