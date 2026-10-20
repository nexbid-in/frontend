import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, UserAvatar } from "@/components/ui";
import { profileService, type UserProfileDTO, type UpdateProfileDTO } from "../services/profileService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/features/auth/store/authSlice";
import { showToast } from "@/store/uiSlice";

const editProfileSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(3, "First name must be at least 3 characters")
        .max(20, "First name cannot exceed 20 characters")
        .regex(/^[a-zA-Z\s]+$/, "Only letters are allowed"),
    lastName: z
        .string()
        .trim()
        .max(20, "Last name cannot exceed 20 characters")
        .regex(/^[a-zA-Z\s]*$/, "Only letters are allowed"),
    mobile: z
        .string()
        .trim()
        .refine(
            (val) => val === "" || /^[6-9]\d{9}$/.test(val),
            "Please enter a valid 10-digit mobile number"
        ),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentProfile: UserProfileDTO | null;
    onProfileUpdated: (updated: UserProfileDTO) => void;
}

export function EditProfileModal({
    isOpen,
    onClose,
    currentProfile,
    onProfileUpdated,
}: EditProfileModalProps) {
    const dispatch = useAppDispatch();
    const authUser = useAppSelector((state) => state.auth.user);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);

    // Profile photo upload states
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isImageRemoved, setIsImageRemoved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EditProfileFormData>({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            mobile: "",
        },
    });

    useEffect(() => {
        if (isOpen && currentProfile) {
            reset({
                firstName: currentProfile.firstName || "",
                lastName: currentProfile.lastName || "",
                mobile: currentProfile.mobile || "",
            });
            setPreviewUrl(currentProfile.profileImage || authUser?.profileImage || null);
            setSelectedFile(null);
            setIsImageRemoved(false);
            setApiError(null);
            setImageError(null);
        }
    }, [isOpen, currentProfile, authUser, reset]);

    // Clean up created object URLs
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    if (!isOpen) return null;



    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImageError(null);
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            setImageError("Please upload a JPG, PNG, or WebP image.");
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setImageError("Image file size must be less than 5MB.");
            return;
        }

        // Revoke previous blob if any
        if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        setSelectedFile(file);
        setIsImageRemoved(false);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const handleRemovePhoto = () => {
        if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsImageRemoved(true);
        setImageError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onSubmit = async (data: EditProfileFormData) => {
        setIsSubmitting(true);
        setApiError(null);

        try {
            let finalProfileImageUrl: string | null | undefined = currentProfile?.profileImage;

            if (isImageRemoved) {
                finalProfileImageUrl = null;
            } else if (selectedFile) {
                finalProfileImageUrl = await profileService.uploadImageToCloudinary(selectedFile);
            }

            const payload: UpdateProfileDTO = {
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                mobile: data.mobile.trim() ? data.mobile.trim() : null,
                profileImage: finalProfileImageUrl,
            };

            const updatedProfile = await profileService.updateProfile(payload);

            // Keep Redux auth user in sync
            if (authUser) {
                dispatch(
                    setCredentials({
                        user: {
                            ...authUser,
                            firstName: updatedProfile.firstName,
                            lastName: updatedProfile.lastName,
                            profileImage: updatedProfile.profileImage,
                        },
                    })
                );
            }

            dispatch(
                showToast({
                    title: "Profile Updated",
                    message: "Your profile details have been saved successfully.",
                    type: "success",
                    duration: 5000,
                })
            );

            onProfileUpdated(updatedProfile);
            onClose();
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Failed to update profile details.";
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
                        <h3 className="text-lg font-semibold text-dash-text">Edit Profile</h3>
                        <p className="text-xs text-dash-text-muted mt-0.5">
                            Update your personal information and photo
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
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
                    {/* Profile Photo Upload Section */}
                    <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted mb-2">
                            Profile Picture
                        </label>
                        <div className="flex items-center gap-4 p-3 bg-dash-panel-2 rounded-xl border border-dash-border">
                            {/* Avatar Preview */}
                            <div className="relative group shrink-0">
                                <UserAvatar
                                    src={previewUrl}
                                    firstName={currentProfile?.firstName || authUser?.firstName}
                                    lastName={currentProfile?.lastName || authUser?.lastName}
                                    size="lg"
                                    className="border-2 border-dash-border shadow-inner"
                                    fallbackClassName="bg-blue-600 text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md border-2 border-dash-panel transition-colors cursor-pointer"
                                    title="Choose photo"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Actions & Hints */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                    >
                                        Upload photo
                                    </button>
                                    {previewUrl && (
                                        <>
                                            <span className="text-gray-600">•</span>
                                            <button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        </>
                                    )}
                                </div>
                                <p className="text-[11px] text-dash-text-muted leading-tight">
                                    JPG, PNG or WebP. Max 5MB.
                                </p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>

                        {imageError && (
                            <p className="text-xs text-red-400 mt-1.5">{imageError}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="First Name"
                            id="edit-firstname"
                            variant="dash"
                            placeholder="First name"
                            {...register("firstName")}
                            error={errors.firstName?.message}
                        />

                        <Input
                            label="Last Name"
                            id="edit-lastname"
                            variant="dash"
                            placeholder="Last name"
                            {...register("lastName")}
                            error={errors.lastName?.message}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            disabled
                            value={currentProfile?.email || authUser?.email || ""}
                            className="w-full rounded-md px-3 py-2.5 text-sm bg-dash-panel-2 border border-dash-border text-dash-text-muted cursor-not-allowed outline-none select-none"
                        />
                        <p className="mt-1 text-[11px] text-dash-text-muted">
                            Email address is managed via your sign-in credentials and cannot be edited here.
                        </p>
                    </div>

                    <Input
                        label="Mobile Number"
                        id="edit-mobile"
                        variant="dash"
                        placeholder="10-digit mobile number"
                        {...register("mobile")}
                        error={errors.mobile?.message}
                    />

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-dash-border mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-2 transition-colors border border-transparent hover:border-dash-border cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-primary-green hover:bg-primary-green-hover text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Saving changes...</span>
                                </span>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
