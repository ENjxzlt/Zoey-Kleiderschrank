# Zoeys Kleiderschrank 👗

Ein digitaler Kleiderschrank-Manager als mobile-optimierte Web-App (PWA). Kleidungsstücke werden
mit dem Handy fotografiert, der Hintergrund automatisch entfernt und daraus lassen sich Outfits
zusammenstellen.

## Funktionen

- 📸 Kleidungsstücke direkt mit der Handykamera fotografieren (oder aus der Galerie wählen)
- 🔍 Alternativ: nur den Produktnamen eingeben und ein Bild automatisch aus dem Internet laden
  (Google-Bildersuche, optionales Setup)
- ✂️ Automatische Freistellung des Hintergrunds direkt im Browser (kein Account nötig), mit
  [remove.bg](https://www.remove.bg/) als optionalem Fallback
- 🧺 Kleiderschrank nach Kategorien filtern (Oberteile, Hosen, Kleider, Röcke, Jacken, Schuhe,
  Kopfbedeckungen, Accessoires)
- 👗 Outfits aus einzelnen Teilen zusammenstellen, Größe & Position jedes Teils per Ziehen/Regler
  anpassen und speichern
- 📷 Fertiges Outfit als Bild herunterladen (z. B. zum Teilen)
- 📴 Läuft komplett offline / lokal — alle Daten bleiben nur auf dem eigenen Gerät (IndexedDB),
  kein Server, kein Account nötig
- 💾 Backup als Datei exportieren/importieren (z. B. um auf ein neues Handy umzuziehen)
- 📱 Installierbar als App auf dem Homescreen (PWA)

## Freistellung: on-device zuerst, remove.bg als Fallback

Die automatische Hintergrundentfernung läuft standardmäßig komplett im Browser
([`@imgly/background-removal`](https://github.com/imgly/background-removal-js), WASM/ONNX) — kein
Account, kein API-Key, kein Server, keine Kosten. Kein Foto verlässt dabei das Gerät; einmalig wird
ein KI-Modell heruntergeladen und danach vom Service Worker gecacht.

Falls das auf einem Gerät mal nicht funktioniert (z. B. sehr alter Browser), kann optional ein
kostenloser remove.bg API-Key als Fallback hinterlegt werden:

1. Auf [remove.bg/api](https://www.remove.bg/api) einen kostenlosen Account erstellen
2. Den API-Key kopieren
3. In der App unter **Einstellungen → Freistellung** einfügen und speichern

Der Key wird ausschließlich lokal im Browser gespeichert (`localStorage`) und niemals an einen
eigenen Server übertragen. Ohne API-Key funktioniert die App weiterhin — falls die On-Device-
Freistellung fehlschlägt, kann das Foto stattdessen ohne Freistellung übernommen werden.

## Optional: Teil per Produktname statt Foto hinzufügen

Statt eines eigenen Fotos kann beim Hinzufügen eines Teils auch nur der Produktname eingegeben
werden — die App sucht dann automatisch passende Bilder über die Google Custom Search API. Dafür
einmalig einrichten:

1. In der [Google Cloud Console](https://console.cloud.google.com/) ein Projekt anlegen und die
   „Custom Search API" aktivieren, dort einen API-Key erstellen
2. Auf [programmablesearchengine.google.com](https://programmablesearchengine.google.com/) eine
   Suchmaschine für „das gesamte Web" anlegen und die Search Engine ID (`cx`) kopieren
3. Beides in der App unter **Einstellungen → Produktbild-Suche** einfügen und speichern

Kostenloses Kontingent: 100 Suchen/Tag. Ohne diese Einrichtung funktioniert die App weiterhin ganz
normal per Foto.

## Entwicklung

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

Bei jedem Push auf `main` wird die App automatisch per GitHub Actions
(`.github/workflows/deploy.yml`) gebaut und auf GitHub Pages veröffentlicht.

Falls GitHub Pages im Repository noch nicht aktiviert ist: unter **Settings → Pages** als
**Source** „GitHub Actions" auswählen. Die Seite ist danach unter
`https://<benutzername>.github.io/Zoey-Kleiderschrank/` erreichbar.

## Tech-Stack

- React + TypeScript + Vite
- Tailwind CSS (mobile-first)
- IndexedDB (über [`idb`](https://github.com/jakearchibald/idb)) für lokale Datenspeicherung
- [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) für Installierbarkeit & Offline-Support
- [`@imgly/background-removal`](https://github.com/imgly/background-removal-js) für
  On-Device-Hintergrundentfernung, [remove.bg API](https://www.remove.bg/api) als Fallback
