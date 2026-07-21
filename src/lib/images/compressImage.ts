/**
 * Client-side image validation + compression for avatars.
 * Keeps uploads small without adding a server image library.
 */

export const AVATAR_MAX_INPUT_BYTES = 5 * 1024 * 1024;
export const AVATAR_MAX_OUTPUT_EDGE = 512;
export const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type AvatarValidationError = "type" | "size" | "load";

export function validateAvatarFile(file: File): AvatarValidationError | null {
  if (!ALLOWED_TYPES.has(file.type)) return "type";
  if (file.size > AVATAR_MAX_INPUT_BYTES) return "size";
  return null;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("load"));
    };
    img.src = url;
  });
}

/**
 * Resize to max edge and encode as JPEG (or keep PNG for transparency-heavy sources).
 */
export async function compressAvatarImage(
  file: File,
  options?: { maxEdge?: number; quality?: number }
): Promise<File> {
  const maxEdge = options?.maxEdge ?? AVATAR_MAX_OUTPUT_EDGE;
  const quality = options?.quality ?? 0.82;

  const img = await loadImage(file);
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const preferPng = file.type === "image/png" || file.type === "image/gif";
  const mime = preferPng ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), mime, preferPng ? undefined : quality)
  );

  if (!blob) return file;

  // If compression somehow grew the file, keep the original when already small enough.
  if (blob.size >= file.size && file.size <= AVATAR_MAX_INPUT_BYTES && scale === 1) {
    return file;
  }

  const base = file.name.replace(/\.[^.]+$/, "") || "avatar";
  const ext = mime === "image/png" ? "png" : "jpg";
  return new File([blob], `${base}.${ext}`, { type: mime, lastModified: Date.now() });
}
