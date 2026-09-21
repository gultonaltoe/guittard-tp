const GENERIC_ERROR = "Une erreur est survenue, réessayez.";
const TOO_LARGE_ERROR = "Le fichier est trop volumineux, réessayez avec une photo plus légère.";

/**
 * Lit la réponse d'une route API admin sans jamais laisser fuiter une erreur
 * technique. Une réponse non-JSON (ex. "Request Entity Too Large" en 413, page
 * d'erreur de la plateforme) ne doit pas finir en "Unexpected token ... is not
 * valid JSON" dans l'interface.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- corps JSON propre à chaque route
export async function readApiJson(res: Response, fallback: string): Promise<any> {
  if (res.status === 413) throw new Error(TOO_LARGE_ERROR);

  const isJson = res.headers.get("content-type")?.includes("application/json") ?? false;
  if (!isJson) throw new Error(res.ok ? GENERIC_ERROR : fallback);

  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? fallback);
  if (body === null) throw new Error(GENERIC_ERROR);
  return body;
}
