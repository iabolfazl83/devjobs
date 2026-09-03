export default function Loading({message = "Loading..."}: { message?: string }) {
    return (
        <div className="max-w-2xl mx-auto p-6 flex items-center gap-3 text-text-muted">
            <div className="w-4 h-4 border-2 border-border border-t-accent rounded-full animate-spin"/>
            <span>{message}</span>
        </div>
    );
}