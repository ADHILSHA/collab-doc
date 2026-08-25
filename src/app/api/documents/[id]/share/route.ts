import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentWithAccess, shareDocument } from "@/lib/documents";
import { isOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { doc } = await getDocumentWithAccess(id, user.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!isOwner(user.id, doc)) {
    return NextResponse.json(
      { error: "Only the owner can share this document" },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const targetUserId = body.userId;
  if (typeof targetUserId !== "string" || !targetUserId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  if (targetUserId === user.id) {
    return NextResponse.json(
      { error: "You already own this document" },
      { status: 400 },
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });
  if (!targetUser) {
    return NextResponse.json({ error: "Unknown user" }, { status: 404 });
  }

  const share = await shareDocument(id, targetUserId);
  return NextResponse.json(share, { status: 201 });
}
