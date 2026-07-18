import { useCallback, useEffect, useState } from "react";
import { applyTheme, getThemeChoice, setThemeChoice, type ThemeChoice } from "../services/theme";

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(getThemeChoice());

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (choice === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [choice]);

  const update = useCallback((next: ThemeChoice) => {
    setThemeChoice(next);
    setChoice(next);
  }, []);

  return [choice, update] as const;
}
