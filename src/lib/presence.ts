import { prisma } from "@/lib/prisma";

export const PRESENCE_ACTIVE_WINDOW_MS = 15_000;

export function heartbeatPresence(documentId: string, userId: string) {
  const now = new Date();
  return prisma.documentPresence.upsert({
    where: { documentId_userId: { documentId, userId } },
    // @updatedAt only auto-bumps when the write actually changes a field;
    // an empty `update: {}` is a no-op that leaves lastSeenAt frozen at
    // creation time, so it's set explicitly here on every heartbeat.
    update: { lastSeenAt: now },
    create: { documentId, userId, lastSeenAt: now },
  });
}

export function clearPresence(documentId: string, userId: string) {
  return prisma.documentPresence.deleteMany({ where: { documentId, userId } });
}

export async function getActiveViewers(documentId: string, excludeUserId: string) {
  const since = new Date(Date.now() - PRESENCE_ACTIVE_WINDOW_MS);
  const rows = await prisma.documentPresence.findMany({
    where: {
      documentId,
      userId: { not: excludeUserId },
      lastSeenAt: { gte: since },
    },
    select: { user: { select: { id: true, name: true, colorHex: true } } },
  });
  return rows.map((r) => r.user);
}
