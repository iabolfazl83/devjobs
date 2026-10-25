import {create} from "zustand";

/** Command palette open state — the header button, ⌘K and "/" all toggle it. */
export const usePaletteStore = create<{ open: boolean }>(() => ({open: false}));

export function openPalette() {
    usePaletteStore.setState({open: true});
}

export function closePalette() {
    usePaletteStore.setState({open: false});
}
