export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function validateName(name: string): string | null {
    const trimmed = name.trim();
    if (trimmed.length < 2) return "Please enter your name.";
    if (trimmed.length > 60) return "That name is a bit long — 60 characters max.";
    return null;
}

export function validateEmail(email: string): string | null {
    const normalized = normalizeEmail(email);
    if (!normalized) return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)) return "That doesn't look like a valid email.";
    return null;
}

export function validatePassword(password: string): string | null {
    if (password.length < 8) return "Use at least 8 characters.";
    if (!/[a-z]/i.test(password) || !/\d/.test(password)) return "Include at least one letter and one number.";
    return null;
}

/** 0–4, for the strength meter on sign-up. */
export function passwordStrength(password: string): number {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password) && /[^a-z0-9]/i.test(password)) score++;
    return score;
}

/**
 * Only same-site relative paths are honoured as a post-login destination —
 * `?next=https://evil.example` or `//evil.example` would otherwise be an open redirect.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard"): string {
    if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
    return next;
}
