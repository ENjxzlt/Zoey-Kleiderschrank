# Zoeys Kleiderschrank 👗

Ein digitaler Kleiderschrank-Manager als mobile-optimierte Web-App (PWA). Kleidungsstücke werden
mit dem Handy fotografiert, der Hintergrund automatisch entfernt und daraus lassen sich Outfits
zusammenstellen.

## Funktionen

- 📸 Kleidungsstücke direkt mit der Handykamera fotografieren (oder aus der Galerie wählen)
- ✂️ Automatische Freistellung des Hintergrunds über [remove.bg](https://www.remove.bg/)
- 🧺 Kleiderschrank nach Kategorien filtern (Oberteile, Hosen, Kleider, Röcke, Jacken, Schuhe,
  Accessoires)
- 👗 Outfits aus einzelnen Teilen zusammenstellen und speichern
- 📴 Läuft komplett offline / lokal — alle Daten bleiben nur auf dem eigenen Gerät (IndexedDB),
  kein Server, kein Account nötig
- 💾 Backup als Datei exportieren/importieren (z. B. um auf ein neues Handy umzuziehen)
- 📱 Installierbar als App auf dem Homescreen (PWA)

## Einmalige Einrichtung: Freistellungs-API

Die automatische Freistellung nutzt die API von remove.bg direkt aus dem Browser. Dafür wird ein
kostenloser API-Key benötigt:

1. Auf [remove.bg/api](https://www.remove.bg/api) einen kostenlosen Account erstellen
2. Den API-Key kopieren
3. In der App unter **Einstellungen → Freistellung** einfügen und speichern

Der Key wird ausschließlich lokal im Browser gespeichert (`localStorage`) und niemals an einen
eigenen Server übertragen. Ohne API-Key funktioniert die App weiterhin, Fotos werden dann aber
ohne automatische Freistellung gespeichert.

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
- [remove.bg API](https://www.remove.bg/api) für automatische Hintergrundentfernung
