/**
 * Theme constants + the pre-paint script. Kept free of React imports so the
 * (server) root layout can inline the script without pulling in client code.
 */
export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "devjobs:theme";
export const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Runs inline in <head>, before first paint, so the page never flashes the wrong
 * theme. It must stay dependency-free and ES5-safe because it's injected as a string.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");if(p!=="light"&&p!=="dark")p="system";var d=p==="dark"||(p==="system"&&window.matchMedia("${DARK_QUERY}").matches);var r=document.documentElement;r.setAttribute("data-theme",d?"dark":"light");r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
