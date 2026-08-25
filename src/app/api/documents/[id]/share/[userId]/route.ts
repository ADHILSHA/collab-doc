import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentWithAccess, unshareDocument } from "@/lib/documents";
import { isOwner } from "@/lib/permissions";

type RouteContext = { params: Promise<{ id: string; userId: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, userId } = await params;
  const { doc } = await getDocumentWithAccess(id, user.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!isOwner(user.id, doc)) {
    return NextResponse.json(
      { error: "Only the owner can modify sharing" },
      { status: 403 },
    );
  }

  await unshareDocument(id, userId);
  return NextResponse.json({ success: true });
}
