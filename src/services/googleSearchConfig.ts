const API_KEY_STORAGE = "zoey-kleiderschrank:google-search-key";
const CX_STORAGE = "zoey-kleiderschrank:google-search-cx";

export interface GoogleSearchConfig {
  apiKey: string;
  cx: string;
}

export function getGoogleSearchConfig(): GoogleSearchConfig {
  return {
    apiKey: localStorage.getItem(API_KEY_STORAGE) ?? "",
    cx: localStorage.getItem(CX_STORAGE) ?? "",
  };
}

export function setGoogleSearchConfig(apiKey: string, cx: string): void {
  if (apiKey) localStorage.setItem(API_KEY_STORAGE, apiKey);
  else localStorage.removeItem(API_KEY_STORAGE);

  if (cx) localStorage.setItem(CX_STORAGE, cx);
  else localStorage.removeItem(CX_STORAGE);
}

export function hasGoogleSearchConfig(): boolean {
  const { apiKey, cx } = getGoogleSearchConfig();
  return Boolean(apiKey && cx);
}
