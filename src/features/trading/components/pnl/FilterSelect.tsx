import { useState, useRef, useEffect, type KeyboardEvent } from "react";

export interface FilterSelectOption<T extends string | number = string> {
    value: T;
    label: string;
}

interface FilterSelectProps<T extends string | number = string> {
    value: T;
    options: readonly FilterSelectOption<T>[];
    onChange: (value: T) => void;
    disabled?: boolean;
    ariaLabel?: string;
    className?: string;
    buttonClassName?: string;
    menuAlign?: "left" | "right";
}

export function FilterSelect<T extends string | number = string>({
    value,
    options,
    onChange,
    disabled = false,
    ariaLabel,
    className = "w-full",
    buttonClassName = "h-9 px-3 py-2",
    menuAlign = "left",
}: FilterSelectProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value) ?? options[0];

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideMouseDown = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideMouseDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleOutsideMouseDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                return;
            }
            const currentIndex = options.findIndex((opt) => opt.value === value);
            const delta = event.key === "ArrowDown" ? 1 : -1;
            const nextIndex = (currentIndex + delta + options.length) % options.length;
            onChange(options[nextIndex].value);
        }
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                aria-label={ariaLabel}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                onKeyDown={handleTriggerKeyDown}
                className={`w-full bg-dash-panel-2 border rounded text-xs text-dash-text flex items-center justify-between gap-2 focus:outline-none transition-colors cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName} ${
                    isOpen
                        ? "border-primary-green ring-1 ring-primary-green/30"
                        : "border-dash-border hover:border-dash-border-hover focus:border-primary-green"
                }`}
            >
                <span className="truncate">{selectedOption?.label ?? ""}</span>
                <svg
                    className={`w-3.5 h-3.5 text-dash-text-muted shrink-0 transition-transform duration-150 ${
                        isOpen ? "rotate-180 text-primary-green" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div
                    role="listbox"
                    aria-label={ariaLabel}
                    className={`absolute top-full mt-1.5 z-50 min-w-full w-max bg-dash-panel border border-dash-border rounded-lg shadow-2xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${
                        menuAlign === "right" ? "right-0" : "left-0"
                    }`}
                >
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <button
                                key={String(option.value)}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                                    isSelected
                                        ? "bg-primary-green/15 text-primary-green font-semibold"
                                        : "text-dash-text hover:bg-primary-green/10 hover:text-primary-green"
                                }`}
                            >
                                <span>{option.label}</span>
                                {isSelected && (
                                    <svg
                                        className="w-3.5 h-3.5 text-primary-green shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2.5"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
