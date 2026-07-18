export class LocalRemovalError extends Error {}

/**
 * Removes the background entirely in the browser (WASM/ONNX via @imgly/background-removal).
 * No photo ever leaves the device; the model is downloaded once and cached by the
 * service worker afterwards. Dynamically imported so the ~model-loading code doesn't
 * bloat the initial app bundle for users who never add a photo.
 */
export async function removeBackgroundLocally(
  image: Blob,
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  try {
    const { removeBackground } = await import("@imgly/background-removal");
    return await removeBackground(image, {
      model: "isnet_quint8",
      proxyToWorker: true,
      progress: (_key, current, total) => {
        if (onProgress && total > 0) onProgress(current / total);
      },
    });
  } catch (err) {
    console.error("On-device background removal failed:", err);
    throw new LocalRemovalError(
      "Freistellung im Browser fehlgeschlagen (evtl. keine Internetverbindung beim ersten " +
        "Laden des Modells, oder der Browser unterstützt es nicht).",
    );
  }
}
