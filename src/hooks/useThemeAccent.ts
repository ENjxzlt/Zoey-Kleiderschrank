import { useCallback, useState } from "react";
import { getThemeAccent, setThemeAccent, type ThemeAccent } from "../services/theme";

export function useThemeAccent() {
  const [accent, setAccent] = useState<ThemeAccent>(getThemeAccent());

  const update = useCallback((next: ThemeAccent) => {
    setThemeAccent(next);
    setAccent(next);
  }, []);

  return [accent, update] as const;
}
