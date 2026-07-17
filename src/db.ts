import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { ClothingItem, Outfit } from "./types";

interface WardrobeDB extends DBSchema {
  items: {
    key: string;
    value: ClothingItem;
    indexes: { "by-createdAt": number };
  };
  outfits: {
    key: string;
    value: Outfit;
    indexes: { "by-createdAt": number };
  };
}

let dbPromise: Promise<IDBPDatabase<WardrobeDB>> | null = null;

function getDB(): Promise<IDBPDatabase<WardrobeDB>> {
  if (!dbPromise) {
    dbPromise = openDB<WardrobeDB>("zoey-kleiderschrank", 1, {
      upgrade(db) {
        const items = db.createObjectStore("items", { keyPath: "id" });
        items.createIndex("by-createdAt", "createdAt");
        const outfits = db.createObjectStore("outfits", { keyPath: "id" });
        outfits.createIndex("by-createdAt", "createdAt");
      },
    });
  }
  return dbPromise;
}

export async function getAllItems(): Promise<ClothingItem[]> {
  const db = await getDB();
  const items = await db.getAllFromIndex("items", "by-createdAt");
  return items.reverse();
}

export async function putItem(item: ClothingItem): Promise<void> {
  const db = await getDB();
  await db.put("items", item);
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("items", id);
}

export async function getAllOutfits(): Promise<Outfit[]> {
  const db = await getDB();
  const outfits = await db.getAllFromIndex("outfits", "by-createdAt");
  return outfits.reverse();
}

export async function putOutfit(outfit: Outfit): Promise<void> {
  const db = await getDB();
  await db.put("outfits", outfit);
}

export async function deleteOutfit(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("outfits", id);
}

export async function clearAll(): Promise<void> {
  const db = await getDB();
  await db.clear("items");
  await db.clear("outfits");
}
