import { prisma } from "@/lib/prisma";

export const COMMENT_BODY_MAX_LENGTH = 2000;
export const COMMENT_QUOTE_MAX_LENGTH = 300;

const AUTHOR_SELECT = { select: { id: true, name: true, colorHex: true } };

export function getCommentsForDocument(documentId: string) {
  return prisma.comment.findMany({
    where: { documentId },
    orderBy: { createdAt: "asc" },
    include: { author: AUTHOR_SELECT },
  });
}

export function createComment(
  documentId: string,
  authorId: string,
  data: { body: string; quotedText: string },
) {
  return prisma.comment.create({
    data: {
      documentId,
      authorId,
      body: data.body.trim().slice(0, COMMENT_BODY_MAX_LENGTH),
      quotedText: data.quotedText.trim().slice(0, COMMENT_QUOTE_MAX_LENGTH),
    },
    include: { author: AUTHOR_SELECT },
  });
}

export function getComment(commentId: string) {
  return prisma.comment.findUnique({ where: { id: commentId } });
}

export function setCommentResolved(commentId: string, resolved: boolean) {
  return prisma.comment.update({
    where: { id: commentId },
    data: { resolved },
    include: { author: AUTHOR_SELECT },
  });
}

export function deleteComment(commentId: string) {
  return prisma.comment.delete({ where: { id: commentId } });
}
