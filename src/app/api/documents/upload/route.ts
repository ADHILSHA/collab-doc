import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createDocumentFromUpload } from "@/lib/documents";
import { markdownToTiptapJSON, plainTextToTiptapJSON } from "@/lib/markdown";
import type { Prisma } from "@/generated/prisma/client";

export const ALLOWED_EXTENSIONS = ["txt", "md"] as const;
const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1MB

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.slice(idx + 1).toLowerCase();
}

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

  const extension = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(extension as "txt" | "md")) {
    return NextResponse.json(
      { error: "Only .txt and .md files are supported" },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File is too large (max 1MB)" },
      { status: 400 },
    );
  }

  const text = await file.text();
  const content =
    extension === "md"
      ? markdownToTiptapJSON(text)
      : plainTextToTiptapJSON(text);

  const document = await createDocumentFromUpload(user.id, {
    title: titleFromFilename(file.name),
    content: content as Prisma.InputJsonValue,
    sourceFileName: file.name,
  });

  return NextResponse.json(document, { status: 201 });
}
