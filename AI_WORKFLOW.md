# AI Workflow Note

## Which AI tools I used

**Claude Code** (Claude Sonnet 5) was the primary and only tool — used
interactively in the terminal for the entire build, not as a one-shot
generator. The app was built phase by phase (scaffold → auth → document CRUD
→ rich text editing → file upload → sharing → validation/tests/docs), with a
manual check in the browser after each phase before moving on.

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
