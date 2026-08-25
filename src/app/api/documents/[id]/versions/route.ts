import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentWithAccess } from "@/lib/documents";
import { getVersionsForDocument } from "@/lib/versions";

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

  const versions = await getVersionsForDocument(id);
  return NextResponse.json(versions);
}
