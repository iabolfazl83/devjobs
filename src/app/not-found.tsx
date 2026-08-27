import Link from "next/link";

export default function NotFound() {
    return (
        <div className="p-4">
            <h2>Page not found.</h2>
            <Link href="/jobs" className="underline">Back to job listings</Link>
        </div>
    );
}