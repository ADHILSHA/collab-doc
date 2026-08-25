import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentWithAccess } from "@/lib/documents";
import { restoreVersion } from "@/lib/versions";

type RouteContext = { params: Promise<{ id: string; versionId: string }> };

export async function POST(_request: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, versionId } = await params;
  const { doc, access } = await getDocumentWithAccess(id, user.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const restored = await restoreVersion(id, versionId, user.id);
  if (!restored) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  return NextResponse.json(restored);
}
