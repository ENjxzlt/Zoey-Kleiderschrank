const REMOVE_BG_ENDPOINT = "https://api.remove.bg/v1.0/removebg";

export class BackgroundRemovalError extends Error {}

/**
 * Sends a photo to remove.bg and returns a PNG blob with a transparent
 * background. Requires the user's own remove.bg API key (see Einstellungen).
 */
export async function removeBackground(image: Blob, apiKey: string): Promise<Blob> {
  if (!apiKey) {
    throw new BackgroundRemovalError(
      "Kein API-Key hinterlegt. Bitte in den Einstellungen einen remove.bg API-Key eintragen.",
    );
  }

  const formData = new FormData();
  formData.append("image_file", image, "photo.jpg");
  formData.append("size", "auto");

  let response: Response;
  try {
    response = await fetch(REMOVE_BG_ENDPOINT, {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: formData,
    });
  } catch {
    throw new BackgroundRemovalError(
      "Verbindung zur Freistellungs-API fehlgeschlagen. Bitte Internetverbindung prüfen.",
    );
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new BackgroundRemovalError(
        "API-Key ungültig. Bitte den remove.bg API-Key in den Einstellungen prüfen.",
      );
    }
    if (response.status === 402) {
      throw new BackgroundRemovalError(
        "Kontingent bei remove.bg aufgebraucht. Bitte Guthaben aufladen oder später erneut versuchen.",
      );
    }
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.errors?.[0]?.title ?? "";
    } catch {
      // response body wasn't JSON, ignore
    }
    throw new BackgroundRemovalError(
      `Freistellung fehlgeschlagen (${response.status}). ${detail}`.trim(),
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Blob([arrayBuffer], { type: "image/png" });
}
