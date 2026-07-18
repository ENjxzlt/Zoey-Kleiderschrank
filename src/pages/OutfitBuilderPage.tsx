import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWardrobe } from "../context/WardrobeContext";
import PageHeader from "../components/PageHeader";
import CategoryPicker from "../components/CategoryPicker";
import ItemCard from "../components/ItemCard";
import OutfitFigure from "../components/OutfitFigure";
import type { Category, ClothingItem } from "../types";

export default function OutfitBuilderPage() {
  const { id } = useParams();
  const isEditing = Boolean(id) && id !== "neu";
  const navigate = useNavigate();
  const { items, outfits, itemsById, saveOutfit, removeOutfit } = useWardrobe();

  const existing = useMemo(
    () => (isEditing ? outfits.find((o) => o.id === id) : undefined),
    [isEditing, outfits, id],
  );

  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<Category | "alle">("alle");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (existing && !initialized) {
      setName(existing.name);
      setSelectedIds(existing.itemIds);
      setInitialized(true);
    }
  }, [existing, initialized]);

  const filteredItems = useMemo(
    () => (filter === "alle" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  const selectedItems = useMemo(
    () => selectedIds.map((sid) => itemsById.get(sid)).filter(Boolean) as typeof items,
    [selectedIds, itemsById],
  );

  function pick(item: ClothingItem) {
    setSelectedIds((prev) => {
      if (prev.includes(item.id)) return prev.filter((i) => i !== item.id);
      if (item.category === "accessoire") return [...prev, item.id];
      const withoutSameCategory = prev.filter((id) => itemsById.get(id)?.category !== item.category);
      return [...withoutSameCategory, item.id];
    });
  }

  async function handleSave() {
    if (selectedIds.length === 0) return;
    await saveOutfit({
      id: existing?.id ?? crypto.randomUUID(),
      name: name.trim() || "Ohne Namen",
      itemIds: selectedIds,
      createdAt: existing?.createdAt ?? Date.now(),
    });
    navigate("/outfits");
  }

  async function handleDelete() {
    if (!existing) return;
    await removeOutfit(existing.id);
    navigate("/outfits");
  }

  return (
    <div>
      <PageHeader title={isEditing ? "Outfit bearbeiten" : "Neues Outfit"} />

      <div className="px-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name des Outfits"
          className="mb-3 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100"
        />

        <div className="mb-3 rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
          <OutfitFigure items={selectedItems} onRemove={(item) => pick(item)} />
          {selectedItems.length === 0 && (
            <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
              Wähle unten Teile aus – sie erscheinen an der Figur. Tippe ein Teil an der Figur an,
              um es wieder zu entfernen.
            </p>
          )}
        </div>
      </div>

      <CategoryPicker value={filter} onChange={setFilter} />

      {filteredItems.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
          Keine Teile in dieser Kategorie.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 px-4 pb-4">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              selected={selectedIds.includes(item.id)}
              onClick={() => pick(item)}
            />
          ))}
        </div>
      )}

      <div className="sticky bottom-0 -mx-0 flex gap-2 border-t border-rose-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        {isEditing && (
          <button
            onClick={() => (confirmDelete ? handleDelete() : setConfirmDelete(true))}
            className="rounded-full bg-rose-100 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
          >
            {confirmDelete ? "Wirklich löschen?" : "Löschen"}
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={selectedIds.length === 0}
          className="flex-1 rounded-full bg-rose-600 py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          Outfit speichern
        </button>
      </div>
    </div>
  );
}
