# Collab Doc

A lightweight, Google-Docs-inspired collaborative document editor: create and
edit rich-text documents together in real time, comment on specific text,
import `.txt`/`.md` files as new documents, and share documents between a few
mock users.

**Live demo:** _TBD — filled in after deployment (see [Deployment](#deployment))._

## Features

- **Real-time collaborative editing** — multiple users can edit the same
  document at once and see each other's changes live, with colored live
  cursors, powered by Yjs (CRDT) over a WebSocket connection (see
  [Architecture](#architecture--running-locally-two-processes) for how this
  is wired up).
- **Rich text editing** — a TipTap-based editor (bold, italic, underline,
  headings, bulleted and numbered lists).
- **Comments** — select any text and leave a comment anchored to it
  (highlighted in the document). Resolve/reopen without losing the anchor;
  deleting a comment removes its highlight.
- **File upload** — upload a `.txt` or `.md` file to create a new document.
  Markdown is converted into the same rich-text format the editor produces
  (headings, bold/italic, lists); plain text becomes one paragraph per line.
  No other file types are supported (see [Limitations](#limitations)).
- **Sharing** — every document has one owner. The owner can grant/revoke
  access to other seeded users from the document page. Shared documents show
  up under "Shared with Me" on the recipient's dashboard, with the owner's
  name; owned documents are listed separately under "My Documents."
- **Persistence** — documents, comments, and sharing data live in Postgres
  via Prisma; everything survives a refresh or a fresh login.
- **Mock auth** — no real accounts or passwords. Pick one of three seeded
  users (Alice, Bob, Carol) from `/login` to demonstrate the app, including
  the sharing and live-collaboration flows between them.

## Tech stack

- **Next.js** (App Router, TypeScript) — the main app: frontend + API routes.
- **Prisma + Postgres** (developed against [Neon](https://neon.tech)'s free
  tier) via the `pg` driver adapter.
- **TipTap** (v3, `StarterKit`) for rich text editing, plus a custom mark
  extension for anchored comments.
- **Yjs + Hocuspocus** for real-time collaborative editing — a small
  standalone WebSocket server (`collab-server/`), separate from the Vercel
  serverless-hosted main app, since persistent WebSocket connections need a
  long-running process.
- **Tailwind CSS** (with `@tailwindcss/typography`) for styling.
- **Vitest** for automated tests.

## Local setup

1. **Clone and install:**
   ```bash
   npm install
   ```
2. **Get a Postgres database.** The free tier at [neon.tech](https://neon.tech)
   works well and needs no local install — create a project and copy the
   pooled connection string. Any Postgres connection string works.
3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # then edit .env and set DATABASE_URL to your connection string
   ```
   The collaboration server URL/port defaults already work for local dev —
   no changes needed there unless port 1234 is taken.
4. **Create the schema and seed mock users:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
5. **Run the app — two processes, two terminals:**
   ```bash
   npm run dev            # terminal 1: Next.js app on :3000
   npm run collab-server  # terminal 2: Yjs/Hocuspocus WebSocket server on :1234
   ```
   Visit `http://localhost:3000` — you'll land on `/login`. The editor will
   still load without the collab server running, but live sync won't work
   (the toolbar will show "Offline").

### Seeded accounts

There's no real authentication. `/login` lists three mock users — click one
to "log in" as them (sets a plain cookie, no password):

| User  |
| ----- |
| Alice |
| Bob   |
| Carol |

Use two of them (e.g. log in as Alice in one browser, Bob in another/incognito)
to see live collaboration and the sharing flow: create/own a document as one
user, share it with another, then open it as both at once.

## Architecture: running locally (two processes)

Vercel's serverless functions can't hold a persistent WebSocket connection,
so real-time collaboration runs through a small standalone Node process
(`collab-server/`, built on [Hocuspocus](https://tiptap.dev/docs/hocuspocus))
instead of a Next.js API route. It shares the same Postgres database and the
same document-access logic (`canAccessDocument`) as the main app — a
WebSocket connection is authenticated the same way the REST API is (the
user's id), and rejected the same way if that user doesn't own or have the
document shared with them.

Document content has two representations in the database: `content` (JSON,
used for exports/imports and by anything that just needs to *read* a
document) and `yjsState` (binary, the live CRDT state used for real-time
sync). The collab server keeps them in sync — whenever it persists a change,
it writes both.

## Running tests

```bash
npm run test
```

Covers `canAccessDocument`/`isOwner` in `src/lib/permissions.ts` — the
function every document read/write route uses to decide whether the current
user may see or edit a document.

## Other useful scripts

- `npm run lint` — ESLint.
- `npm run db:studio` — Prisma Studio, to inspect the database directly.

## Limitations

Deliberately out of scope for this build (see the [architecture
note](./ARCHITECTURE.md) for the reasoning):

- **File upload types**: only `.txt` and `.md` are accepted. `.docx`, `.pdf`,
  and others are rejected with a clear error, both client- and server-side.
- **Auth**: mock/seeded users only, no passwords, no signup.
- **Sharing model**: binary access (shared or not) — no view-only vs.
  edit-only roles, and no per-share revoke history.
- **Comments**: no threaded replies (flat comments) and no suggestion/track-
  changes mode — see the AI workflow note for why comments were chosen over
  suggestion mode.
- **Upload size**: capped at 1MB per file; document content is capped at 2MB
  server-side.

## Deployment

_TBD — to be filled in once deployed (Phase 7). Note the collab server is a
second deployable process, separate from the Next.js app._

## Project docs

- [Architecture note](./ARCHITECTURE.md)
- [AI workflow note](./AI_WORKFLOW.md)
- [SUBMISSION.md](./SUBMISSION.md)
