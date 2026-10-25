import Link from "next/link";
import {ComponentProps} from "react";
import {cn} from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "soft" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const VARIANTS: Record<ButtonVariant, string> = {
    primary: "bg-accent text-accent-foreground hover:bg-accent-hover shadow-card",
    secondary: "bg-foreground text-background hover:opacity-90",
    outline: "border border-border bg-surface text-foreground shadow-card hover:border-border-strong hover:bg-surface-2",
    ghost: "text-secondary hover:bg-surface-2 hover:text-foreground",
    soft: "bg-accent-soft text-accent hover:brightness-95 dark:hover:brightness-125",
    danger: "border border-danger/30 bg-danger-soft text-danger hover:border-danger/60",
};

const SIZES: Record<ButtonSize, string> = {
    "sm": "h-8 gap-1.5 rounded-md px-3 text-sm [&_svg]:size-4",
    "md": "h-10 gap-2 rounded-lg px-4 text-sm [&_svg]:size-4",
    "lg": "h-12 gap-2 rounded-xl px-6 text-base [&_svg]:size-5",
    "icon": "size-10 rounded-lg [&_svg]:size-[18px]",
    "icon-sm": "size-8 rounded-md [&_svg]:size-4",
};

interface ButtonStyleProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

export function buttonClasses({variant = "primary", size = "md"}: ButtonStyleProps = {}, className?: string) {
    return cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition-[color,background-color,border-color,opacity,filter] select-none",
        "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:shrink-0",
        VARIANTS[variant],
        SIZES[size],
        className,
    );
}

export function Button({variant, size, className, type = "button", ...props}: ComponentProps<"button"> & ButtonStyleProps) {
    return <button type={type} className={buttonClasses({variant, size}, className)} {...props}/>;
}

export function ButtonLink({variant, size, className, ...props}: ComponentProps<typeof Link> & ButtonStyleProps) {
    return <Link className={buttonClasses({variant, size}, className)} {...props}/>;
}

/** External links (apply pages etc.) — always a new tab, never leaks the referrer. */
export function ButtonAnchor({variant, size, className, ...props}: ComponentProps<"a"> & ButtonStyleProps) {
    return <a target="_blank" rel="noopener noreferrer" className={buttonClasses({variant, size}, className)} {...props}/>;
}
