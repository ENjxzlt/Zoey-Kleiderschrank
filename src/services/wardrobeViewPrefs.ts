export type SortOption = "neu" | "alt" | "name" | "farbe";
export type GridDensity = "kompakt" | "gross";

const SORT_STORAGE = "zoey-kleiderschrank:sort";
const DENSITY_STORAGE = "zoey-kleiderschrank:density";

export const SORT_LABELS: Record<SortOption, string> = {
  neu: "Neueste zuerst",
  alt: "Älteste zuerst",
  name: "Name (A–Z)",
  farbe: "Farbe",
};

export function getSortOption(): SortOption {
  const value = localStorage.getItem(SORT_STORAGE);
  return value === "alt" || value === "name" || value === "farbe" ? value : "neu";
}

export function setSortOption(option: SortOption): void {
  localStorage.setItem(SORT_STORAGE, option);
}

export function getGridDensity(): GridDensity {
  return localStorage.getItem(DENSITY_STORAGE) === "gross" ? "gross" : "kompakt";
}

export function setGridDensity(density: GridDensity): void {
  localStorage.setItem(DENSITY_STORAGE, density);
}
