import {create} from "zustand";

export interface Toast {
    id: number;
    title: string;
    description?: string;
    tone?: "default" | "success" | "error";
    action?: { label: string; onClick: () => void };
}

interface ToastState {
    toasts: Toast[];
}

export const useToastStore = create<ToastState>(() => ({toasts: []}));

let nextId = 1;
const DURATION_MS = 5000;

export function dismissToast(id: number) {
    useToastStore.setState((state) => ({toasts: state.toasts.filter((toast) => toast.id !== id)}));
}

export function toast(input: Omit<Toast, "id">) {
    const id = nextId++;
    useToastStore.setState((state) => ({toasts: [...state.toasts.slice(-2), {...input, id}]}));
    setTimeout(() => dismissToast(id), DURATION_MS);
    return id;
}
