"use client";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {useEffect, useState} from "react";
import {hydratePersistedStores, syncAcrossTabs} from "@/lib/hydration";
import {expireStaleSession} from "@/lib/auth/service";
import {Toaster} from "@/components/layout/Toaster";
import {CommandPalette} from "@/components/layout/CommandPalette";

export default function Providers({children}: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {queries: {refetchOnWindowFocus: false, retry: 1}},
    }));

    useEffect(() => {
        void hydratePersistedStores().then(expireStaleSession);
        return syncAcrossTabs();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster/>
            <CommandPalette/>
        </QueryClientProvider>
    );
}
