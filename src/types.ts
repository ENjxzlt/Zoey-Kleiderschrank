export type Category =
  | "oberteil"
  | "hose"
  | "kleid"
  | "rock"
  | "jacke"
  | "schuhe"
  | "kopfbedeckung"
  | "accessoire";

export interface CategoryMeta {
  id: Category;
  label: string;
  emoji: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "oberteil", label: "Oberteile", emoji: "👕" },
  { id: "hose", label: "Hosen", emoji: "👖" },
  { id: "rock", label: "Röcke", emoji: "👗" },
  { id: "kleid", label: "Kleider", emoji: "👘" },
  { id: "jacke", label: "Jacken", emoji: "🧥" },
  { id: "schuhe", label: "Schuhe", emoji: "👟" },
  { id: "kopfbedeckung", label: "Kopfbedeckungen", emoji: "🧢" },
  { id: "accessoire", label: "Accessoires", emoji: "👜" },
];

export function categoryLabel(id: Category): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function categoryEmoji(id: Category): string {
  return CATEGORIES.find((c) => c.id === id)?.emoji ?? "🏷️";
}

export interface ClothingItem {
  id: string;
  name: string;
  category: Category;
  color?: string;
  image: Blob;
  createdAt: number;
}

export interface Outfit {
  id: string;
  name: string;
  itemIds: string[];
  /** Per-item size multiplier on the outfit figure (1 = auto-fit). */
  itemScales?: Record<string, number>;
  /** Per-item drag offset on the outfit figure, in % of the figure size. */
  itemPositions?: Record<string, { x: number; y: number }>;
  createdAt: number;
}
