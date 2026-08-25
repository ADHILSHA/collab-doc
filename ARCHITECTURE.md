# Architecture Note

## Stack choices, and why

**Next.js (App Router), single app.** The assignment spans frontend, backend,
persistence, and access logic under a tight timebox. A single Next.js app
(API routes as the backend) meant one deployable unit, one repo, and no
frontend/backend context-switching — more time for the actual product
surfaces (editor, upload, sharing) and less for plumbing.

**Postgres (Neon) + Prisma, not SQLite.** The target deploy path is a
serverless host (Vercel), whose filesystem is ephemeral — a SQLite file would
not survive between requests without extra infrastructure (a mounted volume,
Turso, etc.). Neon's free tier gives a real Postgres database with zero local
setup, and Prisma gives migrations and type-safe queries for cheap.

**TipTap for editing.** It stores content as JSON that maps directly onto a
Postgres `Json` column — no separate serialization/deserialization format to
design, and the same JSON round-trips cleanly through autosave, reload, file
import, and (implicitly) sharing, since every reader sees the same structure.

**Mock/seeded auth, not real accounts.** The assignment explicitly allows
this. Building real signup/login/session infra would have consumed a large
share of the timebox on a part of the app that isn't what's being evaluated.
A cookie holding a seeded user's id keeps the *interesting* problem — access
control on documents — fully real and testable, while the login mechanism
itself stays intentionally thin.

**Binary sharing (owner vs. shared), not role-based permissions.** The brief
asks for "a way to grant another user access" and "a visible distinction
between owned and shared documents," not granular roles. Every shared user
gets edit access. This was a deliberate scope cut to spend the available time
making ownership/access enforcement *correct and consistent* (checked
server-side on every read/write route, not just hidden in the UI) rather than
spreading effort across multiple permission tiers.

**Centralized access control.** `canAccessDocument` / `isOwner`
(`src/lib/permissions.ts`) are the single source of truth for "can this user
see/edit/delete this document," used by every API route. This was worth the
small upfront abstraction because it's the one piece of logic where a bug
means a real information-disclosure bug — it's also the one function covered
by the automated test, since it's the highest-value thing to keep correct as
the code changes.

**File upload creates a new document, not a generic attachment.** Of the
options the brief allows, this one exercises the most real product logic
(actually parsing and transforming content into the same rich-text format the
editor uses) rather than just storing a blob. Scope is intentionally narrow:
`.txt` and `.md` only, capped at 1MB, both validated client- and server-side,
clearly stated in the UI and README rather than silently failing on other
types.

## Stretch features (post-core build)

After the five core requirements were solid, the build continued into the
brief's own "optional stretch" list: presence indicators → comments →
document version history (export and role-based permissions are next).

**Presence via polling, not WebSockets.** Vercel's serverless functions can't
hold a persistent connection, so "who's viewing this document" is a
DB-backed heartbeat (`DocumentPresence`, upserted every ~5s and polled by
other viewers), not a live socket. Full real-time co-editing was prototyped
on a separate branch using Yjs + a standalone WebSocket server, but was
pulled back out of this branch to keep it shippable and revisit later with
more time — see the AI workflow note.

**Comments over suggestion mode.** The brief accepts either. Comments are
anchored to text via a custom, permanent TipTap mark (`commentId` in the
mark's attrs); resolving/reopening a comment is a pure database flag flip,
never a content mutation — so there's no risk of losing or misplacing an
anchor when a comment's state changes. Suggestion/track-changes mode
(accept/reject-able tracked insertions per user) is a meaningfully larger
feature — effectively rebuilding what dedicated paid collaboration tooling
does — and was judged higher-risk to implement well under remaining time.

**Version history as throttled automatic checkpoints, not per-keystroke.**
Content autosaves ~1s after typing stops, which would create an unusable
number of versions if every save were versioned. Instead, a snapshot of the
document's *current* state is taken right before an incoming save overwrites
it, but only if the last snapshot is more than 5 minutes old — a simple
time-based throttle rather than diffing content to detect "meaningful"
changes, which would be far more complex for marginal benefit at this scope.
Restoring a version snapshots the current state first, so restoring is
itself always undoable — there's no scenario where hitting "Restore" can
lose work permanently.

## What was prioritized

Given the "depth over breadth" guidance, each core requirement (editing,
upload, sharing, persistence, access control) was built as a complete
vertical slice — API route, server-side validation, and UI — before moving
to the next, rather than sketching all five shallowly and polishing later.
Validation/error handling and the automated test were done as an explicit
final pass once all five slices worked, so they'd reflect the real edge cases
that showed up while building (e.g. empty file uploads, oversized content,
empty titles) rather than guessed-at ones.

## What was deliberately deprioritized

- **Live co-editing** (real-time concurrent editing with conflict-free
  merging, not just presence). Prototyped separately with Yjs + a standalone
  WebSocket server; pulled back out to keep this branch focused and shippable
  — planned as a follow-up once the remaining stretch items are done.
- **Granular sharing roles** (view-only vs. edit) and revoke history — next
  up.
- **Export to PDF/Markdown** — listed as an optional stretch goal in the
  brief; not yet started.
- **Suggestion/track-changes mode** — comments were chosen instead (see
  above).
- **Rich `.docx` import** — parsing real Word documents (vs. plain
  text/Markdown) is a meaningfully larger problem (binary format, styles,
  images) that wasn't worth the time against the core requirements.

## Notable trade-offs worth knowing about

- Sharing and access checks are enforced server-side on every route (not just
  hidden in the UI), but there's no audit log of who accessed what, when.
- Autosave has no conflict detection — if two sessions edit the same document
  concurrently, the last PATCH to land wins silently.
- Upload parsing (`.md` → TipTap JSON) goes through `marked` (Markdown → HTML)
  and TipTap's `generateJSON` (HTML → ProseMirror JSON) rather than a
  hand-rolled parser, trading a couple of extra dependencies (`marked`,
  `jsdom` for server-side DOM parsing) for correctness on real-world Markdown
  edge cases instead of maintaining a bespoke subset parser.
