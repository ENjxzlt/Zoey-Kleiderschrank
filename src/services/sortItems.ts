import type { ClothingItem } from "../types";
import type { SortOption } from "./wardrobeViewPrefs";

export function sortItems(items: ClothingItem[], option: SortOption): ClothingItem[] {
  const sorted = [...items];
  switch (option) {
    case "alt":
      return sorted.reverse();
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));
    case "farbe":
      return sorted.sort((a, b) => {
        if (!a.color && !b.color) return a.name.localeCompare(b.name, "de", { sensitivity: "base" });
        if (!a.color) return 1;
        if (!b.color) return -1;
        const byColor = a.color.localeCompare(b.color, "de", { sensitivity: "base" });
        return byColor !== 0 ? byColor : a.name.localeCompare(b.name, "de", { sensitivity: "base" });
      });
    case "neu":
    default:
      return sorted;
  }
}
