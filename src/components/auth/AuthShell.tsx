import {ReactNode} from "react";
import {Check, ShieldCheck} from "lucide-react";

const POINTS = [
    "Match scores on every job, based on your skills",
    "A Kanban tracker from Saved to Offer",
    "Saved searches that count new matches",
];

/** Split layout for sign-in / sign-up: the form, plus a product panel on wide screens. */
export function AuthShell({title, description, children}: { title: string; description: ReactNode; children: ReactNode }) {
    return (
        <div className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-7xl lg:grid-cols-2">
            <div className="flex items-center justify-center px-4 py-12 sm:px-6">
                <div className="w-full max-w-sm">
                    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                    <p className="mt-1.5 text-sm text-muted">{description}</p>
                    <div className="mt-8">{children}</div>
                </div>
            </div>
            <div className="relative hidden overflow-hidden border-l border-border lg:block">
                <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600"/>
                <div aria-hidden className="bg-grid absolute inset-0 opacity-20 [mask-image:none]"/>
                <div className="relative flex h-full flex-col justify-center p-12 text-white">
                    <p className="text-sm font-semibold tracking-wide text-white/70 uppercase">DevJobs</p>
                    <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-tight text-balance">
                        Less tab-juggling. More offers.
                    </h2>
                    <ul className="mt-8 space-y-3">
                        {POINTS.map((point) => (
                            <li key={point} className="flex items-center gap-3 text-[15px] text-white/90">
                                <span className="grid size-6 place-items-center rounded-full bg-white/15"><Check className="size-3.5"/></span>
                                {point}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-12 flex max-w-md items-start gap-3 rounded-2xl bg-black/15 p-4 text-sm text-white/85 backdrop-blur">
                        <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0"/>
                        <p>
                            This is a portfolio demo with no backend: your account lives only in this browser&apos;s
                            storage, and passwords are hashed (PBKDF2) before they&apos;re stored.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
