import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createDocumentFromUpload } from "@/lib/documents";
import { markdownToTiptapJSON, plainTextToTiptapJSON } from "@/lib/markdown";
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  getFileExtension,
  MAX_UPLOAD_SIZE_BYTES,
} from "@/lib/upload";
import type { Prisma } from "@/generated/prisma/client";

function titleFromFilename(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return (idx === -1 ? filename : filename.slice(0, idx)).trim();
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const extension = getFileExtension(file.name);
  if (
    !ALLOWED_UPLOAD_EXTENSIONS.includes(extension as "txt" | "md")
  ) {
    return NextResponse.json(
      { error: "Only .txt and .md files are supported" },
      { status: 400 },
    );
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File is too large (max 1MB)" },
      { status: 400 },
    );
  }

  const text = await file.text();
  if (!text.trim()) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }

  let content: unknown;
  try {
    content =
      extension === "md"
        ? markdownToTiptapJSON(text)
        : plainTextToTiptapJSON(text);
  } catch {
    return NextResponse.json(
      { error: "Couldn't parse this file's content" },
      { status: 400 },
    );
  }

  const document = await createDocumentFromUpload(user.id, {
    title: titleFromFilename(file.name),
    content: content as Prisma.InputJsonValue,
    sourceFileName: file.name,
  });

  return NextResponse.json(document, { status: 201 });
}
