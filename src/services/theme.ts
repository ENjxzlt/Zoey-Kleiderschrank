export type ThemeChoice = "system" | "light" | "dark";
export type ThemeAccent = "standard" | "pink";

const STORAGE_KEY = "zoey-kleiderschrank:theme";
const ACCENT_STORAGE_KEY = "zoey-kleiderschrank:accent";

export function getThemeChoice(): ThemeChoice {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function applyTheme(choice: ThemeChoice): void {
  const isDark =
    choice === "dark" ||
    (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export function setThemeChoice(choice: ThemeChoice): void {
  localStorage.setItem(STORAGE_KEY, choice);
  applyTheme(choice);
}

export function getThemeAccent(): ThemeAccent {
  return localStorage.getItem(ACCENT_STORAGE_KEY) === "pink" ? "pink" : "standard";
}

export function applyAccent(accent: ThemeAccent): void {
  document.documentElement.classList.toggle("theme-pink", accent === "pink");
}

export function setThemeAccent(accent: ThemeAccent): void {
  localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  applyAccent(accent);
}
