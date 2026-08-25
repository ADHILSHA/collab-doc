import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createDocument, getDocumentsForUser } from "@/lib/documents";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await getDocumentsForUser(user.id);
  return NextResponse.json(documents);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const title = typeof body.title === "string" ? body.title : undefined;

  const document = await createDocument(user.id, title);
  return NextResponse.json(document, { status: 201 });
}
