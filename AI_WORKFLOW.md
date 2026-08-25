# AI Workflow Note

## Which AI tools I used

**Claude Code** (Claude Sonnet 5) was the primary and only tool — used
interactively in the terminal for the entire build, not as a one-shot
generator. The app was built phase by phase (scaffold → auth → document CRUD
→ rich text editing → file upload → sharing → validation/tests/docs → stretch
features), with a manual check in the browser after each phase before moving
on.

## Where AI materially sped up the work

- **Boilerplate and repetitive plumbing**: the Next.js scaffold, CRUD API
  routes, and the repeated pattern of auth-check → access-check → validate →
  respond across every route were generated quickly and consistently, which
  freed up time for the parts that actually needed product judgment (what
  sharing model to use, what to cut).
- **Diagnosing version-specific breakage fast**: this stack (Next.js 16,
  Prisma 7, TipTap v3) is newer than a lot of common training data, and a few
  things that "should" have worked didn't. Claude Code diagnosed these by
  reading actual error output and package internals rather than guessing:
  - Prisma 7's new `prisma-client` generator requires an explicit driver
    adapter (`@prisma/adapter-pg`) — it no longer connects from `DATABASE_URL`
    alone. Caught at typecheck time, fixed immediately.
  - TipTap's server-side `generateJSON` (used for Markdown import) threw "no
    window object available" even after polyfilling `window`/`document` with
    `jsdom`. Root cause turned out to be Turbopack statically inlining
    `typeof window === "undefined"` checks in bundled server code — fixed by
    marking `jsdom`/`@tiptap/core`/`@tiptap/starter-kit` as
    `serverExternalPackages` in `next.config.ts` so they run un-bundled. This
    took actually reading the compiled `.cjs` output and the dev server logs,
    not just retrying variations.
  - The original polling-based presence feature had a real bug: reported by
    manual testing as "the other person's avatar only shows up after I
    refresh." Claude Code reproduced it with a standalone script rather than
    guessing, found that Prisma's `upsert({ update: {} })` never touches an
    `@updatedAt` field when the update payload is empty (so a "heartbeat"
    silently stopped updating after the first write), and fixed it by setting
    the timestamp explicitly. That feature was later replaced entirely by
    Yjs awareness once real-time editing was added, but the debugging
    approach — reproduce first, then fix — is the same one used throughout.
- **End-to-end smoke testing via curl**: after each phase, Claude Code ran
  the dev server and exercised the real HTTP endpoints (401/403/404/400
  paths, not just happy paths) as part of its own verification before
  handing the phase back for manual review — faster than writing throwaway
  test scripts by hand for each phase.

## What AI-generated output I changed or rejected

- **Markdown parsing approach**: the first instinct was to hand-roll a small
  Markdown-to-TipTap-JSON converter to avoid extra dependencies. I rejected
  that in favor of reusing `marked` (Markdown → HTML) + TipTap's own
  `generateJSON` (HTML → ProseMirror JSON) — a well-tested library pairing
  beats a bespoke parser that would only handle a subset of Markdown
  correctly, even though it meant pulling in `jsdom` for server-side DOM
  parsing.
- **Test data hygiene**: several early smoke tests (via curl, driven by
  Claude Code) left behind test documents in the seeded dev database. Rather
  than leaving that as acceptable noise, each phase's verification explicitly
  checked and cleaned the database back to an empty state before being
  handed off, so manual testing wouldn't be confused by stale data.
- **Sharing granularity**: Claude Code's initial plan draft left some
  ambiguity on whether shared users could rename documents. I resolved this
  explicitly (shared users can edit and rename, but not share further or
  delete) rather than leaving it implicit, and had that reflected consistently
  in both the API authorization checks and the UI (no Share/Delete controls
  shown to non-owners).
- **Overriding the AI's own scope recommendation, deliberately**: for
  "real-time collaboration," Claude Code initially recommended (and I
  accepted) presence-only indicators — an avatar showing who else has a
  document open, polling every 5s — specifically to avoid the added
  infrastructure of a real WebSocket/CRDT server. After using it, I decided
  the assignment was better served by genuinely live editing, and directed
  a switch to that harder path. Claude Code then implemented it properly
  (Yjs + Hocuspocus, a second standalone process) rather than a shortcut
  broadcast hack, and in the process found and fixed a real bug in the
  presence feature being replaced (see below) — a case where pushing back on
  the AI's first, more conservative recommendation was the right call, and
  the AI executed the harder version faithfully once asked.

## How I verified correctness, UX quality, and reliability

- **Typecheck + lint on every change**: `tsc --noEmit` and `eslint` were run
  after every phase, not just at the end, so type errors and lint issues were
  caught immediately against the specific change that introduced them.
- **Live HTTP verification, not just code review**: every phase's API
  surface was exercised against the actual running dev server with curl —
  unauthenticated requests, cross-user access attempts, empty/invalid input,
  and successful flows — checking real status codes (401/403/404/400/200)
  rather than trusting the code by inspection alone.
- **One automated test as a regression guard**: `canAccessDocument`/
  `isOwner` (the function every document route relies on for authorization)
  is unit-tested with Vitest, since it's the single piece of logic where a
  regression would be a real security bug, not just a UX bug.
- **Manual browser verification, explicitly**: anything that can't be
  verified by an HTTP status code — toolbar formatting, editor visual
  rendering, drag/click interactions, whether autosave actually *feels*
  responsive — was left to be manually checked in the browser after each
  phase before proceeding, rather than assumed correct from the code.
- **Real multi-client verification for real-time features**: for both the
  presence feature and later live collaborative editing, verification wasn't
  just "the code compiles" — Claude Code wrote small standalone scripts that
  opened two independent WebSocket connections (as two different seeded
  users) against the actual running server, confirmed one user's edit is
  observed by the other within the sync window, confirmed a user without
  document access is rejected at the WebSocket layer too (not just the REST
  API), and confirmed edits actually land in Postgres — before ever opening
  two browser windows to eyeball it.
