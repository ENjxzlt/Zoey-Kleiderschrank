import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWardrobe } from "../context/WardrobeContext";
import { useObjectUrl } from "../hooks/useObjectUrl";
import PageHeader from "../components/PageHeader";
import { processPhoto } from "../services/imageProcessing";
import { LocalRemovalError } from "../services/localBackgroundRemoval";
import { BackgroundRemovalError } from "../services/backgroundRemoval";
import { getApiKey } from "../services/apiKey";
import { getGoogleSearchConfig, hasGoogleSearchConfig } from "../services/googleSearchConfig";
import {
  searchProductImages,
  fetchImageAsBlob,
  ProductSearchError,
  type ProductImageResult,
} from "../services/productImageSearch";
import { CATEGORIES, type Category } from "../types";

type Step = "capture" | "processing" | "form";

export default function AddItemPage() {
  const { addItem } = useWardrobe();
  const navigate = useNavigate();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("capture");
  const [originalPhoto, setOriginalPhoto] = useState<Blob | null>(null);
  const [finalImage, setFinalImage] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [skippedRemoval, setSkippedRemoval] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const [progress, setProgress] = useState(0);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductImageResult[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>(CATEGORIES[0].id);
  const [color, setColor] = useState("");
  const [saving, setSaving] = useState(false);

  const previewUrl = useObjectUrl(finalImage ?? originalPhoto);

  async function processBlob(blob: Blob) {
    setOriginalPhoto(blob);
    setError(null);
    setSkippedRemoval(false);
    setUsedFallback(false);
    setProgress(0);
    setStep("processing");

    try {
      const result = await processPhoto(blob, getApiKey(), setProgress);
      setFinalImage(result.image);
      setUsedFallback(result.method === "remote");
      setStep("form");
    } catch (e) {
      const message =
        e instanceof LocalRemovalError || e instanceof BackgroundRemovalError
          ? e.message
          : "Unbekannter Fehler bei der Freistellung.";
      setError(message);
      setFinalImage(null);
      setStep("capture");
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    await processBlob(file);
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults(null);
    try {
      const { apiKey, cx } = getGoogleSearchConfig();
      const results = await searchProductImages(searchQuery.trim(), apiKey, cx);
      setSearchResults(results);
    } catch (e) {
      setSearchError(e instanceof ProductSearchError ? e.message : "Suche fehlgeschlagen.");
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleSelectSearchResult(result: ProductImageResult) {
    setSearchError(null);
    try {
      const blob = await fetchImageAsBlob(result.url);
      setName(searchQuery.trim());
      await processBlob(blob);
    } catch (e) {
      setSearchError(e instanceof ProductSearchError ? e.message : "Bild konnte nicht geladen werden.");
    }
  }

  async function retryWithoutRemoval() {
    if (!originalPhoto) return;
    setFinalImage(originalPhoto);
    setSkippedRemoval(true);
    setError(null);
    setStep("form");
  }

  async function handleSave() {
    if (!finalImage || !name.trim()) return;
    setSaving(true);
    await addItem({
      id: crypto.randomUUID(),
      name: name.trim(),
      category,
      color: color.trim() || undefined,
      image: finalImage,
      createdAt: Date.now(),
    });
    navigate("/");
  }

  function reset() {
    setStep("capture");
    setOriginalPhoto(null);
    setFinalImage(null);
    setError(null);
    setSkippedRemoval(false);
    setUsedFallback(false);
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults(null);
    setSearchError(null);
    setName("");
    setColor("");
  }

  return (
    <div>
      <PageHeader title="Teil hinzufügen" subtitle="Foto aufnehmen & freistellen" />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {step === "capture" && (
        <div className="flex flex-col items-center gap-4 px-6 py-10">
          {error && (
            <div className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
              {error}
              {originalPhoto && (
                <button
                  onClick={retryWithoutRemoval}
                  className="mt-2 block font-medium underline"
                >
                  Ohne Freistellung übernehmen
                </button>
              )}
            </div>
          )}

          {!showSearch ? (
            <>
              <span className="text-6xl">📸</span>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full rounded-full bg-rose-600 py-3.5 text-sm font-medium text-white shadow shadow-rose-200"
              >
                Kamera öffnen
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full rounded-full border border-rose-200 py-3.5 text-sm font-medium text-rose-600 dark:border-rose-900 dark:text-rose-400"
              >
                Aus Galerie wählen
              </button>
              <button
                onClick={() => setShowSearch(true)}
                className="w-full rounded-full border border-rose-200 py-3.5 text-sm font-medium text-rose-600 dark:border-rose-900 dark:text-rose-400"
              >
                🔍 Bild aus dem Internet suchen
              </button>
            </>
          ) : (
            <div className="w-full">
              {!hasGoogleSearchConfig() && (
                <div className="mb-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                  Kein Google-API-Key hinterlegt.{" "}
                  <button
                    onClick={() => navigate("/einstellungen")}
                    className="font-medium underline"
                  >
                    Jetzt einrichten
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="z. B. Nike Air Force 1 weiß"
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100"
                />
                <button
                  onClick={handleSearch}
                  disabled={searchLoading || !searchQuery.trim()}
                  className="rounded-xl bg-rose-600 px-4 text-sm font-medium text-white disabled:opacity-40"
                >
                  Suchen
                </button>
              </div>

              {searchError && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">{searchError}</p>
              )}
              {searchLoading && (
                <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
                  Suche läuft…
                </p>
              )}

              {searchResults && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {searchResults.map((r) => (
                    <button
                      key={r.url}
                      onClick={() => handleSelectSearchResult(r)}
                      className="aspect-square overflow-hidden rounded-xl border border-rose-100 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      <img
                        src={r.thumbnail}
                        alt=""
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchResults(null);
                  setSearchError(null);
                }}
                className="mt-4 block w-full text-center text-xs font-medium text-gray-500 underline dark:text-gray-400"
              >
                Zurück
              </button>
            </div>
          )}
        </div>
      )}

      {step === "processing" && (
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600 dark:border-neutral-700 dark:border-t-rose-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Freistellung läuft direkt auf dem Gerät…
            {progress > 0 && progress < 1 ? ` ${Math.round(progress * 100)}%` : ""}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Beim ersten Mal wird einmalig ein Modell geladen – das kann etwas dauern.
          </p>
        </div>
      )}

      {step === "form" && (
        <div className="px-4 pb-6">
          <div className="mb-4 flex items-center justify-center rounded-2xl bg-[repeating-conic-gradient(#f9f4f4_0%_25%,#ffffff_0%_50%)] bg-[length:20px_20px] p-4 dark:bg-[repeating-conic-gradient(#262626_0%_25%,#171717_0%_50%)]">
            {previewUrl && (
              <img src={previewUrl} alt="Vorschau" className="max-h-64 object-contain" />
            )}
          </div>
          {skippedRemoval && (
            <p className="mb-3 text-xs text-amber-600 dark:text-amber-400">
              Hinweis: Dieses Foto wurde ohne automatische Freistellung gespeichert.
            </p>
          )}
          {usedFallback && (
            <p className="mb-3 text-xs text-amber-600 dark:text-amber-400">
              Hinweis: Die Freistellung im Browser hat nicht geklappt, remove.bg wurde als
              Fallback verwendet.
            </p>
          )}

          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Blaue Jeansjacke"
            className="mb-3 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100"
          />

          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Kategorie</label>
          <div className="mb-3 grid grid-cols-4 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex flex-col items-center gap-0.5 rounded-xl border py-2 text-[11px] ${
                  category === c.id
                    ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    : "border-gray-200 text-gray-500 dark:border-neutral-700 dark:text-gray-400"
                }`}
              >
                <span className="text-lg">{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>

          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Farbe (optional)</label>
          <input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="z. B. Blau"
            className="mb-5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100"
          />

          <div className="flex gap-2">
            <button
              onClick={reset}
              className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-medium text-gray-600 dark:border-neutral-700 dark:text-gray-300"
            >
              Verwerfen
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="flex-1 rounded-full bg-rose-600 py-3 text-sm font-medium text-white disabled:opacity-40"
            >
              {saving ? "Speichert…" : "Speichern"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
