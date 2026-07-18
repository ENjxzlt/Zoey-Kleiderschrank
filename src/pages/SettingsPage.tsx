import { useRef, useState } from "react";
import { useWardrobe } from "../context/WardrobeContext";
import { clearAll } from "../db";
import PageHeader from "../components/PageHeader";
import { getApiKey, setApiKey } from "../services/apiKey";
import { getGoogleSearchConfig, setGoogleSearchConfig } from "../services/googleSearchConfig";
import { exportBackup, importBackup } from "../services/backup";
import { useTheme } from "../hooks/useTheme";
import type { ThemeChoice } from "../services/theme";

export default function SettingsPage() {
  const { reload } = useWardrobe();
  const [key, setKey] = useState(getApiKey());
  const [savedNotice, setSavedNotice] = useState(false);
  const [googleKey, setGoogleKey] = useState(getGoogleSearchConfig().apiKey);
  const [googleCx, setGoogleCx] = useState(getGoogleSearchConfig().cx);
  const [googleSavedNotice, setGoogleSavedNotice] = useState(false);
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

  function handleSaveGoogleConfig() {
    setGoogleSearchConfig(googleKey.trim(), googleCx.trim());
    setGoogleSavedNotice(true);
    setTimeout(() => setGoogleSavedNotice(false), 2000);
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
          Freistellung: remove.bg als Fallback
        </h2>
        <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">
          Fotos werden standardmäßig direkt auf dem Gerät freigestellt – kein Account nötig.
          Falls das auf diesem Gerät mal nicht klappt, wird optional dieser{" "}
          <span className="font-medium">remove.bg</span> API-Key als Fallback genutzt. Der Key
          wird nur lokal auf diesem Gerät gespeichert.
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
        <h2 className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
          Produktbild-Suche (Google)
        </h2>
        <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">
          Zum Hinzufügen eines Teils per Produktname (statt Foto) wird ein kostenloser Google
          API-Key sowie eine Search-Engine-ID benötigt. Kostenloses Kontingent: 100 Suchen/Tag.
        </p>

        <details className="mb-4 rounded-xl bg-rose-50/60 p-3 dark:bg-neutral-800/60">
          <summary className="cursor-pointer text-xs font-semibold text-rose-600 dark:text-rose-400">
            Anleitung: API-Key &amp; Search Engine ID erstellen
          </summary>
          <div className="mt-3 space-y-3 text-xs text-gray-500 dark:text-gray-400">
            <div>
              <p className="mb-1 font-medium text-gray-600 dark:text-gray-300">
                Teil 1 – API-Key (Google Cloud Console)
              </p>
              <ol className="list-decimal space-y-1 pl-4">
                <li>
                  <a
                    href="https://console.cloud.google.com/apis/library/customsearch.googleapis.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-600 underline dark:text-rose-400"
                  >
                    Custom Search API
                  </a>{" "}
                  öffnen (ggf. mit Google-Konto einloggen)
                </li>
                <li>Oben ein Projekt auswählen oder ein neues anlegen ("Projekt erstellen")</li>
                <li>Auf der Seite „Custom Search API" den Button „Aktivieren" klicken</li>
                <li>
                  Im linken Menü zu „Anmeldedaten" (Credentials) wechseln → oben „+ Anmeldedaten
                  erstellen" → „API-Schlüssel" auswählen
                </li>
                <li>Den angezeigten Key kopieren</li>
              </ol>
            </div>
            <div>
              <p className="mb-1 font-medium text-gray-600 dark:text-gray-300">
                Teil 2 – Search Engine ID (Programmable Search Engine)
              </p>
              <ol className="list-decimal space-y-1 pl-4">
                <li>
                  <a
                    href="https://programmablesearchengine.google.com/controlpanel/create"
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-600 underline dark:text-rose-400"
                  >
                    Neue Suchmaschine anlegen
                  </a>
                </li>
                <li>
                  Bei „Websites oder Seiten auswählen" ist eine Eingabe Pflicht – irgendeine
                  Website eintragen (z. B. <span className="font-medium">google.com</span>) und
                  „Hinzufügen" klicken. Das wird gleich wieder aufgehoben.
                </li>
                <li>
                  Unter „Sucheinstellungen" direkt hier den Schalter{" "}
                  <span className="font-medium">„Bildersuche"</span> aktivieren
                </li>
                <li>Namen vergeben, reCAPTCHA bestätigen, auf „Erstellen" klicken</li>
                <li>
                  In der Suchmaschinen-Übersicht auf „Anpassen" bzw. „Control Panel" gehen, dort
                  unter <span className="font-medium">„Grundlagen"</span> den Schalter{" "}
                  <span className="font-medium">„Suche im gesamten Web"</span> aktivieren – das
                  hebt die Website-Beschränkung aus Schritt 2 wieder auf
                </li>
                <li>
                  Im selben Bereich die <span className="font-medium">„Suchmaschinen-ID"</span>{" "}
                  kopieren – das ist der cx-Wert
                </li>
              </ol>
            </div>
            <p>Beide Werte unten eintragen und speichern.</p>
          </div>
        </details>

        <input
          value={googleKey}
          onChange={(e) => setGoogleKey(e.target.value)}
          placeholder="API-Key"
          className="mb-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-100"
        />
        <input
          value={googleCx}
          onChange={(e) => setGoogleCx(e.target.value)}
          placeholder="Search Engine ID (cx)"
          className="mb-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-100"
        />
        <button
          onClick={handleSaveGoogleConfig}
          className="w-full rounded-full bg-rose-600 py-2.5 text-sm font-medium text-white"
        >
          {googleSavedNotice ? "Gespeichert ✓" : "Speichern"}
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
