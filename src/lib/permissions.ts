export type ShareRef = { userId: string };
export type DocumentAccessInfo = { ownerId: string; shares: ShareRef[] };

export function canAccessDocument(
  userId: string,
  doc: DocumentAccessInfo,
): boolean {
  return doc.ownerId === userId || doc.shares.some((s) => s.userId === userId);
}

export function isOwner(userId: string, doc: { ownerId: string }): boolean {
  return doc.ownerId === userId;
}
