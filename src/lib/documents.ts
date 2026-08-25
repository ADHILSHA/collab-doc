import { prisma } from "@/lib/prisma";
import { canAccessDocument } from "@/lib/permissions";

export const TITLE_MAX_LENGTH = 200;
const DEFAULT_TITLE = "Untitled document";

const OWNER_SELECT = { select: { id: true, name: true, colorHex: true } };

export function getDocumentsForUser(userId: string) {
  return Promise.all([
    prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, updatedAt: true, ownerId: true },
    }),
    prisma.document.findMany({
      where: { shares: { some: { userId } } },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        ownerId: true,
        owner: OWNER_SELECT,
      },
    }),
  ]).then(([owned, shared]) => ({ owned, shared }));
}

export function createDocument(ownerId: string, title?: string) {
  const trimmed = title?.trim().slice(0, TITLE_MAX_LENGTH);
  return prisma.document.create({
    data: { ownerId, title: trimmed || DEFAULT_TITLE },
  });
}

export async function getDocumentWithAccess(id: string, userId: string) {
  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      owner: OWNER_SELECT,
      shares: { select: { userId: true } },
    },
  });

  if (!doc) return { doc: null, access: false };
  return { doc, access: canAccessDocument(userId, doc) };
}

export function renameDocument(id: string, title: string) {
  return prisma.document.update({
    where: { id },
    data: { title: title.trim().slice(0, TITLE_MAX_LENGTH) },
  });
}

export function deleteDocument(id: string) {
  return prisma.document.delete({ where: { id } });
}
