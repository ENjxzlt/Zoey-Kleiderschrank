import type { ClothingItem } from "../types";
import { categoryEmoji } from "../types";
import { useObjectUrl } from "../hooks/useObjectUrl";
import { resolveColorSwatch } from "../services/colorSwatch";

interface ItemCardProps {
  item: ClothingItem;
  onClick?: () => void;
  selected?: boolean;
  dense?: boolean;
}

export default function ItemCard({ item, onClick, selected, dense }: ItemCardProps) {
  const url = useObjectUrl(item.image);
  const swatch = resolveColorSwatch(item.color);

  return (
    <button
      onClick={onClick}
      className={`flex flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition dark:bg-neutral-900 ${
        selected
          ? "border-rose-500 ring-2 ring-rose-300 dark:ring-rose-800"
          : "border-rose-100 dark:border-neutral-700"
      }`}
    >
      <div className="relative flex aspect-square items-center justify-center bg-[repeating-conic-gradient(#f9f4f4_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] p-2 dark:bg-[repeating-conic-gradient(#262626_0%_25%,#171717_0%_50%)]">
        {url ? (
          <img src={url} alt={item.name} className="h-full w-full object-contain" />
        ) : (
          <div className="h-full w-full animate-pulse rounded-xl bg-rose-100 dark:bg-neutral-800" />
        )}
        <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[11px] shadow-sm backdrop-blur dark:bg-neutral-900/80">
          {categoryEmoji(item.category)}
        </span>
        {swatch && (
          <span
            className="absolute bottom-1.5 right-1.5 h-3.5 w-3.5 rounded-full border border-white/80 shadow-sm dark:border-neutral-900/80"
            style={{ backgroundColor: swatch }}
            title={item.color}
          />
        )}
      </div>
      <div className="px-2 py-1.5">
        <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">{item.name}</p>
        {dense && item.color && (
          <p className="truncate text-[10px] text-gray-400 dark:text-gray-500">{item.color}</p>
        )}
      </div>
    </button>
  );
}
