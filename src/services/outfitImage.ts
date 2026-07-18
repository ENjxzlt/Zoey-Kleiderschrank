import { ACCESSORY_SIZE, FIGURE_ASPECT, ZONES, defaultAccessoryPosition, type ZoneRect } from "../figureLayout";
import type { ClothingItem } from "../types";

const CANVAS_WIDTH = 900;

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Bild konnte nicht geladen werden."));
    };
    img.src = url;
  });
}

function firstOf(items: ClothingItem[], category: ClothingItem["category"]): ClothingItem | undefined {
  return items.find((i) => i.category === category);
}

/** Mirrors the <svg viewBox="0 0 120 200"> stick figure drawn behind the
 * garments in OutfitFigure.tsx, so the download looks like the on-screen figure. */
function drawStickFigure(ctx: CanvasRenderingContext2D, width: number) {
  const s = width / 120; // viewBox is 120x200, same aspect ratio as the figure box

  ctx.save();
  ctx.strokeStyle = "#fecdd3";
  ctx.lineWidth = 2.5 * s;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.arc(60 * s, 22 * s, 16 * s, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(60 * s, 38 * s);
  ctx.lineTo(60 * s, 130 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(60 * s, 46 * s);
  ctx.quadraticCurveTo(30 * s, 46 * s, 24 * s, 90 * s);
  ctx.lineTo(20 * s, 130 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(60 * s, 46 * s);
  ctx.quadraticCurveTo(90 * s, 46 * s, 96 * s, 90 * s);
  ctx.lineTo(100 * s, 130 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(40 * s, 128 * s);
  ctx.quadraticCurveTo(40 * s, 170 * s, 32 * s, 196 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(80 * s, 128 * s);
  ctx.quadraticCurveTo(80 * s, 170 * s, 88 * s, 196 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(34 * s, 92 * s);
  ctx.quadraticCurveTo(60 * s, 108 * s, 86 * s, 92 * s);
  ctx.stroke();

  ctx.restore();
}

/** Draws a garment the same way the CSS does: object-contain within the zone,
 * scaled and translated around the zone's own center. */
function drawZoneItem(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  zone: ZoneRect,
  scale: number,
  position: { x: number; y: number },
  canvasWidth: number,
  canvasHeight: number,
) {
  const boxX = (zone.left / 100) * canvasWidth;
  const boxY = (zone.top / 100) * canvasHeight;
  const boxW = (zone.width / 100) * canvasWidth;
  const boxH = (zone.height / 100) * canvasHeight;

  const fitScale = Math.min(boxW / img.width, boxH / img.height);
  const drawW = img.width * fitScale * scale;
  const drawH = img.height * fitScale * scale;

  const centerX = boxX + boxW / 2 + (position.x / 100) * boxW;
  const centerY = boxY + boxH / 2 + (position.y / 100) * boxH;

  ctx.drawImage(img, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
}

function drawAccessory(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  position: { x: number; y: number },
  scale: number,
  canvasWidth: number,
  canvasHeight: number,
) {
  const boxW = (ACCESSORY_SIZE.width / 100) * canvasWidth;
  const boxH = (ACCESSORY_SIZE.height / 100) * canvasHeight;
  const centerX = (position.x / 100) * canvasWidth;
  const centerY = (position.y / 100) * canvasHeight;

  const fitScale = Math.min(boxW / img.width, boxH / img.height);
  const drawW = img.width * fitScale * scale;
  const drawH = img.height * fitScale * scale;

  ctx.drawImage(img, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
}

export async function renderOutfitToBlob(
  items: ClothingItem[],
  scales: Record<string, number>,
  positions: Record<string, { x: number; y: number }>,
  outfitName: string,
): Promise<Blob> {
  const width = CANVAS_WIDTH;
  const figureHeight = Math.round(width / FIGURE_ASPECT);
  const titleHeight = outfitName.trim() ? 70 : 0;
  const height = figureHeight + titleHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas wird nicht unterstützt.");

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#fff1f4");
  gradient.addColorStop(1, "#ffe4ea");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (outfitName.trim()) {
    ctx.fillStyle = "#9d174d";
    ctx.font = "600 32px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(outfitName.trim(), width / 2, titleHeight / 2);
  }

  const kleid = firstOf(items, "kleid");
  const oberteil = firstOf(items, "oberteil");
  const jacke = firstOf(items, "jacke");
  const bottom = firstOf(items, "hose") ?? firstOf(items, "rock");
  const schuhe = firstOf(items, "schuhe");
  const kopfbedeckung = firstOf(items, "kopfbedeckung");
  const accessoires = items.filter((i) => i.category === "accessoire");
  const showKleid = Boolean(kleid) && !oberteil && !bottom;

  // Draw order mirrors the on-screen z-index stacking in OutfitFigure.tsx
  // (bottom < schuhe < oberteil/kleid < jacke < kopfbedeckung < accessoires).
  const drawOrder: { item: ClothingItem | undefined; zone: ZoneRect }[] = showKleid
    ? [
        { item: schuhe, zone: ZONES.schuhe },
        { item: kleid, zone: ZONES.kleid },
      ]
    : [
        { item: bottom, zone: ZONES.bottom },
        { item: schuhe, zone: ZONES.schuhe },
        { item: oberteil ?? kleid, zone: ZONES.oberteil },
      ];
  drawOrder.push(
    { item: jacke, zone: ZONES.jacke },
    { item: kopfbedeckung, zone: ZONES.kopfbedeckung },
  );

  ctx.save();
  ctx.translate(0, titleHeight);
  drawStickFigure(ctx, width);

  for (const { item, zone } of drawOrder) {
    if (!item) continue;
    const img = await loadImage(item.image);
    drawZoneItem(ctx, img, zone, scales[item.id] ?? 1, positions[item.id] ?? { x: 0, y: 0 }, width, figureHeight);
  }

  for (const [index, item] of accessoires.entries()) {
    const img = await loadImage(item.image);
    const position = positions[item.id] ?? defaultAccessoryPosition(index);
    drawAccessory(ctx, img, position, scales[item.id] ?? 1, width, figureHeight);
  }
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Bild konnte nicht erstellt werden."));
    }, "image/png");
  });
}
