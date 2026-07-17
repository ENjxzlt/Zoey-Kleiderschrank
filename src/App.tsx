import { HashRouter, Routes, Route } from "react-router-dom";
import { WardrobeProvider } from "./context/WardrobeContext";
import BottomNav from "./components/BottomNav";
import WardrobePage from "./pages/WardrobePage";
import AddItemPage from "./pages/AddItemPage";
import OutfitsPage from "./pages/OutfitsPage";
import OutfitBuilderPage from "./pages/OutfitBuilderPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <WardrobeProvider>
      <HashRouter>
        <div className="min-h-screen bg-rose-50">
          <div className="mx-auto min-h-screen max-w-md bg-rose-50 pb-24 safe-top">
            <Routes>
              <Route path="/" element={<WardrobePage />} />
              <Route path="/hinzufuegen" element={<AddItemPage />} />
              <Route path="/outfits" element={<OutfitsPage />} />
              <Route path="/outfits/neu" element={<OutfitBuilderPage />} />
              <Route path="/outfits/:id" element={<OutfitBuilderPage />} />
              <Route path="/einstellungen" element={<SettingsPage />} />
            </Routes>
          </div>
          <BottomNav />
        </div>
      </HashRouter>
    </WardrobeProvider>
  );
}
