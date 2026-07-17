import type { CSSProperties } from "react";
import ImageThumb from "./ImageThumb";
import type { Category, ClothingItem } from "../types";

interface OutfitFigureProps {
  items: ClothingItem[];
  onRemove: (item: ClothingItem) => void;
}

function firstOf(items: ClothingItem[], category: Category): ClothingItem | undefined {
  return items.find((i) => i.category === category);
}

export default function OutfitFigure({ items, onRemove }: OutfitFigureProps) {
  const kleid = firstOf(items, "kleid");
  const oberteil = firstOf(items, "oberteil");
  const jacke = firstOf(items, "jacke");
  const bottom = firstOf(items, "hose") ?? firstOf(items, "rock");
  const schuhe = firstOf(items, "schuhe");
  const accessoires = items.filter((i) => i.category === "accessoire");

  const showKleid = Boolean(kleid) && !oberteil && !bottom;

  return (
    <div className="relative mx-auto aspect-[3/5] w-full max-w-[240px]">
      <svg
        viewBox="0 0 120 200"
        className="absolute inset-0 h-full w-full text-rose-200"
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
        emoji="👜"
        onClick={onRemove}
        zIndex={40}
      />

      {accessoires.length > 1 && (
        <div className="absolute right-[1%] top-[17%] flex gap-1">
          {accessoires.slice(1, 4).map((a) => (
            <button
              key={a.id}
              onClick={() => onRemove(a)}
              className="h-6 w-6 overflow-hidden rounded-full border border-white bg-rose-50 shadow"
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
          emoji="👘"
          onClick={onRemove}
          zIndex={20}
        />
      ) : (
        <>
          <FigureZone
            style={{ top: "21%", left: "23%", width: "54%", height: "32%" }}
            item={oberteil ?? kleid}
            emoji="👕"
            onClick={onRemove}
            zIndex={20}
          />
          <FigureZone
            style={{ top: "50%", left: "25%", width: "50%", height: "38%" }}
            item={bottom}
            emoji="👖"
            onClick={onRemove}
            zIndex={10}
          />
        </>
      )}

      <FigureZone
        style={{ top: "17%", left: "12%", width: "76%", height: "44%" }}
        item={jacke}
        emoji="🧥"
        onClick={onRemove}
        zIndex={30}
        optional
      />

      <FigureZone
        style={{ top: "88%", left: "27%", width: "46%", height: "11%" }}
        item={schuhe}
        emoji="👟"
        onClick={onRemove}
        zIndex={15}
      />
    </div>
  );
}

function FigureZone({
  style,
  item,
  emoji,
  onClick,
  zIndex,
  optional,
}: {
  style: CSSProperties;
  item: ClothingItem | undefined;
  emoji: string;
  onClick: (item: ClothingItem) => void;
  zIndex: number;
  optional?: boolean;
}) {
  if (!item) {
    if (optional) return null;
    return (
      <div
        className="absolute flex items-center justify-center rounded-xl border border-dashed border-rose-200 text-lg opacity-40"
        style={{ ...style, zIndex }}
      >
        {emoji}
      </div>
    );
  }

  return (
    <button
      onClick={() => onClick(item)}
      className="absolute flex items-center justify-center rounded-xl"
      style={{ ...style, zIndex }}
      title={item.name}
    >
      <ImageThumb
        image={item.image}
        alt={item.name}
        className="h-full w-full object-contain drop-shadow-md"
      />
    </button>
  );
}
