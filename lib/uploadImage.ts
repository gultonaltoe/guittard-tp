import { readApiJson } from "./adminApi";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Photo brute acceptée avant réduction (un smartphone récent dépasse souvent 10 Mo). */
export const MAX_ORIGINAL_MB = 20;
/** Plafond de payload des fonctions Vercel : ~4,5 Mo, on garde de la marge. */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
/** En dessous, un fichier déjà à la bonne taille part tel quel (pas de perte de qualité). */
const SKIP_COMPRESSION_BYTES = 1.5 * 1024 * 1024;

const ATTEMPTS = [
  { maxDimension: 2000, quality: 0.82 },
  { maxDimension: 1600, quality: 0.7 },
];

const TOO_HEAVY = (name: string) =>
  `« ${name} » est trop volumineuse. Essayez avec une photo plus légère.`;

function extensionFor(type: string) {
  return type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Redimensionne et recompresse une photo dans le navigateur avant l'envoi.
 * Les JPEG restent en JPEG ; PNG/WebP passent en WebP pour conserver la transparence.
 */
async function compress(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    if (file.size <= MAX_UPLOAD_BYTES) return file;
    throw new Error(`Impossible de lire « ${file.name} ». Essayez avec une autre photo.`);
  }

  const outputType = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";
  let smallest: Blob | null = null;

  try {
    for (const { maxDimension, quality } of ATTEMPTS) {
      const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
      if (scale === 1 && file.size <= SKIP_COMPRESSION_BYTES) return file;

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const blob = await toBlob(canvas, outputType, quality);
      if (blob && (!smallest || blob.size < smallest.size)) smallest = blob;
      if (smallest && smallest.size <= MAX_UPLOAD_BYTES) break;
    }
  } finally {
    bitmap.close();
  }

  // L'original vaut mieux si la recompression n'apporte rien et qu'il passe déjà.
  if (!smallest || (smallest.size >= file.size && file.size <= MAX_UPLOAD_BYTES)) {
    if (file.size <= MAX_UPLOAD_BYTES) return file;
    throw new Error(TOO_HEAVY(file.name));
  }
  if (smallest.size > MAX_UPLOAD_BYTES) throw new Error(TOO_HEAVY(file.name));

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([smallest], `${baseName}.${extensionFor(smallest.type)}`, {
    type: smallest.type,
  });
}

/** Valide, réduit puis envoie une image. Retourne l'URL publique. */
export async function uploadImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`« ${file.name} » n'est pas une image JPEG, PNG ou WebP.`);
  }
  if (file.size > MAX_ORIGINAL_MB * 1024 * 1024) {
    throw new Error(`« ${file.name} » dépasse ${MAX_ORIGINAL_MB} Mo.`);
  }

  const ready = await compress(file);
  const fd = new FormData();
  fd.append("file", ready);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const body = await readApiJson(res, "Échec de l'envoi de la photo.");
  return body.url;
}
