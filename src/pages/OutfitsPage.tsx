import { useNavigate } from "react-router-dom";
import { useWardrobe } from "../context/WardrobeContext";
import PageHeader from "../components/PageHeader";
import ImageThumb from "../components/ImageThumb";
import type { Outfit } from "../types";

export default function OutfitsPage() {
  const { outfits, itemsById, loading } = useWardrobe();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Outfits"
        subtitle={`${outfits.length} gespeichert`}
        action={
          <button
            onClick={() => navigate("/outfits/neu")}
            className="rounded-full bg-rose-600 px-4 py-2 text-xs font-medium text-white shadow shadow-rose-200"
          >
            + Neu
          </button>
        }
      />

      {loading ? (
        <p className="px-4 py-10 text-center text-sm text-gray-400">Lädt…</p>
      ) : outfits.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
          <span className="text-4xl">👗</span>
          <p className="text-sm text-gray-400">
            Noch keine Outfits. Stelle aus deinen Kleidungsstücken dein erstes Outfit zusammen.
          </p>
          <button
            onClick={() => navigate("/outfits/neu")}
            className="mt-2 rounded-full bg-rose-600 px-5 py-2 text-sm font-medium text-white shadow shadow-rose-200"
          >
            Outfit erstellen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
          {outfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              itemsById={itemsById}
              onClick={() => navigate(`/outfits/${outfit.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OutfitCard({
  outfit,
  itemsById,
  onClick,
}: {
  outfit: Outfit;
  itemsById: ReturnType<typeof useWardrobe>["itemsById"];
  onClick: () => void;
}) {
  const items = outfit.itemIds.map((id) => itemsById.get(id)).filter(Boolean).slice(0, 4) as {
    id: string;
    image: Blob;
    name: string;
  }[];

  return (
    <button
      onClick={onClick}
      className="overflow-hidden rounded-2xl border border-rose-100 bg-white text-left shadow-sm"
    >
      <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-0.5 bg-rose-50 p-1">
        {items.length === 0 && <div className="col-span-2 row-span-2" />}
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-center overflow-hidden rounded-lg bg-white">
            <ImageThumb image={item.image} alt={item.name} className="h-full w-full object-contain p-1" />
          </div>
        ))}
      </div>
      <div className="px-2 py-1.5">
        <p className="truncate text-xs font-medium text-gray-700">{outfit.name || "Ohne Namen"}</p>
        <p className="text-[10px] text-gray-400">{outfit.itemIds.length} Teile</p>
      </div>
    </button>
  );
}
