import { useState, useEffect } from "react";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface UserAvatarProps {
    src?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    alt?: string;
    size?: AvatarSize;
    className?: string;
    fallbackClassName?: string;
}

const SIZE_MAP: Record<AvatarSize, { container: string; text: string }> = {
    sm: { container: "w-8 h-8", text: "text-xs font-semibold" },
    md: { container: "w-10 h-10", text: "text-sm font-semibold" },
    lg: { container: "w-16 h-16", text: "text-xl font-bold" },
    xl: { container: "w-20 h-20", text: "text-2xl font-bold" },
};

export function UserAvatar({
    src,
    firstName,
    lastName,
    alt,
    size = "sm",
    className = "",
    fallbackClassName = "bg-muted text-green",
}: UserAvatarProps) {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [src]);

    const { container, text } = SIZE_MAP[size];

    const getInitials = () => {
        const f = firstName?.trim() ? firstName.trim().charAt(0) : "";
        const l = lastName && lastName !== "undefined" && lastName.trim() ? lastName.trim().charAt(0) : "";
        return (f + l).toUpperCase() || "U";
    };

    const imageAlt = alt || `${firstName || ""} ${lastName || ""}`.trim() || "User avatar";

    if (src && !hasError) {
        return (
            <img
                src={src}
                alt={imageAlt}
                referrerPolicy="no-referrer"
                onError={() => setHasError(true)}
                className={`${container} rounded-full object-cover shrink-0 select-none ${className}`}
            />
        );
    }

    return (
        <div
            className={`${container} ${text} rounded-full flex items-center justify-center shrink-0 select-none ${fallbackClassName} ${className}`}
        >
            {getInitials()}
        </div>
    );
}
