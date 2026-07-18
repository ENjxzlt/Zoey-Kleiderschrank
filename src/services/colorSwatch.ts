const COLOR_MAP: Record<string, string> = {
  schwarz: "#171717",
  weiß: "#ffffff",
  weiss: "#ffffff",
  grau: "#9ca3af",
  hellgrau: "#d4d4d8",
  dunkelgrau: "#52525b",
  rot: "#dc2626",
  bordeaux: "#7f1d1d",
  blau: "#2563eb",
  hellblau: "#7dd3fc",
  dunkelblau: "#1e3a8a",
  marine: "#1e293b",
  grün: "#16a34a",
  gruen: "#16a34a",
  hellgrün: "#86efac",
  hellgruen: "#86efac",
  dunkelgrün: "#166534",
  dunkelgruen: "#166534",
  oliv: "#65760a",
  gelb: "#eab308",
  orange: "#f97316",
  rosa: "#f9a8d4",
  pink: "#ec4899",
  lila: "#a855f7",
  violett: "#8b5cf6",
  braun: "#92400e",
  beige: "#e7d7c1",
  creme: "#fdf6e3",
  türkis: "#06b6d4",
  tuerkis: "#06b6d4",
  gold: "#d4af37",
  silber: "#c0c0c0",
  khaki: "#a3a380",
  mint: "#a7f3d0",
  taupe: "#b8a99a",
};

/** Best-effort mapping of a free-text German color name (as typed in
 * AddItemPage) to a CSS color, for the small swatch dot on item cards. */
export function resolveColorSwatch(color: string | undefined): string | null {
  if (!color) return null;
  const key = color.trim().toLowerCase();
  if (COLOR_MAP[key]) return COLOR_MAP[key];
  for (const word of key.split(/\s+/)) {
    if (COLOR_MAP[word]) return COLOR_MAP[word];
  }
  return null;
}
