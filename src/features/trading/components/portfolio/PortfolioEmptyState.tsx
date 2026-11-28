import type { FC } from "react";
import { Link } from "react-router-dom";

export type PortfolioEmptyAction =
    | {
          kind: "button";
          label: string;
          onClick: () => void;
          variant?: "primary" | "secondary";
      }
    | {
          kind: "link";
          label: string;
          to: string;
      };

export interface PortfolioEmptyStateConfig {
    title: string;
    description: string;
    action: PortfolioEmptyAction;
}

interface PortfolioEmptyStateProps extends PortfolioEmptyStateConfig {
    icon: "positions" | "holdings";
}

export const PortfolioEmptyState: FC<PortfolioEmptyStateProps> = ({
    icon,
    title,
    description,
    action,
}) => {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-dash-text-muted">
            <div className="w-12 h-12 rounded-full bg-dash-panel-2 border border-dash-border flex items-center justify-center mb-3 text-dash-text-muted">
                {icon === "positions" ? (
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                        />
                    </svg>
                ) : (
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                        />
                    </svg>
                )}
            </div>

            <h3 className="text-sm font-semibold text-dash-text mb-1">{title}</h3>
            <p className="text-xs text-dash-text-muted max-w-sm mb-4">{description}</p>

            {action.kind === "link" ? (
                <Link
                    to={action.to}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary-green text-black font-semibold text-xs hover:brightness-110 transition-colors cursor-pointer"
                >
                    <span>{action.label}</span>
                    <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                        />
                    </svg>
                </Link>
            ) : (
                <button
                    type="button"
                    onClick={action.onClick}
                    className={
                        action.variant === "secondary"
                            ? "inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-dash-panel-2 hover:bg-dash-panel-3 text-dash-text border border-dash-border font-medium text-xs transition-colors cursor-pointer"
                            : "inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary-green text-black font-semibold text-xs hover:brightness-110 transition-colors cursor-pointer"
                    }
                >
                    <span>{action.label}</span>
                </button>
            )}
        </div>
    );
};
