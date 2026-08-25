import { prisma } from "@/lib/prisma";
import { canAccessDocument } from "@/lib/permissions";
import type { Prisma } from "@/generated/prisma/client";

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

export function createDocumentFromUpload(
  ownerId: string,
  data: {
    title: string;
    content: Prisma.InputJsonValue;
    sourceFileName: string;
  },
) {
  const trimmed = data.title.trim().slice(0, TITLE_MAX_LENGTH);
  return prisma.document.create({
    data: {
      ownerId,
      title: trimmed || DEFAULT_TITLE,
      content: data.content,
      sourceFileName: data.sourceFileName,
    },
  });
}

export async function getDocumentWithAccess(id: string, userId: string) {
  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      owner: OWNER_SELECT,
      shares: { include: { user: OWNER_SELECT } },
    },
  });

  if (!doc) return { doc: null, access: false };
  return { doc, access: canAccessDocument(userId, doc) };
}

export function shareDocument(documentId: string, userId: string) {
  return prisma.documentShare.upsert({
    where: { documentId_userId: { documentId, userId } },
    update: {},
    create: { documentId, userId },
  });
}

export function unshareDocument(documentId: string, userId: string) {
  return prisma.documentShare.deleteMany({ where: { documentId, userId } });
}

export function updateDocument(
  id: string,
  updates: { title?: string; content?: Prisma.InputJsonValue },
) {
  const data: Prisma.DocumentUpdateInput = {};
  if (updates.title !== undefined) {
    data.title = updates.title.trim().slice(0, TITLE_MAX_LENGTH);
  }
  if (updates.content !== undefined) {
    data.content = updates.content;
  }
  return prisma.document.update({ where: { id }, data });
}

export function deleteDocument(id: string) {
  return prisma.document.delete({ where: { id } });
}
