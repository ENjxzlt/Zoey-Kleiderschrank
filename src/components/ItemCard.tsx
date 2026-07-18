import type { ClothingItem } from "../types";
import { useObjectUrl } from "../hooks/useObjectUrl";

interface ItemCardProps {
  item: ClothingItem;
  onClick?: () => void;
  selected?: boolean;
}

export default function ItemCard({ item, onClick, selected }: ItemCardProps) {
  const url = useObjectUrl(item.image);

  return (
    <button
      onClick={onClick}
      className={`flex flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition dark:bg-neutral-900 ${
        selected
          ? "border-rose-500 ring-2 ring-rose-300 dark:ring-rose-800"
          : "border-rose-100 dark:border-neutral-700"
      }`}
    >
      <div className="flex aspect-square items-center justify-center bg-[repeating-conic-gradient(#f9f4f4_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] p-2 dark:bg-[repeating-conic-gradient(#262626_0%_25%,#171717_0%_50%)]">
        {url ? (
          <img src={url} alt={item.name} className="h-full w-full object-contain" />
        ) : (
          <div className="h-full w-full animate-pulse rounded-xl bg-rose-100 dark:bg-neutral-800" />
        )}
      </div>
      <div className="px-2 py-1.5">
        <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">{item.name}</p>
      </div>
    </button>
  );
}
