export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "circle-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const BROWSER_BAR_COLORS: Record<ResolvedTheme, string> = {
    light: "#ffffff",
    dark: "#0f1013",
};

function isThemePreference(value: unknown): value is ThemePreference {
    return value === "system" || value === "light" || value === "dark";
}

export function readThemePreference(): ThemePreference {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return isThemePreference(stored) ? stored : "system";
    } catch {
        return "system";
    }
}

function systemPrefersDark(): boolean {
    if (typeof window.matchMedia !== "function") {
        return false;
    }
    return window.matchMedia(DARK_QUERY).matches;
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
    if (preference === "system") {
        return systemPrefersDark() ? "dark" : "light";
    }
    return preference;
}

export function applyTheme(theme: ResolvedTheme): void {
    document.documentElement.dataset.theme = theme;
    const browserBar = document.querySelector('meta[name="theme-color"]');
    if (browserBar !== null) {
        browserBar.setAttribute("content", BROWSER_BAR_COLORS[theme]);
    }
}

export function startThemeSync(): () => void {
    applyTheme(resolveTheme(readThemePreference()));


    function handleSystemsChange(): void {
        if (readThemePreference() === "system") {
            applyTheme(resolveTheme("system"));
        }
    }

    function handleStorageChange(event: StorageEvent): void {
        if (event.key === STORAGE_KEY || event.key === null) {
            applyTheme(resolveTheme(readThemePreference()));
        }
    }

    window.addEventListener("storage", handleStorageChange);

    if (typeof window.matchMedia !== "function") {
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }

    const darkQuery = window.matchMedia(DARK_QUERY);
    darkQuery.addEventListener("change", handleSystemsChange);

    return () => {
        darkQuery.removeEventListener("change", handleSystemsChange);
        window.removeEventListener("storage", handleStorageChange)
    };
}