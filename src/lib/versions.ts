import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

// Only checkpoint a version if the last one is older than this, so a burst
// of autosaves while someone is actively typing doesn't create a version
// per keystroke-triggered save.
export const VERSION_SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000;

const AUTHOR_SELECT = { select: { id: true, name: true, colorHex: true } };

/**
 * Snapshots the document's *current* (about-to-be-overwritten) title/content
 * as a version, but only if enough time has passed since the last snapshot.
 * Call this before applying a content update.
 */
export async function maybeSnapshotVersion(documentId: string, userId: string) {
  const [doc, latestVersion] = await Promise.all([
    prisma.document.findUnique({
      where: { id: documentId },
      select: { title: true, content: true },
    }),
    prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  if (!doc) return;

  const isStale =
    !latestVersion ||
    Date.now() - latestVersion.createdAt.getTime() > VERSION_SNAPSHOT_INTERVAL_MS;
  if (!isStale) return;

  await prisma.documentVersion.create({
    data: {
      documentId,
      title: doc.title,
      content: doc.content as Prisma.InputJsonValue,
      createdById: userId,
    },
  });
}

export function getVersionsForDocument(documentId: string) {
  return prisma.documentVersion.findMany({
    where: { documentId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      createdBy: AUTHOR_SELECT,
    },
  });
}

export function getVersion(versionId: string) {
  return prisma.documentVersion.findUnique({ where: { id: versionId } });
}

export async function restoreVersion(
  documentId: string,
  versionId: string,
  userId: string,
) {
  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
  });
  if (!version || version.documentId !== documentId) return null;

  // Snapshot the current state first so restoring is itself undoable.
  const current = await prisma.document.findUnique({
    where: { id: documentId },
    select: { title: true, content: true },
  });
  if (current) {
    await prisma.documentVersion.create({
      data: {
        documentId,
        title: current.title,
        content: current.content as Prisma.InputJsonValue,
        createdById: userId,
      },
    });
  }

  return prisma.document.update({
    where: { id: documentId },
    data: {
      title: version.title,
      content: version.content as Prisma.InputJsonValue,
    },
  });
}
