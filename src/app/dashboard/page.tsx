import type {Metadata} from "next";
import {ProtectedPage} from "@/components/auth/ProtectedPage";
import {Dashboard} from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {title: "Dashboard", robots: {index: false}};

export default function DashboardPage() {
    return (
        <ProtectedPage>
            <Dashboard/>
        </ProtectedPage>
    );
}
