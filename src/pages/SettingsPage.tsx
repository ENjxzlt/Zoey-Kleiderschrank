import { useRef, useState } from "react";
import { useWardrobe } from "../context/WardrobeContext";
import { clearAll } from "../db";
import PageHeader from "../components/PageHeader";
import { getApiKey, setApiKey } from "../services/apiKey";
import { exportBackup, importBackup } from "../services/backup";
import { useTheme } from "../hooks/useTheme";
import type { ThemeChoice } from "../services/theme";

export default function SettingsPage() {
  const { reload } = useWardrobe();
  const [key, setKey] = useState(getApiKey());
  const [savedNotice, setSavedNotice] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useTheme();

  function handleSaveKey() {
    setApiKey(key.trim());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  }

  async function handleExport() {
    setBusy(true);
    setMessage(null);
    try {
      await exportBackup();
    } finally {
      setBusy(false);
    }
  }

  async function handleImport(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      await importBackup(file);
      await reload();
      setMessage("Backup erfolgreich importiert.");
    } catch {
      setMessage("Import fehlgeschlagen. Ist das die richtige Backup-Datei?");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    setBusy(true);
    try {
      await clearAll();
      await reload();
      setMessage("Alle Daten wurden gelöscht.");
      setConfirmReset(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-4 pb-6">
      <PageHeader title="Einstellungen" />

      <section className="mb-6 rounded-2xl border border-rose-100 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
          Darstellung
        </h2>
        <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">
          Wähle, ob die App im hellen oder dunklen Design angezeigt wird.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: "system", label: "System" },
              { value: "light", label: "Hell" },
              { value: "dark", label: "Dunkel" },
            ] as { value: ThemeChoice; label: string }[]
          ).map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`rounded-full py-2 text-xs font-medium ${
                theme === option.value
                  ? "bg-rose-600 text-white"
                  : "border border-gray-200 text-gray-500 dark:border-neutral-700 dark:text-gray-400"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-rose-100 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
          Freistellung (remove.bg)
        </h2>
        <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">
          Für die automatische Hintergrundentfernung wird ein kostenloser API-Key von{" "}
          <span className="font-medium">remove.bg</span> benötigt. Der Key wird nur lokal auf
          diesem Gerät gespeichert.
        </p>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="API-Key einfügen"
          className="mb-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-100"
        />
        <button
          onClick={handleSaveKey}
          className="w-full rounded-full bg-rose-600 py-2.5 text-sm font-medium text-white"
        >
          {savedNotice ? "Gespeichert ✓" : "Speichern"}
        </button>
      </section>

      <section className="mb-6 rounded-2xl border border-rose-100 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">Backup</h2>
        <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">
          Alle Kleidungsstücke und Outfits sind nur auf diesem Gerät gespeichert. Exportiere ein
          Backup, um sie zu sichern oder auf ein anderes Gerät zu übertragen.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={busy}
            className="flex-1 rounded-full border border-rose-200 py-2.5 text-sm font-medium text-rose-600 disabled:opacity-40 dark:border-rose-900 dark:text-rose-400"
          >
            Exportieren
          </button>
          <button
            onClick={() => importInputRef.current?.click()}
            disabled={busy}
            className="flex-1 rounded-full border border-rose-200 py-2.5 text-sm font-medium text-rose-600 disabled:opacity-40 dark:border-rose-900 dark:text-rose-400"
          >
            Importieren
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => handleImport(e.target.files?.[0])}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-red-100 bg-white p-4 dark:border-red-950 dark:bg-neutral-900">
        <h2 className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
          Alle Daten löschen
        </h2>
        <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">
          Entfernt alle Kleidungsstücke und Outfits unwiderruflich von diesem Gerät.
        </p>
        <button
          onClick={() => (confirmReset ? handleReset() : setConfirmReset(true))}
          disabled={busy}
          className="w-full rounded-full bg-red-50 py-2.5 text-sm font-medium text-red-600 disabled:opacity-40 dark:bg-red-950/40 dark:text-red-400"
        >
          {confirmReset ? "Wirklich alles löschen?" : "Alle Daten löschen"}
        </button>
      </section>

      {message && (
        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
}
