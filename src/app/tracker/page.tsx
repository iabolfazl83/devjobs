import type {Metadata} from "next";
import {ProtectedPage} from "@/components/auth/ProtectedPage";
import {TrackerBoard} from "@/components/tracker/TrackerBoard";

export const metadata: Metadata = {title: "Application tracker", robots: {index: false}};

export default function TrackerPage() {
    return (
        <ProtectedPage>
            <TrackerBoard/>
        </ProtectedPage>
    );
}
