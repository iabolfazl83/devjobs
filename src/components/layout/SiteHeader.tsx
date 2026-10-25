"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {useState} from "react";
import {Building2, Info, LayoutDashboard, LogOut, Menu, Search, Settings, SquareKanban, UserRound} from "lucide-react";
import {Logo} from "@/components/layout/Logo";
import {ThemeMenu, ThemeSegmented} from "@/components/layout/ThemeMenu";
import {Button, ButtonLink} from "@/components/ui/Button";
import {Popover} from "@/components/ui/Popover";
import {Avatar} from "@/components/ui/Avatar";
import {Kbd} from "@/components/ui/Kbd";
import {Skeleton} from "@/components/ui/Skeleton";
import {Dialog} from "@/components/ui/Dialog";
import {useSession} from "@/lib/auth/hooks";
import {signOut} from "@/lib/auth/service";
import {openPalette} from "@/lib/palette";
import {toast} from "@/lib/toast";
import {cn} from "@/lib/cn";
import {initials} from "@/lib/format";

const NAV = [
    {href: "/jobs", label: "Find jobs", icon: Search},
    {href: "/companies", label: "Companies", icon: Building2},
    {href: "/tracker", label: "Tracker", icon: SquareKanban},
    {href: "/about", label: "How it's built", icon: Info},
];

function isActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
}

function useSignOut() {
    const router = useRouter();
    return () => {
        signOut();
        toast({title: "Signed out", description: "See you next time."});
        router.push("/");
    };
}

function UserMenu() {
    const {user} = useSession();
    const handleSignOut = useSignOut();
    if (!user) return null;

    const links = [
        {href: "/dashboard", label: "Dashboard", icon: LayoutDashboard},
        {href: "/tracker", label: "Application tracker", icon: SquareKanban},
        {href: "/profile", label: "Profile & preferences", icon: UserRound},
        {href: "/settings", label: "Settings", icon: Settings},
    ];

    return (
        <Popover
            label="Account"
            className="w-64"
            trigger={(props) => (
                // The visible initials must be part of the name (WCAG 2.5.3) so voice users can say what they see.
                <button type="button" className="rounded-full" aria-label={`${initials(user.name)} — account menu`} {...props}>
                    <Avatar name={user.name} size="sm" className="size-8"/>
                </button>
            )}
        >
            {(close) => (
                <>
                    <div className="px-2.5 pt-1.5 pb-2.5">
                        <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                    <div className="my-1 h-px bg-border"/>
                    {links.map(({href, label, icon: Icon}) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={close}
                            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-secondary transition-colors hover:bg-surface-2 hover:text-foreground"
                        >
                            <Icon className="size-4"/>
                            {label}
                        </Link>
                    ))}
                    <div className="my-1 h-px bg-border"/>
                    <button
                        type="button"
                        onClick={() => {
                            close();
                            handleSignOut();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-secondary transition-colors hover:bg-surface-2 hover:text-foreground"
                    >
                        <LogOut className="size-4"/>
                        Sign out
                    </button>
                </>
            )}
        </Popover>
    );
}

function MobileNav({open, onClose}: { open: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const {status, user} = useSession();
    const handleSignOut = useSignOut();

    return (
        <Dialog open={open} onClose={onClose} title="Menu" variant="sheet">
            <nav aria-label="Mobile" className="flex flex-col gap-1">
                {NAV.map(({href, label, icon: Icon}) => (
                    <Link
                        key={href}
                        href={href}
                        onClick={onClose}
                        aria-current={isActive(pathname, href) ? "page" : undefined}
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
                            isActive(pathname, href) ? "bg-accent-soft text-accent" : "text-secondary hover:bg-surface-2",
                        )}
                    >
                        <Icon className="size-[18px]"/>
                        {label}
                    </Link>
                ))}
                {user && (
                    <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-secondary hover:bg-surface-2">
                        <LayoutDashboard className="size-[18px]"/>
                        Dashboard
                    </Link>
                )}
            </nav>
            <div className="mt-6 border-t border-border pt-6">
                <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Appearance</p>
                <ThemeSegmented className="w-full [&>label]:flex-1 [&>label]:justify-center"/>
            </div>
            <div className="mt-6 border-t border-border pt-6">
                {status === "authenticated" && user ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <Avatar name={user.name}/>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{user.name}</p>
                                <p className="truncate text-xs text-muted">{user.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <ButtonLink href="/settings" variant="outline" onClick={onClose}>Settings</ButtonLink>
                            <Button variant="outline" onClick={() => {
                                onClose();
                                handleSignOut();
                            }}>Sign out</Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <ButtonLink href="/login" variant="outline" onClick={onClose}>Sign in</ButtonLink>
                        <ButtonLink href="/signup" onClick={onClose}>Get started</ButtonLink>
                    </div>
                )}
            </div>
        </Dialog>
    );
}

export function SiteHeader() {
    const pathname = usePathname();
    const {status} = useSession();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
                <Logo/>

                <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
                    {NAV.map(({href, label}) => (
                        <Link
                            key={href}
                            href={href}
                            aria-current={isActive(pathname, href) ? "page" : undefined}
                            className={cn(
                                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive(pathname, href) ? "text-foreground" : "text-muted hover:text-foreground",
                            )}
                        >
                            {label}
                            <span
                                aria-hidden
                                className={cn("mx-auto mt-0.5 block h-0.5 rounded-full bg-accent transition-all", isActive(pathname, href) ? "w-4" : "w-0")}
                            />
                        </Link>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={openPalette}
                        className="hidden h-9 w-60 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-subtle shadow-card transition-colors hover:border-border-strong hover:text-muted lg:flex"
                    >
                        <Search className="size-4"/>
                        <span className="flex-1 truncate text-left">Search DevJobs…</span>
                        <Kbd>⌘K</Kbd>
                    </button>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={openPalette} aria-label="Search">
                        <Search/>
                    </Button>

                    <ThemeMenu/>

                    <div className="hidden items-center gap-2 md:flex">
                        {status === "loading" && <Skeleton className="size-8 rounded-full"/>}
                        {status === "guest" && (
                            <>
                                <ButtonLink href="/login" variant="ghost" size="sm">Sign in</ButtonLink>
                                <ButtonLink href="/signup" size="sm">Get started</ButtonLink>
                            </>
                        )}
                        {status === "authenticated" && (
                            <>
                                <ButtonLink href="/dashboard" variant="ghost" size="sm" className={cn(isActive(pathname, "/dashboard") && "text-foreground")}>
                                    Dashboard
                                </ButtonLink>
                                <UserMenu/>
                            </>
                        )}
                    </div>

                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
                        <Menu/>
                    </Button>
                </div>
            </div>
            <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)}/>
        </header>
    );
}
