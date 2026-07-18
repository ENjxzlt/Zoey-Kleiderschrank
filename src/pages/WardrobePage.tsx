import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWardrobe } from "../context/WardrobeContext";
import { useObjectUrl } from "../hooks/useObjectUrl";
import CategoryPicker from "../components/CategoryPicker";
import ItemCard from "../components/ItemCard";
import PageHeader from "../components/PageHeader";
import { categoryEmoji, categoryLabel, type Category } from "../types";
import type { ClothingItem } from "../types";
import { sortItems } from "../services/sortItems";
import {
  SORT_LABELS,
  getGridDensity,
  getSortOption,
  setGridDensity,
  setSortOption,
  type GridDensity,
  type SortOption,
} from "../services/wardrobeViewPrefs";

export default function WardrobePage() {
  const { items, loading, removeItem } = useWardrobe();
  const [filter, setFilter] = useState<Category | "alle">("alle");
  const [selected, setSelected] = useState<ClothingItem | null>(null);
  const [sort, setSort] = useState<SortOption>(getSortOption);
  const [density, setDensity] = useState<GridDensity>(getGridDensity);
  const navigate = useNavigate();

  useEffect(() => setSortOption(sort), [sort]);
  useEffect(() => setGridDensity(density), [density]);

  const counts = useMemo(() => {
    const result: Partial<Record<Category | "alle", number>> = { alle: items.length };
    for (const item of items) {
      result[item.category] = (result[item.category] ?? 0) + 1;
    }
    return result;
  }, [items]);

  const filtered = useMemo(
    () => (filter === "alle" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  const sorted = useMemo(() => sortItems(filtered, sort), [filtered, sort]);

  return (
    <div>
      <PageHeader
        title="Mein Kleiderschrank"
        subtitle={`${items.length} Teile`}
        action={
          items.length > 0 && (
            <div className="flex items-center gap-1.5">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded-full border border-rose-100 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-300"
              >
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setDensity(density === "kompakt" ? "gross" : "kompakt")}
                title={density === "kompakt" ? "Größere Kacheln" : "Kompaktere Kacheln"}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-white text-sm text-gray-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-300"
              >
                {density === "kompakt" ? "⊞" : "▦"}
              </button>
            </div>
          )
        }
      />
      <CategoryPicker value={filter} onChange={setFilter} counts={counts} />

      {loading ? (
        <p className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">Lädt…</p>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
          <span className="text-4xl">🧺</span>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {items.length === 0
              ? "Noch keine Kleidungsstücke. Tippe unten auf „Foto“, um dein erstes Teil hinzuzufügen."
              : "Keine Teile in dieser Kategorie."}
          </p>
          {items.length === 0 && (
            <button
              onClick={() => navigate("/hinzufuegen")}
              className="mt-2 rounded-full bg-rose-600 px-5 py-2 text-sm font-medium text-white shadow shadow-rose-200"
            >
              Erstes Teil hinzufügen
            </button>
          )}
        </div>
      ) : (
        <div className={`grid gap-3 px-4 pb-4 ${density === "gross" ? "grid-cols-2" : "grid-cols-3"}`}>
          {sorted.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              dense={density === "gross"}
              onClick={() => setSelected(item)}
            />
          ))}
        </div>
      )}

      {selected && (
        <ItemDetailSheet
          item={selected}
          onClose={() => setSelected(null)}
          onDelete={async () => {
            await removeItem(selected.id);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

function ItemDetailSheet({
  item,
  onClose,
  onDelete,
}: {
  item: ClothingItem;
  onClose: () => void;
  onDelete: () => void;
}) {
  const url = useObjectUrl(item.image);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-4 safe-bottom dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200 dark:bg-neutral-700" />
        <div className="mb-3 flex aspect-square items-center justify-center rounded-2xl bg-rose-50 dark:bg-neutral-800">
          {url && <img src={url} alt={item.name} className="h-full w-full object-contain p-4" />}
        </div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{item.name}</h2>
        <p className="mb-4 text-sm text-gray-400 dark:text-gray-500">
          {categoryEmoji(item.category)} {categoryLabel(item.category)}
          {item.color ? ` · ${item.color}` : ""}
        </p>
        {confirmDelete ? (
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-medium text-white"
            >
              Endgültig löschen
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-600 dark:border-neutral-700 dark:text-gray-300"
            >
              Abbrechen
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-600 dark:border-neutral-700 dark:text-gray-300"
            >
              Schließen
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex-1 rounded-full bg-rose-100 py-2.5 text-sm font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
            >
              Löschen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
