export class ProductSearchError extends Error {}

export interface ProductImageResult {
  url: string;
  thumbnail: string;
}

const SEARCH_ENDPOINT = "https://www.googleapis.com/customsearch/v1";
const FETCH_TIMEOUT_MS = 20000;

function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
}

/**
 * Searches for product images by name via the Google Custom Search JSON API.
 * Requires the user's own API key + Search Engine ID (see Einstellungen).
 */
export async function searchProductImages(
  query: string,
  apiKey: string,
  cx: string,
): Promise<ProductImageResult[]> {
  if (!apiKey || !cx) {
    throw new ProductSearchError(
      "Kein Google-API-Key bzw. keine Search-Engine-ID hinterlegt. Bitte in den Einstellungen eintragen.",
    );
  }

  const params = new URLSearchParams({
    key: apiKey,
    cx,
    q: query,
    searchType: "image",
    num: "9",
    safe: "active",
  });

  let response: Response;
  try {
    response = await fetchWithTimeout(`${SEARCH_ENDPOINT}?${params.toString()}`);
  } catch {
    throw new ProductSearchError("Verbindung zur Bildsuche fehlgeschlagen. Bitte Internetverbindung prüfen.");
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.error?.message ?? "";
    } catch {
      // ignore non-JSON error body
    }

    if (response.status === 403) {
      throw new ProductSearchError(
        `Zugriff verweigert (403). ${detail} Prüfe, ob die Custom Search API im selben ` +
          "Google-Cloud-Projekt aktiviert ist, in dem der API-Key erstellt wurde (oben im " +
          "Projekt-Dropdown der Cloud Console nachsehen), und ob der Key keine API-" +
          "Einschränkung hat, die Custom Search ausschließt.",
      );
    }
    if (response.status === 400) {
      throw new ProductSearchError(
        `Ungültige Anfrage (400). ${detail} Bitte API-Key und Search Engine ID in den ` +
          "Einstellungen prüfen.",
      );
    }
    throw new ProductSearchError(`Bildsuche fehlgeschlagen (${response.status}). ${detail}`.trim());
  }

  const data = await response.json();
  const items = Array.isArray(data.items) ? data.items : [];
  if (items.length === 0) {
    throw new ProductSearchError("Keine Bilder gefunden. Versuch es mit einem anderen Suchbegriff.");
  }

  return items.map((item: { link: string; image?: { thumbnailLink?: string } }) => ({
    url: item.link,
    thumbnail: item.image?.thumbnailLink ?? item.link,
  }));
}

// Public CORS-friendly image proxy so cross-origin product photos can be
// downloaded as a Blob in the browser (most retailer sites don't send the
// Access-Control-Allow-Origin headers a plain fetch() would need).
const CORS_PROXY = "https://images.weserv.nl/?url=";

export async function fetchImageAsBlob(url: string): Promise<Blob> {
  let response: Response;
  try {
    response = await fetchWithTimeout(`${CORS_PROXY}${encodeURIComponent(url)}`);
  } catch {
    throw new ProductSearchError("Bild konnte nicht geladen werden.");
  }
  if (!response.ok) {
    throw new ProductSearchError("Bild konnte nicht geladen werden.");
  }
  return response.blob();
}
