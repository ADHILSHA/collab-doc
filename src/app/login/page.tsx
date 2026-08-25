import { getAllUsers } from "@/lib/users";
import { loginAs } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const users = await getAllUsers();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-background px-4 py-16">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-lg bg-accent text-base font-bold text-accent-foreground">
          C
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Collab Doc
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Pick a user to continue. No password needed — this is a mock login
          for demo purposes.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {users.map((user) => (
          <form key={user.id} action={loginAs}>
            <input type="hidden" name="userId" value={user.id} />
            <button
              type="submit"
              className="focus-ring group flex w-36 flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
            >
              <span
                className="flex size-12 items-center justify-center rounded-full text-lg font-semibold text-white transition-transform group-hover:scale-105"
                style={{ backgroundColor: user.colorHex }}
              >
                {user.name.charAt(0)}
              </span>
              <span className="text-sm font-medium text-foreground">
                {user.name}
              </span>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
