import {Metadata} from "next";

export const metadata: Metadata = {
    title: "About | jobs",
};

export default function AboutPage() {
    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-semibold">About</h1>
            <p className="text-text-muted mt-2">This is the about page.</p>
        </div>
    )
}