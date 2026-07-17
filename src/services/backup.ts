import { getAllItems, getAllOutfits, putItem, putOutfit } from "../db";
import type { ClothingItem, Outfit } from "../types";

interface ExportedItem extends Omit<ClothingItem, "image"> {
  image: string;
}

interface ExportPayload {
  version: 1;
  exportedAt: number;
  items: ExportedItem[];
  outfits: Outfit[];
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function exportBackup(): Promise<void> {
  const [items, outfits] = await Promise.all([getAllItems(), getAllOutfits()]);
  const exportedItems: ExportedItem[] = await Promise.all(
    items.map(async (item) => ({ ...item, image: await blobToDataUrl(item.image) })),
  );
  const payload: ExportPayload = {
    version: 1,
    exportedAt: Date.now(),
    items: exportedItems,
    outfits,
  };

  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kleiderschrank-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File): Promise<void> {
  const text = await file.text();
  const payload: ExportPayload = JSON.parse(text);

  for (const item of payload.items) {
    const image = await dataUrlToBlob(item.image);
    await putItem({ ...item, image });
  }
  for (const outfit of payload.outfits) {
    await putOutfit(outfit);
  }
}
