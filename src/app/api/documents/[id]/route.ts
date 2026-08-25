import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  deleteDocument,
  getDocumentWithAccess,
  updateDocument,
} from "@/lib/documents";
import { isOwner } from "@/lib/permissions";
import { maybeSnapshotVersion } from "@/lib/versions";
import type { Prisma } from "@/generated/prisma/client";

const MAX_CONTENT_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

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

  return NextResponse.json(doc);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
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
  const updates: { title?: string; content?: Prisma.InputJsonValue } = {};

  if ("title" in body) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { error: "Title cannot be empty" },
        { status: 400 },
      );
    }
    updates.title = body.title;
  }

  if ("content" in body) {
    if (
      typeof body.content !== "object" ||
      body.content === null ||
      Array.isArray(body.content)
    ) {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }
    if (JSON.stringify(body.content).length > MAX_CONTENT_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Document content is too large" },
        { status: 400 },
      );
    }
    updates.content = body.content as Prisma.InputJsonValue;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  if (updates.content !== undefined) {
    await maybeSnapshotVersion(id, user.id);
  }

  const updated = await updateDocument(id, updates);
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
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
      { error: "Only the owner can delete this document" },
      { status: 403 },
    );
  }

  await deleteDocument(id);
  return NextResponse.json({ success: true });
}
