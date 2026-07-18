# Zoeys Kleiderschrank 👗

Ein digitaler Kleiderschrank-Manager als mobile-optimierte Web-App (PWA). Kleidungsstücke werden
mit dem Handy fotografiert, der Hintergrund automatisch entfernt und daraus lassen sich Outfits
zusammenstellen.

## Funktionen

- 📸 Kleidungsstücke direkt mit der Handykamera fotografieren (oder aus der Galerie wählen)
- ✂️ Automatische Freistellung des Hintergrunds direkt im Browser (kein Account nötig), mit
  [remove.bg](https://www.remove.bg/) als optionalem Fallback
- 🧺 Kleiderschrank nach Kategorien filtern (Oberteile, Hosen, Kleider, Röcke, Jacken, Schuhe,
  Accessoires)
- 👗 Outfits aus einzelnen Teilen zusammenstellen und speichern
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
