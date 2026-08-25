import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentWithAccess } from "@/lib/documents";
import { deleteComment, getComment, setCommentResolved } from "@/lib/comments";
import { isOwner } from "@/lib/permissions";

type RouteContext = { params: Promise<{ id: string; commentId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, commentId } = await params;
  const { doc, access } = await getDocumentWithAccess(id, user.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comment = await getComment(commentId);
  if (!comment || comment.documentId !== id) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  if (typeof body.resolved !== "boolean") {
    return NextResponse.json(
      { error: "resolved (boolean) is required" },
      { status: 400 },
    );
  }

  const updated = await setCommentResolved(commentId, body.resolved);
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, commentId } = await params;
  const { doc, access } = await getDocumentWithAccess(id, user.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comment = await getComment(commentId);
  if (!comment || comment.documentId !== id) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (comment.authorId !== user.id && !isOwner(user.id, doc)) {
    return NextResponse.json(
      { error: "Only the comment author or document owner can delete this" },
      { status: 403 },
    );
  }

  await deleteComment(commentId);
  return NextResponse.json({ success: true });
}
