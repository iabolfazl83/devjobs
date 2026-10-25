import {RoleId, SeniorityId, WorkMode} from "@/lib/catalog/types";

export interface Account {
    id: string;
    name: string;
    email: string;
    /** PBKDF2-SHA256, hex. Even in a demo, plaintext passwords never touch storage. */
    passwordHash: string;
    salt: string;
    createdAt: string;
    isDemo?: boolean;
}

/** The public view of an account — everything except credentials. */
export type User = Omit<Account, "passwordHash" | "salt">;

export interface Profile {
    headline: string;
    location: string;
    skills: string[];
    roles: RoleId[];
    seniority: SeniorityId[];
    workModes: WorkMode[];
    onboarded: boolean;
}

export interface Session {
    userId: string;
    expiresAt: number;
}

export type AuthResult = { ok: true; user: User } | { ok: false; error: string; field?: "name" | "email" | "password" };

export const EMPTY_PROFILE: Profile = {
    headline: "",
    location: "",
    skills: [],
    roles: [],
    seniority: [],
    workModes: [],
    onboarded: false,
};
