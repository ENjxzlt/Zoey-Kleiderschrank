/**
 * Crops transparent margins so the garment fills its image edge-to-edge.
 * remove.bg keeps the original photo canvas, so the cutout is often tiny
 * inside a mostly-transparent frame — without this, the figure view shows
 * garments far smaller than their body zone.
 */
export async function cropToOpaqueBounds(blob: Blob, padding = 0.03): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return blob;
  ctx.drawImage(bitmap, 0, 0);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const alphaThreshold = 10;

  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < canvas.height; y++) {
    const rowOffset = y * canvas.width;
    for (let x = 0; x < canvas.width; x++) {
      if (data[(rowOffset + x) * 4 + 3] > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return blob;

  const padX = Math.round((maxX - minX) * padding);
  const padY = Math.round((maxY - minY) * padding);
  minX = Math.max(0, minX - padX);
  minY = Math.max(0, minY - padY);
  maxX = Math.min(canvas.width - 1, maxX + padX);
  maxY = Math.min(canvas.height - 1, maxY + padY);

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) return blob;
  outCtx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);

  return new Promise((resolve) => {
    outCanvas.toBlob((result) => resolve(result ?? blob), "image/png");
  });
}
