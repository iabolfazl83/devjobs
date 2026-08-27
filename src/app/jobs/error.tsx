"use client";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="p-4">
            <h2>Something went wrong loading jobs.</h2>
            <p>{error.message}</p>
            <button onClick={reset} className="underline">
                Try again
            </button>
        </div>
    );
}