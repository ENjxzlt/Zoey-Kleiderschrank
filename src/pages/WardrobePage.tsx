import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWardrobe } from "../context/WardrobeContext";
import { useObjectUrl } from "../hooks/useObjectUrl";
import CategoryPicker from "../components/CategoryPicker";
import ItemCard from "../components/ItemCard";
import PageHeader from "../components/PageHeader";
import { categoryEmoji, categoryLabel, type Category } from "../types";
import type { ClothingItem } from "../types";

export default function WardrobePage() {
  const { items, loading, removeItem } = useWardrobe();
  const [filter, setFilter] = useState<Category | "alle">("alle");
  const [selected, setSelected] = useState<ClothingItem | null>(null);
  const navigate = useNavigate();

  const filtered = useMemo(
    () => (filter === "alle" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  return (
    <div>
      <PageHeader title="Mein Kleiderschrank" subtitle={`${items.length} Teile`} />
      <CategoryPicker value={filter} onChange={setFilter} />

      {loading ? (
        <p className="px-4 py-10 text-center text-sm text-gray-400">Lädt…</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
          <span className="text-4xl">🧺</span>
          <p className="text-sm text-gray-400">
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
        <div className="grid grid-cols-3 gap-3 px-4 pb-4">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} onClick={() => setSelected(item)} />
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
        className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-4 safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />
        <div className="mb-3 flex aspect-square items-center justify-center rounded-2xl bg-rose-50">
          {url && <img src={url} alt={item.name} className="h-full w-full object-contain p-4" />}
        </div>
        <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
        <p className="mb-4 text-sm text-gray-400">
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
              className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-600"
            >
              Abbrechen
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-600"
            >
              Schließen
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex-1 rounded-full bg-rose-100 py-2.5 text-sm font-medium text-rose-700"
            >
              Löschen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
