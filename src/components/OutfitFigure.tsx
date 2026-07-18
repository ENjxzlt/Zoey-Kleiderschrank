import type { CSSProperties } from "react";
import { useState } from "react";
import ImageThumb from "./ImageThumb";
import type { Category, ClothingItem } from "../types";

const MIN_SCALE = 0.6;
const MAX_SCALE = 1.8;

interface OutfitFigureProps {
  items: ClothingItem[];
  scales: Record<string, number>;
  onScaleChange: (itemId: string, scale: number) => void;
  onRemove: (item: ClothingItem) => void;
}

function firstOf(items: ClothingItem[], category: Category): ClothingItem | undefined {
  return items.find((i) => i.category === category);
}

export default function OutfitFigure({
  items,
  scales,
  onScaleChange,
  onRemove,
}: OutfitFigureProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const kleid = firstOf(items, "kleid");
  const oberteil = firstOf(items, "oberteil");
  const jacke = firstOf(items, "jacke");
  const bottom = firstOf(items, "hose") ?? firstOf(items, "rock");
  const schuhe = firstOf(items, "schuhe");
  const accessoires = items.filter((i) => i.category === "accessoire");

  const showKleid = Boolean(kleid) && !oberteil && !bottom;
  const activeItem = items.find((i) => i.id === activeId);

  function toggleActive(item: ClothingItem) {
    setActiveId((prev) => (prev === item.id ? null : item.id));
  }

  return (
    <div>
      <div className="relative mx-auto aspect-[3/5] w-full max-w-[240px]">
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

        <FigureZone
          style={{ top: "1%", right: "2%", width: "26%", height: "16%" }}
          item={accessoires[0]}
          scale={accessoires[0] ? (scales[accessoires[0].id] ?? 1) : 1}
          active={accessoires[0]?.id === activeId}
          emoji="👜"
          onSelect={toggleActive}
          onRemove={onRemove}
          zIndex={40}
        />

        {accessoires.length > 1 && (
          <div className="absolute right-[1%] top-[17%] flex gap-1">
            {accessoires.slice(1, 4).map((a) => (
              <button
                key={a.id}
                onClick={() => onRemove(a)}
                className="h-6 w-6 overflow-hidden rounded-full border border-white bg-rose-50 shadow dark:border-neutral-800 dark:bg-neutral-800"
              >
                <ImageThumb image={a.image} alt={a.name} className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        )}

        {showKleid ? (
          <FigureZone
            style={{ top: "17%", left: "18%", width: "64%", height: "58%" }}
            item={kleid}
            scale={kleid ? (scales[kleid.id] ?? 1) : 1}
            active={kleid?.id === activeId}
            emoji="👘"
            onSelect={toggleActive}
            onRemove={onRemove}
            zIndex={20}
          />
        ) : (
          <>
            <FigureZone
              style={{ top: "21%", left: "23%", width: "54%", height: "32%" }}
              item={oberteil ?? kleid}
              scale={oberteil ? (scales[oberteil.id] ?? 1) : 1}
              active={oberteil?.id === activeId}
              emoji="👕"
              onSelect={toggleActive}
              onRemove={onRemove}
              zIndex={20}
            />
            <FigureZone
              style={{ top: "50%", left: "25%", width: "50%", height: "38%" }}
              item={bottom}
              scale={bottom ? (scales[bottom.id] ?? 1) : 1}
              active={bottom?.id === activeId}
              emoji="👖"
              onSelect={toggleActive}
              onRemove={onRemove}
              zIndex={10}
            />
          </>
        )}

        <FigureZone
          style={{ top: "17%", left: "12%", width: "76%", height: "44%" }}
          item={jacke}
          scale={jacke ? (scales[jacke.id] ?? 1) : 1}
          active={jacke?.id === activeId}
          emoji="🧥"
          onSelect={toggleActive}
          onRemove={onRemove}
          zIndex={30}
          optional
        />

        <FigureZone
          style={{ top: "88%", left: "27%", width: "46%", height: "11%" }}
          item={schuhe}
          scale={schuhe ? (scales[schuhe.id] ?? 1) : 1}
          active={schuhe?.id === activeId}
          emoji="👟"
          onSelect={toggleActive}
          onRemove={onRemove}
          zIndex={15}
        />
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
            className="w-28 accent-rose-600"
          />
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
  active,
  emoji,
  onSelect,
  onRemove,
  zIndex,
  optional,
}: {
  style: CSSProperties;
  item: ClothingItem | undefined;
  scale: number;
  active: boolean;
  emoji: string;
  onSelect: (item: ClothingItem) => void;
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
        onClick={() => onSelect(item)}
        className={`flex h-full w-full items-center justify-center rounded-xl transition ${
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
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item);
        }}
        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-[10px] text-white shadow"
      >
        ✕
      </button>
    </div>
  );
}
