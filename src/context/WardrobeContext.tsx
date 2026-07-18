import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as db from "../db";
import type { ClothingItem, Outfit } from "../types";

interface WardrobeContextValue {
  items: ClothingItem[];
  outfits: Outfit[];
  loading: boolean;
  addItem: (item: ClothingItem) => Promise<void>;
  updateItem: (item: ClothingItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  saveOutfit: (outfit: Outfit) => Promise<void>;
  removeOutfit: (id: string) => Promise<void>;
  itemsById: Map<string, ClothingItem>;
  reload: () => Promise<void>;
}

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [loadedItems, loadedOutfits] = await Promise.all([
      db.getAllItems(),
      db.getAllOutfits(),
    ]);
    setItems(loadedItems);
    setOutfits(loadedOutfits);
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  const addItem = useCallback(async (item: ClothingItem) => {
    await db.putItem(item);
    setItems((prev) => [item, ...prev]);
  }, []);

  const updateItem = useCallback(async (item: ClothingItem) => {
    await db.putItem(item);
    setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  }, []);

  const removeItem = useCallback(async (id: string) => {
    await db.deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setOutfits((prev) => {
      const updated = prev.map((o) => ({
        ...o,
        itemIds: o.itemIds.filter((itemId) => itemId !== id),
      }));
      updated.forEach((o) => void db.putOutfit(o));
      return updated;
    });
  }, []);

  const saveOutfit = useCallback(async (outfit: Outfit) => {
    await db.putOutfit(outfit);
    setOutfits((prev) => {
      const exists = prev.some((o) => o.id === outfit.id);
      if (exists) {
        return prev.map((o) => (o.id === outfit.id ? outfit : o));
      }
      return [outfit, ...prev];
    });
  }, []);

  const removeOutfit = useCallback(async (id: string) => {
    await db.deleteOutfit(id);
    setOutfits((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const itemsById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const value: WardrobeContextValue = {
    items,
    outfits,
    loading,
    addItem,
    updateItem,
    removeItem,
    saveOutfit,
    removeOutfit,
    itemsById,
    reload,
  };

  return <WardrobeContext.Provider value={value}>{children}</WardrobeContext.Provider>;
}

export function useWardrobe(): WardrobeContextValue {
  const ctx = useContext(WardrobeContext);
  if (!ctx) throw new Error("useWardrobe must be used within WardrobeProvider");
  return ctx;
}
