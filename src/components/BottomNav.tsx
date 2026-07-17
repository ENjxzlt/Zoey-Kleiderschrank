import { NavLink } from "react-router-dom";

const linkBase =
  "flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-rose-100 bg-white/95 backdrop-blur safe-bottom">
      <div className="mx-auto grid max-w-md grid-cols-4 items-end px-2 pb-1 pt-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${linkBase} ${isActive ? "text-rose-600" : "text-gray-400"}`
          }
        >
          <span className="text-xl">🧺</span>
          Schrank
        </NavLink>
        <NavLink
          to="/outfits"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? "text-rose-600" : "text-gray-400"}`
          }
        >
          <span className="text-xl">👗</span>
          Outfits
        </NavLink>
        <NavLink
          to="/hinzufuegen"
          className="flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-rose-600"
        >
          <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-2xl text-white shadow-lg shadow-rose-300">
            +
          </span>
          <span className="mt-0.5">Foto</span>
        </NavLink>
        <NavLink
          to="/einstellungen"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? "text-rose-600" : "text-gray-400"}`
          }
        >
          <span className="text-xl">⚙️</span>
          Mehr
        </NavLink>
      </div>
    </nav>
  );
}
