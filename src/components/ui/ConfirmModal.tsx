import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    confirmText: string;
    cancelText?: string;
    confirmButtonVariant?: 'danger' | 'success' | 'primary';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText,
    cancelText = "Cancel",
    confirmButtonVariant = "primary",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const variantClasses = {
        danger: "bg-red/10 text-red border-red/20 hover:bg-red/20",
        success: "bg-green/10 text-green border-green/20 hover:bg-green/20",
        primary: "bg-primary-green text-panel-1 hover:bg-primary-green/90 border-transparent",
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-panel-1 border border-border-muted rounded-xl p-6 max-w-sm w-full shadow-2xl">
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {title}
                </h3>
                <div className="text-sm text-text-secondary mb-6">
                    {message}
                </div>
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-panel-2 transition-colors border border-transparent hover:border-border-muted cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${variantClasses[confirmButtonVariant]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
