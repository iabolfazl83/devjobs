type ClassValue = string | false | null | undefined | 0;

/** Joins truthy class names. Tiny on purpose — no runtime merging magic to explain. */
export function cn(...classes: ClassValue[]): string {
    return classes.filter(Boolean).join(" ");
}
