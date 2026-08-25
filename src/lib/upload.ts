export const ALLOWED_UPLOAD_EXTENSIONS = ["txt", "md"] as const;
export const MAX_UPLOAD_SIZE_BYTES = 1024 * 1024; // 1MB

export function getFileExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.slice(idx + 1).toLowerCase();
}
