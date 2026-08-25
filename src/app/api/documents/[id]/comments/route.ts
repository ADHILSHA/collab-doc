import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentWithAccess } from "@/lib/documents";
import { createComment, getCommentsForDocument } from "@/lib/comments";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { doc, access } = await getDocumentWithAccess(id, user.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comments = await getCommentsForDocument(id);
  return NextResponse.json(comments);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { doc, access } = await getDocumentWithAccess(id, user.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  if (typeof body.body !== "string" || !body.body.trim()) {
    return NextResponse.json(
      { error: "Comment text is required" },
      { status: 400 },
    );
  }
  const quotedText = typeof body.quotedText === "string" ? body.quotedText : "";

  const comment = await createComment(id, user.id, {
    body: body.body,
    quotedText,
  });
  return NextResponse.json(comment, { status: 201 });
}
