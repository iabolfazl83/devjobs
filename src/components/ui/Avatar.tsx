import {cn} from "@/lib/cn";
import {hueFor, initials} from "@/lib/format";

export function Avatar({name, size = "md", className}: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
    const hue = hueFor(name);
    return (
        <span
            aria-hidden
            className={cn(
                "grid shrink-0 place-items-center rounded-full font-semibold text-white",
                size === "sm" && "size-7 text-[11px]",
                size === "md" && "size-9 text-xs",
                size === "lg" && "size-16 text-lg",
                className,
            )}
            style={{background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 70% 45%))`}}
        >
            {initials(name)}
        </span>
    );
}
