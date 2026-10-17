import { useEffect, useState } from "react";

export interface ToastProps {
    title: string;
    message: string;
    type?: "success" | "info" | "error";
    duration?: number;
    onClose: () => void;
}

export function Toast({
    title,
    message,
    type = "success",
    duration = 20000,
    onClose,
}: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 20);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 250);
    };

    useEffect(() => {
        if (duration <= 0 || isPaused) return;

        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, isPaused]);

    const isSuccess = type === "success";

    return (
        <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className={`fixed bottom-6 left-6 z-[100] max-w-sm w-[calc(100vw-3rem)] sm:w-96 bg-dash-panel/95 backdrop-blur-md border border-dash-border rounded-xl shadow-2xl shadow-black/60 overflow-hidden transition-all duration-300 ease-out transform ${
                isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95 pointer-events-none"
            }`}
            role="alert"
        >
            <div className="p-4 flex items-center gap-3.5">
                {/* Icon Badge (Vertically Centered) */}
                <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSuccess
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}
                >
                    {isSuccess ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.2"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-dash-text tracking-tight truncate">
                            {title}
                        </h4>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    </div>
                    <p className="text-xs text-dash-text-muted mt-1 leading-relaxed break-words">
                        {message}
                    </p>
                </div>

                {/* Dismiss Button */}
                <button
                    onClick={handleClose}
                    className="text-dash-text-muted hover:text-white p-1 rounded-md hover:bg-dash-border/60 transition-colors shrink-0 cursor-pointer self-center"
                    aria-label="Close notification"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
