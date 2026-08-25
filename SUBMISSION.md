# Submission

## Links for reference

- **Source code (Google Drive)**: https://drive.google.com/file/d/1TRmVrZUqylCcOld0UDgcCMfeDBpE8dhA/view?usp=sharing
- **Source code (GitHub)**: https://github.com/ADHILSHA/collab-doc
- **Live deployment**: https://collab-doc-silk.vercel.app/
- **Walkthrough video**: https://www.loom.com/share/b4c8815c26a0479a96e20e61bec535b6

## What's included

- **Source code** — see [Links](#links) above (GitHub and a Google Drive
  copy). Full history is phase-by-phase (see commit log): scaffold → mock
  auth/dashboard → document CRUD → rich text editing (TipTap) → file upload →
  sharing → validation/tests/docs → stretch features (presence, comments,
  version history).
- **[README.md](./README.md)** — local setup and run instructions, seeded
  accounts, supported upload types, and known limitations.
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — architecture note: what was
  prioritized, what was cut, and why.
- **[AI_WORKFLOW.md](./AI_WORKFLOW.md)** — AI workflow note: tools used,
  where AI sped things up, what was changed/rejected, how correctness was
  verified.
- **Automated test** — `src/lib/permissions.test.ts` (Vitest), covering the
  access-control logic used by every document route. Run with `npm run test`.

Screenshots/demo GIF weren't included — local setup has no unusual manual
steps beyond what's in the README, and the walkthrough video (linked above)
covers the live product.

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
- Presence: avatars showing who else currently has a document open
  (polling-based).
- Threaded, text-anchored comments: select text, comment, resolve/reopen
  without losing the anchor, delete removes the highlight.
- Version history: automatic throttled checkpoints, restore with undo-safety
  (restoring always saves the pre-restore state as a version first).

**Incomplete / not attempted** (see [ARCHITECTURE.md](./ARCHITECTURE.md) for
the reasoning):

- Real authentication (mock/seeded users only).
- Granular sharing roles (view-only vs. edit) — sharing is currently all-or-
  nothing edit access. Being worked on next.
- Live co-editing (real-time concurrent editing with conflict-free merging).
  Prototyped separately with Yjs + a standalone WebSocket server, preserved
  on a separate branch, but not merged into this build.
- Export to PDF/Markdown, `.docx` import.
- Suggestion/track-changes mode (comments were built instead).

## What I'd build next with another 2-4 hours

1. **Merge in live co-editing** (Yjs + Hocuspocus, already built and verified
   on a separate branch) now that the simpler stretch features are stable.
2. **View-only sharing** as a second permission tier, since the data model
   (`DocumentShare`) already supports adding a `role` column with minimal
   migration.
3. **Export to Markdown**, since document content is already stored as
   easily-serializable JSON.
