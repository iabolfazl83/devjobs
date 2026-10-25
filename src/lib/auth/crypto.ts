const ITERATIONS = 100_000;

function toHex(bytes: ArrayBuffer | Uint8Array): string {
    return Array.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
    const bytes = new Uint8Array(hex.length / 2);
    for (let index = 0; index < bytes.length; index++) bytes[index] = parseInt(hex.slice(index * 2, index * 2 + 2), 16);
    return bytes;
}

export function randomId(prefix = ""): string {
    return `${prefix}${toHex(crypto.getRandomValues(new Uint8Array(8)))}`;
}

function subtle(): SubtleCrypto {
    if (!globalThis.crypto?.subtle) {
        throw new Error("Secure context required — open the app over https or localhost.");
    }
    return globalThis.crypto.subtle;
}

/** PBKDF2-SHA256 with a per-user random salt, via the Web Crypto API. */
export async function hashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
    const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
    const key = await subtle().importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await subtle().deriveBits({name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS}, key, 256);
    return {hash: toHex(bits), salt: toHex(salt)};
}

/** Constant-time comparison so a mismatch doesn't leak how many characters matched. */
function safeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let index = 0; index < a.length; index++) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
    return diff === 0;
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const candidate = await hashPassword(password, salt);
    return safeEqual(candidate.hash, hash);
}
