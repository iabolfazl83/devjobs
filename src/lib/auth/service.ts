import {useAuthStore} from "@/lib/auth/store";
import {Account, AuthResult, EMPTY_PROFILE, Profile, User} from "@/lib/auth/types";
import {hashPassword, randomId, verifyPassword} from "@/lib/auth/crypto";
import {normalizeEmail, validateEmail, validateName, validatePassword} from "@/lib/auth/validation";
import {latency} from "@/lib/persist";
import {tracker} from "@/lib/tracker/store";
import {JobSummary} from "@/lib/catalog/types";
import {seedDemoData} from "@/lib/tracker/seed";

/**
 * Mock auth backend.
 *
 * Every function is async and returns a result object, exactly like calls to a
 * real API would — so replacing this file with `fetch("/api/...")` calls is the
 * whole migration. What it can't do is keep secrets: anything in the browser is
 * readable by the user, which is why this is labelled a demo in the UI.
 */

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DEMO_EMAIL = "demo@devjobs.dev";

function toUser({passwordHash: _hash, salt: _salt, ...user}: Account): User {
    return user;
}

function findByEmail(email: string): Account | undefined {
    const normalized = normalizeEmail(email);
    return Object.values(useAuthStore.getState().accounts).find((account) => account.email === normalized);
}

function startSession(account: Account) {
    useAuthStore.setState({session: {userId: account.id, expiresAt: Date.now() + SESSION_TTL_MS}});
}

export async function signUp(input: { name: string; email: string; password: string }): Promise<AuthResult> {
    await latency();
    const nameError = validateName(input.name);
    if (nameError) return {ok: false, error: nameError, field: "name"};
    const emailError = validateEmail(input.email);
    if (emailError) return {ok: false, error: emailError, field: "email"};
    const passwordError = validatePassword(input.password);
    if (passwordError) return {ok: false, error: passwordError, field: "password"};
    if (findByEmail(input.email)) return {ok: false, error: "An account with this email already exists.", field: "email"};

    const {hash, salt} = await hashPassword(input.password);
    const account: Account = {
        id: randomId("u_"),
        name: input.name.trim(),
        email: normalizeEmail(input.email),
        passwordHash: hash,
        salt,
        createdAt: new Date().toISOString(),
    };
    useAuthStore.setState((state) => ({
        accounts: {...state.accounts, [account.id]: account},
        profiles: {...state.profiles, [account.id]: EMPTY_PROFILE},
    }));
    startSession(account);
    return {ok: true, user: toUser(account)};
}

export async function signIn(input: { email: string; password: string }): Promise<AuthResult> {
    await latency();
    const account = findByEmail(input.email);
    // Same message whether the email exists or not, so the form can't be used to discover accounts.
    const invalid: AuthResult = {ok: false, error: "That email and password don't match an account."};
    if (!account || account.isDemo) return invalid;
    if (!(await verifyPassword(input.password, account.passwordHash, account.salt))) return invalid;
    startSession(account);
    return {ok: true, user: toUser(account)};
}

const DEMO_PROFILE: Profile = {
    headline: "Frontend engineer · React & TypeScript",
    location: "Remote",
    skills: ["react", "typescript", "javascript", "nextjs", "nodejs", "graphql", "html-css", "tailwind", "aws", "testing"],
    roles: ["frontend", "fullstack", "software"],
    seniority: ["mid", "senior"],
    workModes: ["remote", "hybrid"],
    onboarded: true,
};

/**
 * One-click demo account, pre-filled with a profile and a tracker that has
 * applications in every column — so a visitor sees the full product instantly.
 */
export async function signInAsDemo(jobs: JobSummary[]): Promise<AuthResult> {
    await latency(250);
    let account = findByEmail(DEMO_EMAIL);
    if (!account) {
        account = {
            id: randomId("u_"),
            name: "Alex Morgan",
            email: DEMO_EMAIL,
            passwordHash: "",
            salt: "",
            createdAt: new Date().toISOString(),
            isDemo: true,
        };
        const created = account;
        useAuthStore.setState((state) => ({
            accounts: {...state.accounts, [created.id]: created},
            profiles: {...state.profiles, [created.id]: DEMO_PROFILE},
        }));
        tracker.replace(account.id, seedDemoData(jobs, DEMO_PROFILE, new Date()));
    }
    startSession(account);
    return {ok: true, user: toUser(account)};
}

export function signOut() {
    useAuthStore.setState({session: null});
}

/** Drops an expired session; called once the store has hydrated. */
export function expireStaleSession() {
    const {session} = useAuthStore.getState();
    if (session && session.expiresAt < Date.now()) signOut();
}

export function updateProfile(userId: string, patch: Partial<Profile>) {
    useAuthStore.setState((state) => ({
        profiles: {...state.profiles, [userId]: {...(state.profiles[userId] ?? EMPTY_PROFILE), ...patch}},
    }));
}

export async function updateAccount(userId: string, input: { name: string; email: string }): Promise<AuthResult> {
    await latency(200);
    const account = useAuthStore.getState().accounts[userId];
    if (!account) return {ok: false, error: "You're signed out."};
    const nameError = validateName(input.name);
    if (nameError) return {ok: false, error: nameError, field: "name"};
    if (!account.isDemo) {
        const emailError = validateEmail(input.email);
        if (emailError) return {ok: false, error: emailError, field: "email"};
        const existing = findByEmail(input.email);
        if (existing && existing.id !== userId) return {ok: false, error: "Another account already uses this email.", field: "email"};
    }

    const updated: Account = {...account, name: input.name.trim(), email: account.isDemo ? account.email : normalizeEmail(input.email)};
    useAuthStore.setState((state) => ({accounts: {...state.accounts, [userId]: updated}}));
    return {ok: true, user: toUser(updated)};
}

export async function changePassword(userId: string, current: string, next: string): Promise<AuthResult> {
    await latency();
    const account = useAuthStore.getState().accounts[userId];
    if (!account || account.isDemo) return {ok: false, error: "The demo account doesn't have a password."};
    if (!(await verifyPassword(current, account.passwordHash, account.salt))) {
        return {ok: false, error: "Your current password is incorrect.", field: "password"};
    }
    const passwordError = validatePassword(next);
    if (passwordError) return {ok: false, error: passwordError, field: "password"};
    const {hash, salt} = await hashPassword(next);
    const updated = {...account, passwordHash: hash, salt};
    useAuthStore.setState((state) => ({accounts: {...state.accounts, [userId]: updated}}));
    return {ok: true, user: toUser(updated)};
}

/** Removes the account, its profile and all of its tracker data. */
export async function deleteAccount(userId: string) {
    await latency(200);
    useAuthStore.setState((state) => {
        const accounts = {...state.accounts};
        const profiles = {...state.profiles};
        delete accounts[userId];
        delete profiles[userId];
        return {accounts, profiles, session: state.session?.userId === userId ? null : state.session};
    });
    tracker.clear(userId);
}
