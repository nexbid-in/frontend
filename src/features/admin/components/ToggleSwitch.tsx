interface ToggleSwitchProps {
    checked: boolean;
    onChange: (nextChecked: boolean) => void;
    disabled?: boolean;
    disabledTooltip?: string;
    label?: string;
    size?: "sm" | "md";
}

export function ToggleSwitch({
    checked,
    onChange,
    disabled = false,
    disabledTooltip,
    label,
    size = "md",
}: ToggleSwitchProps) {
    const isSm = size === "sm";

    const handleClick = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    const switchElement = (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-disabled={disabled}
            disabled={disabled}
            onClick={handleClick}
            title={disabled && disabledTooltip ? disabledTooltip : undefined}
            className={`relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-primary-green/50 ${
                isSm ? "h-5 w-9" : "h-6 w-11"
            } ${
                disabled ? "opacity-40 cursor-not-allowed" : ""
            } ${
                checked ? "bg-primary-green" : "bg-panel-2 border border-border-muted"
            }`}
        >
            <span
                className={`inline-block rounded-full bg-white shadow-sm transform transition duration-200 ease-in-out pointer-events-none ${
                    isSm ? "h-3.5 w-3.5" : "h-4.5 w-4.5"
                } ${
                    checked
                        ? isSm
                            ? "translate-x-4.5"
                            : "translate-x-5.5"
                        : "translate-x-1"
                }`}
            />
        </button>
    );

    if (disabled && disabledTooltip) {
        return (
            <div className="inline-flex items-center gap-2 group relative" title={disabledTooltip}>
                {switchElement}
                {label && (
                    <span className={`text-xs select-none ${disabled ? "text-text-secondary/50" : "text-text-secondary"}`}>
                        {label}
                    </span>
                )}
            </div>
        );
    }

    if (label) {
        return (
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                {switchElement}
                <span className={`text-xs ${disabled ? "text-text-secondary/50" : "text-text-secondary"}`}>
                    {label}
                </span>
            </label>
        );
    }

    return switchElement;
}
