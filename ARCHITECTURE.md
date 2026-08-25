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

- **Real-time collaboration** (live cursors, presence, concurrent-edit
  merging). Autosave + refresh is the model; two users editing the same
  document at the same time will have last-write-wins behavior. Out of scope
  per the brief's own stretch-goal list.
- **Granular sharing roles** (view-only vs. edit) and revoke history.
- **Document version history** and **export to PDF/Markdown** — both listed
  as optional stretch goals in the brief; not started so the core slices
  could be solid instead of shallow.
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
