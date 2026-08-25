import { getAllUsers } from "@/lib/users";
import { loginAs } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const users = await getAllUsers();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-50 px-4 dark:bg-black">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Collab Doc
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
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
              className="flex w-40 flex-col items-center gap-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white"
                style={{ backgroundColor: user.colorHex }}
              >
                {user.name.charAt(0)}
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {user.name}
              </span>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
