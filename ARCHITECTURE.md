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
brief's own "optional stretch" list, in this order: presence indicators →
comments → **real-time collaborative editing** (an explicit, deliberate scope
increase beyond "indicators" — see below) → version history → export →
role-based sharing permissions.

**Yjs + Hocuspocus for real-time editing, not a hand-rolled broadcast.**
Once genuinely live co-editing (not just presence) was in scope, the choice
was between (a) a simple WebSocket broadcast of full-document snapshots, or
(b) a proper CRDT (Yjs), which is what TipTap officially supports via
`@tiptap/extension-collaboration`. Broadcasting snapshots is meaningfully
worse: every incoming update resets the *other* user's cursor position and
has no real conflict resolution for concurrent edits. Yjs solves both
correctly and is the standard, well-tested tool for exactly this problem —
consistent with this project's general bias toward reusing a well-tested
library over reinventing a narrower version of what it does (see the
Markdown-import trade-off below).

**A second, standalone WebSocket server, not a bigger Vercel function.**
Vercel's serverless functions terminate per-request and can't hold a
persistent WebSocket connection, so real-time sync can't live inside a
Next.js API route on that host. `collab-server/` is a small standalone Node
process (Hocuspocus) that shares the same Postgres database and the same
`canAccessDocument` authorization check as the main app, authenticated with
the same seeded-user id used everywhere else — deliberately not a new auth
mechanism, to stay consistent with the project's existing mock-auth model
rather than adding JWT/token-signing infrastructure for a single feature.

**Two content representations, kept in sync.** `Document.content` (JSON) is
still the format everything else reads (upload, the REST API, and — soon —
export); `Document.yjsState` (binary) is the live CRDT state. The collab
server's persistence hook writes both on every save, and seeds a document's
first-ever Yjs state from its existing JSON `content` the first time it's
opened collaboratively, so no manual migration step was needed for documents
created before this feature existed.

**Comments over suggestion mode.** The brief accepts either. Comments are
anchored to text via a custom, permanent TipTap mark (`commentId` in the
mark's attrs); resolving/reopening a comment is a pure database flag flip,
never a content mutation — so there's no risk of losing or misplacing an
anchor when a comment's state changes, which would be a real risk if resolve
tried to remove-then-restore the mark. Suggestion/track-changes mode (showing
edits as accept/reject-able insertions with per-user diffing) is a
meaningfully larger feature — effectively rebuilding what dedicated
paid collaboration tooling does — and was judged higher-risk to implement
well under remaining time than comments.

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

- **Granular sharing roles** (view-only vs. edit) and revoke history — being
  added as the last stretch phase; every shared user currently gets edit
  access.
- **Document version history** and **export to PDF/Markdown** — both listed
  as optional stretch goals in the brief; being worked on after real-time
  collaboration and comments.
- **Suggestion/track-changes mode** — comments were chosen instead (see
  above).
- **Rich `.docx` import** — parsing real Word documents (vs. plain
  text/Markdown) is a meaningfully larger problem (binary format, styles,
  images) that wasn't worth the time against the core requirements.

## Notable trade-offs worth knowing about

- Sharing and access checks are enforced server-side on every route (not just
  hidden in the UI), but there's no audit log of who accessed what, when.
- Document *title* still saves via a plain REST PATCH (debounced on blur), not
  through Yjs — two people renaming a document at the exact same moment could
  still race, last write wins. Only the document *body* goes through the CRDT.
- The collab server is a second deployable process; if it's down, editing
  still loads (title, comments, sharing all work) but the toolbar shows
  "Offline" and body edits won't sync or persist until it's back.
- Upload parsing (`.md` → TipTap JSON) goes through `marked` (Markdown → HTML)
  and TipTap's `generateJSON` (HTML → ProseMirror JSON) rather than a
  hand-rolled parser, trading a couple of extra dependencies (`marked`,
  `jsdom` for server-side DOM parsing) for correctness on real-world Markdown
  edge cases instead of maintaining a bespoke subset parser.
