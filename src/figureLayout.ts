/**
 * Shared geometry for the outfit figure, in percent of the figure box.
 * Used by both the on-screen OutfitFigure component and the canvas-based
 * image export, so the two stay pixel-consistent with each other.
 */

export const FIGURE_ASPECT = 3 / 5; // width / height

export interface ZoneRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const ZONES: Record<"kleid" | "oberteil" | "bottom" | "jacke" | "schuhe" | "kopfbedeckung", ZoneRect> = {
  kleid: { top: 17, left: 18, width: 64, height: 58 },
  oberteil: { top: 21, left: 23, width: 54, height: 32 },
  bottom: { top: 50, left: 25, width: 50, height: 38 },
  jacke: { top: 17, left: 12, width: 76, height: 44 },
  schuhe: { top: 88, left: 27, width: 46, height: 11 },
  kopfbedeckung: { top: -3, left: 30, width: 40, height: 22 },
};

export const ACCESSORY_SIZE = { width: 24, height: 14 };

export function defaultAccessoryPosition(index: number): { x: number; y: number } {
  return { x: 80, y: 10 + index * 16 };
}

export function zoneStyle(zone: ZoneRect): {
  top: string;
  left: string;
  width: string;
  height: string;
} {
  return {
    top: `${zone.top}%`,
    left: `${zone.left}%`,
    width: `${zone.width}%`,
    height: `${zone.height}%`,
  };
}
