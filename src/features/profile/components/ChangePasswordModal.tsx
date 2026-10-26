import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PasswordInput } from "@/components/ui";
import { profileService, type ChangePasswordDTO } from "../services/profileService";
import { useAppDispatch } from "@/store/hooks";
import { showToast } from "@/store/uiSlice";

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must not exceed 20 characters")
    .refine((val) => !val.includes(" "), "Password must not contain spaces")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special symbol");

const changePasswordFormSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: passwordSchema,
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password cannot be the same as current password",
        path: ["newPassword"],
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>;

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function ChangePasswordModal({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) {
    const dispatch = useAppDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        clearErrors,
        watch,
        formState: { errors },
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordFormSchema),
        mode: "onChange",
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const newPasswordValue = watch("newPassword") || "";

    const requirements = [
        { label: "8 to 20 characters", valid: newPasswordValue.length >= 8 && newPasswordValue.length <= 20 },
        { label: "At least one uppercase letter (A-Z)", valid: /[A-Z]/.test(newPasswordValue) },
        { label: "At least one lowercase letter (a-z)", valid: /[a-z]/.test(newPasswordValue) },
        { label: "At least one number (0-9)", valid: /[0-9]/.test(newPasswordValue) },
        { label: "At least one special character (!@#$...)", valid: /[^A-Za-z0-9]/.test(newPasswordValue) },
    ];

    const handleClose = () => {
        reset({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        clearErrors();
        setApiError(null);
        setIsSubmitting(false);
        onClose();
    };

    useEffect(() => {
        if (!isOpen) {
            reset({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            clearErrors();
            setApiError(null);
            setIsSubmitting(false);
        }
    }, [isOpen, reset, clearErrors]);

    if (!isOpen) return null;

    const onSubmit = async (data: ChangePasswordFormData) => {
        setIsSubmitting(true);
        setApiError(null);

        try {
            const payload: ChangePasswordDTO = {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            };

            const successMessage = await profileService.changePassword(payload);

            dispatch(
                showToast({
                    title: "Password Changed",
                    message: successMessage || "Your password has been changed successfully.",
                    type: "success",
                    duration: 5000,
                })
            );

            onSuccess?.();
            handleClose();
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Failed to change password. Please try again.";
            setApiError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="bg-dash-panel border border-dash-border rounded-xl p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-dash-border">
                    <div>
                        <h3 className="text-lg font-semibold text-dash-text">Change Password</h3>
                        <p className="text-xs text-dash-text-muted mt-0.5">
                            Update your password to keep your account secure
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-dash-text-muted hover:text-dash-text p-1.5 rounded-lg hover:bg-dash-panel-2 transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* API Error Notification */}
                {apiError && (
                    <div className="mb-4 p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
                        {apiError}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <PasswordInput
                        label="Current Password"
                        id="current-password"
                        variant="dash"
                        autoComplete="current-password"
                        placeholder="Enter your current password"
                        {...register("currentPassword")}
                        error={errors.currentPassword?.message}
                    />

                    <div>
                        <PasswordInput
                            label="New Password"
                            id="new-password"
                            variant="dash"
                            autoComplete="new-password"
                            placeholder="Enter your new password"
                            {...register("newPassword")}
                            error={errors.newPassword?.message}
                        />

                        {/* Password Requirements Guide */}
                        <div className="mt-2.5 p-3 rounded-lg bg-dash-panel-2 border border-dash-border/60 space-y-1.5">
                            <p className="text-[11px] font-medium text-dash-text-muted">Password must contain:</p>
                            <div className="grid grid-cols-1 gap-1 text-[11px]">
                                {requirements.map((req, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-1.5 transition-colors ${
                                            req.valid ? "text-primary-green" : "text-dash-text-muted"
                                        }`}
                                    >
                                        <svg
                                            className="w-3.5 h-3.5 shrink-0"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                        >
                                            {req.valid ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            ) : (
                                                <circle cx="12" cy="12" r="3" fill="currentColor" />
                                            )}
                                        </svg>
                                        <span>{req.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <PasswordInput
                        label="Confirm New Password"
                        id="confirm-password"
                        variant="dash"
                        autoComplete="new-password"
                        placeholder="Confirm your new password"
                        {...register("confirmPassword")}
                        error={errors.confirmPassword?.message}
                    />

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-dash-border mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 transition-colors border border-transparent hover:border-dash-border cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-primary-green hover:bg-primary-green-hover text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Changing...</span>
                                </span>
                            ) : (
                                "Change Password"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
