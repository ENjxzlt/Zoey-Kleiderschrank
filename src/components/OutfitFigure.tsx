import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useRef, useState } from "react";
import ImageThumb from "./ImageThumb";
import type { Category, ClothingItem } from "../types";

const MIN_SCALE = 0.6;
const MAX_SCALE = 1.8;
const MAX_OFFSET = 45;
const ACCESSORY_MIN = 8;
const ACCESSORY_MAX = 92;
const DRAG_THRESHOLD_PX = 4;

type Position = { x: number; y: number };
type Bounds = { min: number; max: number };

const ORIGIN: Position = { x: 0, y: 0 };
const ZONE_BOUNDS: Bounds = { min: -MAX_OFFSET, max: MAX_OFFSET };
const ACCESSORY_BOUNDS: Bounds = { min: ACCESSORY_MIN, max: ACCESSORY_MAX };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function defaultAccessoryPosition(index: number): Position {
  return { x: 80, y: 10 + index * 16 };
}

interface OutfitFigureProps {
  items: ClothingItem[];
  scales: Record<string, number>;
  onScaleChange: (itemId: string, scale: number) => void;
  positions: Record<string, Position>;
  onPositionChange: (itemId: string, position: Position) => void;
  onRemove: (item: ClothingItem) => void;
}

function firstOf(items: ClothingItem[], category: Category): ClothingItem | undefined {
  return items.find((i) => i.category === category);
}

export default function OutfitFigure({
  items,
  scales,
  onScaleChange,
  positions,
  onPositionChange,
  onRemove,
}: OutfitFigureProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [livePosition, setLivePosition] = useState<{ id: string; pos: Position } | null>(null);

  const kleid = firstOf(items, "kleid");
  const oberteil = firstOf(items, "oberteil");
  const jacke = firstOf(items, "jacke");
  const bottom = firstOf(items, "hose") ?? firstOf(items, "rock");
  const schuhe = firstOf(items, "schuhe");
  const kopfbedeckung = firstOf(items, "kopfbedeckung");
  const accessoires = items.filter((i) => i.category === "accessoire");

  const showKleid = Boolean(kleid) && !oberteil && !bottom;
  const activeItem = items.find((i) => i.id === activeId);

  function positionOf(item: ClothingItem | undefined, fallback: Position): Position {
    if (!item) return fallback;
    if (livePosition?.id === item.id) return livePosition.pos;
    return positions[item.id] ?? fallback;
  }

  function beginDrag(
    item: ClothingItem,
    fallbackPos: Position,
    bounds: Bounds,
    e: ReactPointerEvent<HTMLButtonElement>,
  ) {
    e.preventDefault();
    const drag = {
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      startPos: positions[item.id] ?? fallbackPos,
      pos: positions[item.id] ?? fallbackPos,
      moved: false,
    };

    function onMove(ev: PointerEvent) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const dxPx = ev.clientX - drag.startX;
      const dyPx = ev.clientY - drag.startY;
      if (Math.abs(dxPx) > DRAG_THRESHOLD_PX || Math.abs(dyPx) > DRAG_THRESHOLD_PX) {
        drag.moved = true;
      }
      if (!drag.moved) return;

      drag.pos = {
        x: clamp(drag.startPos.x + (dxPx / rect.width) * 100, bounds.min, bounds.max),
        y: clamp(drag.startPos.y + (dyPx / rect.height) * 100, bounds.min, bounds.max),
      };
      setLivePosition({ id: drag.id, pos: drag.pos });
    }

    function onEnd() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      setLivePosition(null);

      if (drag.moved) {
        onPositionChange(drag.id, drag.pos);
      } else {
        setActiveId((prev) => (prev === drag.id ? null : drag.id));
      }
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  }

  function startDragZone(item: ClothingItem, e: ReactPointerEvent<HTMLButtonElement>) {
    beginDrag(item, ORIGIN, ZONE_BOUNDS, e);
  }

  function startDragAccessory(
    item: ClothingItem,
    index: number,
    e: ReactPointerEvent<HTMLButtonElement>,
  ) {
    beginDrag(item, defaultAccessoryPosition(index), ACCESSORY_BOUNDS, e);
  }

  function resetActiveItemPosition() {
    if (!activeItem) return;
    const accessoryIndex = accessoires.findIndex((a) => a.id === activeItem.id);
    onPositionChange(
      activeItem.id,
      accessoryIndex >= 0 ? defaultAccessoryPosition(accessoryIndex) : ORIGIN,
    );
  }

  return (
    <div>
      <div
        ref={containerRef}
        className="relative mx-auto aspect-[3/5] w-full max-w-[240px] touch-none"
      >
        <svg
          viewBox="0 0 120 200"
          className="absolute inset-0 h-full w-full text-rose-200 dark:text-neutral-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="60" cy="22" r="16" />
          <path d="M60 38 L60 130" />
          <path d="M60 46 Q30 46 24 90 L20 130" />
          <path d="M60 46 Q90 46 96 90 L100 130" />
          <path d="M40 128 Q40 170 32 196" />
          <path d="M80 128 Q80 170 88 196" />
          <path d="M34 92 Q60 108 86 92" />
        </svg>

        {showKleid ? (
          <FigureZone
            style={{ top: "17%", left: "18%", width: "64%", height: "58%" }}
            item={kleid}
            scale={kleid ? (scales[kleid.id] ?? 1) : 1}
            position={positionOf(kleid, ORIGIN)}
            active={kleid?.id === activeId}
            emoji="👘"
            onPointerDownItem={startDragZone}
            onRemove={onRemove}
            zIndex={20}
          />
        ) : (
          <>
            <FigureZone
              style={{ top: "21%", left: "23%", width: "54%", height: "32%" }}
              item={oberteil ?? kleid}
              scale={oberteil ? (scales[oberteil.id] ?? 1) : 1}
              position={positionOf(oberteil, ORIGIN)}
              active={oberteil?.id === activeId}
              emoji="👕"
              onPointerDownItem={startDragZone}
              onRemove={onRemove}
              zIndex={20}
            />
            <FigureZone
              style={{ top: "50%", left: "25%", width: "50%", height: "38%" }}
              item={bottom}
              scale={bottom ? (scales[bottom.id] ?? 1) : 1}
              position={positionOf(bottom, ORIGIN)}
              active={bottom?.id === activeId}
              emoji="👖"
              onPointerDownItem={startDragZone}
              onRemove={onRemove}
              zIndex={10}
            />
          </>
        )}

        <FigureZone
          style={{ top: "17%", left: "12%", width: "76%", height: "44%" }}
          item={jacke}
          scale={jacke ? (scales[jacke.id] ?? 1) : 1}
          position={positionOf(jacke, ORIGIN)}
          active={jacke?.id === activeId}
          emoji="🧥"
          onPointerDownItem={startDragZone}
          onRemove={onRemove}
          zIndex={30}
          optional
        />

        <FigureZone
          style={{ top: "88%", left: "27%", width: "46%", height: "11%" }}
          item={schuhe}
          scale={schuhe ? (scales[schuhe.id] ?? 1) : 1}
          position={positionOf(schuhe, ORIGIN)}
          active={schuhe?.id === activeId}
          emoji="👟"
          onPointerDownItem={startDragZone}
          onRemove={onRemove}
          zIndex={15}
        />

        <FigureZone
          style={{ top: "-3%", left: "30%", width: "40%", height: "22%" }}
          item={kopfbedeckung}
          scale={kopfbedeckung ? (scales[kopfbedeckung.id] ?? 1) : 1}
          position={positionOf(kopfbedeckung, ORIGIN)}
          active={kopfbedeckung?.id === activeId}
          emoji="🧢"
          onPointerDownItem={startDragZone}
          onRemove={onRemove}
          zIndex={45}
          optional
        />

        {accessoires.map((a, index) => (
          <AccessoryBadge
            key={a.id}
            item={a}
            position={positionOf(a, defaultAccessoryPosition(index))}
            scale={scales[a.id] ?? 1}
            active={a.id === activeId}
            onPointerDownItem={(item, e) => startDragAccessory(item, index, e)}
            onRemove={onRemove}
            zIndex={60 + index}
          />
        ))}
      </div>

      {activeItem && (
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-rose-50 px-3 py-2 dark:bg-neutral-800">
          <span className="flex-1 truncate text-xs font-medium text-gray-600 dark:text-gray-300">
            {activeItem.name}
          </span>
          <input
            type="range"
            min={MIN_SCALE}
            max={MAX_SCALE}
            step={0.05}
            value={scales[activeItem.id] ?? 1}
            onChange={(e) => onScaleChange(activeItem.id, Number(e.target.value))}
            className="w-24 accent-rose-600"
          />
          <button
            onClick={resetActiveItemPosition}
            className="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            Zentrieren
          </button>
          <button
            onClick={() => setActiveId(null)}
            className="shrink-0 text-xs font-medium text-rose-600 dark:text-rose-400"
          >
            Fertig
          </button>
        </div>
      )}
    </div>
  );
}

function FigureZone({
  style,
  item,
  scale,
  position,
  active,
  emoji,
  onPointerDownItem,
  onRemove,
  zIndex,
  optional,
}: {
  style: CSSProperties;
  item: ClothingItem | undefined;
  scale: number;
  position: Position;
  active: boolean;
  emoji: string;
  onPointerDownItem: (item: ClothingItem, e: ReactPointerEvent<HTMLButtonElement>) => void;
  onRemove: (item: ClothingItem) => void;
  zIndex: number;
  optional?: boolean;
}) {
  if (!item) {
    if (optional) return null;
    return (
      <div
        className="absolute flex items-center justify-center rounded-xl border border-dashed border-rose-200 text-lg opacity-40 dark:border-neutral-700"
        style={{ ...style, zIndex }}
      >
        {emoji}
      </div>
    );
  }

  return (
    <div className="absolute" style={{ ...style, zIndex }}>
      <button
        onPointerDown={(e) => onPointerDownItem(item, e)}
        className={`flex h-full w-full touch-none items-center justify-center rounded-xl transition ${
          active ? "outline outline-2 outline-offset-2 outline-rose-400" : ""
        }`}
        title={item.name}
      >
        <ImageThumb
          image={item.image}
          alt={item.name}
          className="h-full w-full object-contain drop-shadow-md"
          style={{ transform: `translate(${position.x}%, ${position.y}%) scale(${scale})` }}
        />
      </button>
      <button
        onClick={() => onRemove(item)}
        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-[10px] text-white shadow"
      >
        ✕
      </button>
    </div>
  );
}

function AccessoryBadge({
  item,
  position,
  scale,
  active,
  onPointerDownItem,
  onRemove,
  zIndex,
}: {
  item: ClothingItem;
  position: Position;
  scale: number;
  active: boolean;
  onPointerDownItem: (item: ClothingItem, e: ReactPointerEvent<HTMLButtonElement>) => void;
  onRemove: (item: ClothingItem) => void;
  zIndex: number;
}) {
  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: "24%",
        height: "14%",
        transform: "translate(-50%, -50%)",
        zIndex,
      }}
    >
      <button
        onPointerDown={(e) => onPointerDownItem(item, e)}
        className={`flex h-full w-full touch-none items-center justify-center rounded-xl transition ${
          active ? "outline outline-2 outline-offset-2 outline-rose-400" : ""
        }`}
        title={item.name}
      >
        <ImageThumb
          image={item.image}
          alt={item.name}
          className="h-full w-full object-contain drop-shadow-md"
          style={{ transform: `scale(${scale})` }}
        />
      </button>
      <button
        onClick={() => onRemove(item)}
        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-[10px] text-white shadow"
      >
        ✕
      </button>
    </div>
  );
}
