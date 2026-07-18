import { cropToOpaqueBounds } from "./imageCrop";
import { removeBackgroundLocally, LocalRemovalError } from "./localBackgroundRemoval";
import { removeBackground as removeBackgroundRemote, BackgroundRemovalError } from "./backgroundRemoval";

export type RemovalMethod = "local" | "remote";

export interface ProcessPhotoResult {
  image: Blob;
  method: RemovalMethod;
}

/**
 * Removes the background from a freshly taken/picked photo. Tries the free
 * on-device model first (no API key, nothing leaves the device); if that
 * fails for any reason and a remove.bg API key is configured, falls back to
 * the remote API instead of giving up.
 */
export async function processPhoto(
  file: Blob,
  apiKey: string,
  onProgress?: (ratio: number) => void,
): Promise<ProcessPhotoResult> {
  try {
    const localResult = await removeBackgroundLocally(file, onProgress);
    return { image: await cropToOpaqueBounds(localResult), method: "local" };
  } catch (localError) {
    if (!apiKey) {
      throw localError instanceof LocalRemovalError
        ? localError
        : new LocalRemovalError("Freistellung im Browser fehlgeschlagen.");
    }
    try {
      const remoteResult = await removeBackgroundRemote(file, apiKey);
      return { image: await cropToOpaqueBounds(remoteResult), method: "remote" };
    } catch (remoteError) {
      throw remoteError instanceof BackgroundRemovalError
        ? remoteError
        : new BackgroundRemovalError("Freistellung fehlgeschlagen.");
    }
  }
}
