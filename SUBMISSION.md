# Submission

> This file is being filled in as the build progresses. Items marked
> **pending** will be completed in the deployment phase.

## What's included

- **Source code** — this repository. Full history is phase-by-phase (see
  commit log): scaffold → mock auth/dashboard → document CRUD → rich text
  editing (TipTap) → file upload → sharing → validation/tests/docs → stretch
  features (real-time collaborative editing, comments).
- **[README.md](./README.md)** — local setup and run instructions, seeded
  accounts, supported upload types, and known limitations.
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — architecture note: what was
  prioritized, what was cut, and why.
- **[AI_WORKFLOW.md](./AI_WORKFLOW.md)** — AI workflow note: tools used,
  where AI sped things up, what was changed/rejected, how correctness was
  verified.
- **Automated test** — `src/lib/permissions.test.ts` (Vitest), covering the
  access-control logic used by every document route. Run with `npm run test`.

## Pending

- **Live deployment URL** — pending. Note this app now needs two deployed
  processes (the Next.js app + the standalone `collab-server/` WebSocket
  server) — see the README's [Architecture](./README.md#architecture-running-locally-two-processes)
  section.
- **Walkthrough video URL** — pending, to be recorded after deployment.
- **Screenshots / demo GIF** — pending, if needed once the live deployment is
  up. Local setup now requires running two processes (`npm run dev` and
  `npm run collab-server`) — documented in the README, not just implied.

## Status: what's working vs. incomplete

**Working end-to-end**, verified manually in-browser and via HTTP-level
smoke tests after each phase:

- Create, rename, edit, and delete documents.
- Rich text editing (bold, italic, underline, headings, bulleted/numbered
  lists) with autosave and reload persistence.
- Upload `.txt`/`.md` files to create a new document, with Markdown converted
  to the same rich-text format the editor produces.
- Sharing: owner-only grant/revoke, "My Documents" vs. "Shared with Me"
  distinction, server-side access enforcement on every route.
- Validation and error handling: empty titles, unsupported/empty/oversized
  file uploads, oversized document content, 401/403/404 responses, and a
  custom not-found/error UI.
- Real-time collaborative editing: multiple users editing the same document
  see each other's changes live with colored cursors (Yjs + Hocuspocus over
  WebSocket), verified with real multi-client connection tests including
  access-control rejection at the WebSocket layer.
- Threaded, text-anchored comments: select text, comment, resolve/reopen
  without losing the anchor, delete removes the highlight.

**Incomplete / not attempted** (see [ARCHITECTURE.md](./ARCHITECTURE.md) for
the reasoning):

- Real authentication (mock/seeded users only).
- Granular sharing roles (view-only vs. edit) — sharing is currently all-or-
  nothing edit access. Being worked on next.
- Document version history, export to PDF/Markdown, `.docx` import.
- Suggestion/track-changes mode (comments were built instead).

## What I'd build next with another 2-4 hours

1. **Optimistic concurrency / conflict warning** on autosave, so two sessions
   editing the same document don't silently overwrite each other.
2. **View-only sharing** as a second permission tier, since the data model
   (`DocumentShare`) already supports adding a `role` column with minimal
   migration.
3. **Document version history** (the brief's suggested stretch goal) — likely
   the best return on effort given the content is already stored as
   versionable JSON.
