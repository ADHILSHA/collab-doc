# Collab Doc

A lightweight, Google-Docs-inspired collaborative document editor: create and
edit rich-text documents, import `.txt`/`.md` files as new documents, and
share documents between a few mock users.

**Live demo:** _TBD — filled in after deployment (see [Deployment](#deployment))._

## Features

- **Document creation & editing** — create, rename, and edit documents with a
  TipTap-based rich text editor (bold, italic, underline, headings, bulleted
  and numbered lists). Content autosaves ~1s after you stop typing.
- **Comments** — select any text and leave a comment anchored to it
  (highlighted in the document). Resolve/reopen without losing the anchor;
  deleting a comment removes its highlight. Anyone with access to the
  document can comment; only the comment's author or the document owner can
  delete it.
- **Version history** — checkpoints are saved automatically as a document is
  edited (throttled so a burst of autosaves doesn't create a version per
  keystroke). Restore any earlier version — restoring saves the current
  content as a version first, so it's never lost.
- **Presence** — see who else currently has a document open, shown as
  avatars in the header (polling-based, updates every ~5s).
- **File upload** — upload a `.txt` or `.md` file to create a new document.
  Markdown is converted into the same rich-text format the editor produces
  (headings, bold/italic, lists); plain text becomes one paragraph per line.
  No other file types are supported (see [Limitations](#limitations)).
- **Sharing** — every document has one owner. The owner can grant/revoke
  access to other seeded users from the document page. Shared documents show
  up under "Shared with Me" on the recipient's dashboard, with the owner's
  name; owned documents are listed separately under "My Documents."
- **Persistence** — documents, comments, versions, and sharing data all live
  in Postgres via Prisma; everything survives a refresh or a fresh login.
- **Mock auth** — no real accounts or passwords. Pick one of three seeded
  users (Alice, Bob, Carol) from `/login` to demonstrate the app, including
  the sharing flow between them.

## Tech stack

- **Next.js** (App Router, TypeScript) — single app for both frontend and API
  routes.
- **Prisma + Postgres** (developed against [Neon](https://neon.tech)'s free
  tier) via the `pg` driver adapter.
- **TipTap** (v3, `StarterKit`) for rich text editing, plus a custom mark
  extension for anchored comments.
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
4. **Create the schema and seed mock users:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
5. **Run the app:**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` — you'll land on `/login`.

### Seeded accounts

There's no real authentication. `/login` lists three mock users — click one
to "log in" as them (sets a plain cookie, no password):

| User  |
| ----- |
| Alice |
| Bob   |
| Carol |

Use two of them (e.g. log in as Alice in one browser, Bob in another/incognito)
to exercise the sharing flow: create/own a document as one user, share it with
another, then switch users to see it appear under "Shared with Me."

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
- **Collaboration**: presence (who has a document open) is shown, but there's
  no live co-editing — two people editing the same document at the same time
  will have last-save-wins behavior. Autosave + refresh-to-see-others'-changes
  is the model.
- **Comments**: flat, not threaded (no replies), and no suggestion/track-
  changes mode — see the AI workflow note for why comments were built instead.
- **Version history**: automatic checkpoints only (no manual "save version"),
  throttled to roughly one snapshot per 5 minutes of active editing — it's a
  coarse timeline, not a full edit-by-edit history.
- **Upload size**: capped at 1MB per file; document content is capped at 2MB
  server-side.

## Deployment

_TBD — to be filled in once deployed (Phase 7)._

## Project docs

- [Architecture note](./ARCHITECTURE.md)
- [AI workflow note](./AI_WORKFLOW.md)
- [SUBMISSION.md](./SUBMISSION.md)
