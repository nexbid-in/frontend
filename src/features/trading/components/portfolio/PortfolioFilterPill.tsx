import type { FC } from "react";

interface PortfolioFilterPillProps {
    label: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
    activeClassName?: string;
    activeBadgeClassName?: string;
    size?: "sm" | "md";
}

export const PortfolioFilterPill: FC<PortfolioFilterPillProps> = ({
    label,
    count,
    isActive,
    onClick,
    activeClassName = "bg-primary-green/15 text-primary-green border border-primary-green/30",
    activeBadgeClassName = "bg-primary-green/20 text-primary-green",
    size = "sm",
}) => {
    const fontWeight = size === "md" ? "font-semibold" : "font-medium";

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs ${fontWeight} transition-colors duration-150 cursor-pointer select-none focus:outline-none ${
                isActive
                    ? activeClassName
                    : "text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 border border-transparent"
            }`}
        >
            <span>{label}</span>
            <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full transition-colors duration-150 ${
                    isActive
                        ? activeBadgeClassName
                        : "bg-dash-panel-2 text-dash-text-muted"
                }`}
            >
                {count}
            </span>
        </button>
    );
};
