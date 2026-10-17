import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { profileService, type UserProfileDTO } from "../services/profileService";
import { EditProfileModal } from "../components/EditProfileModal";

interface InfoTooltipProps {
    text: string;
}

function InfoTooltip({ text }: InfoTooltipProps) {
    return (
        <span className="relative group/tooltip inline-flex items-center cursor-pointer">
            <svg
                className="w-3.5 h-3.5 text-dash-text-muted hover:text-[#E6E7EA] transition-colors shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-50">
                <span className="bg-[#18191c] text-[#E6E7EA] text-xs font-normal px-2.5 py-1 rounded border border-dash-border shadow-xl whitespace-nowrap">
                    {text}
                </span>
                <span className="w-1.5 h-1.5 bg-[#18191c] border-r border-b border-dash-border rotate-45 -mt-0.5" />
            </span>
        </span>
    );
}

export function PersonalDetailsPage() {
    const authUser = useAppSelector((state) => state.auth.user);
    const [profile, setProfile] = useState<UserProfileDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const data = await profileService.getProfile();
                if (isMounted) {
                    setProfile(data);
                }
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    const displayName = profile?.firstName || authUser?.firstName || "";
    const lastName = profile?.lastName || (authUser?.lastName && authUser.lastName !== "undefined" ? authUser.lastName.trim() : "");
    const fullName = `${displayName}${lastName ? ` ${lastName}` : ""}`.trim() || "User";
    const userEmail = profile?.email || authUser?.email || "—";
    const userPhone = profile?.mobile ? profile.mobile : (isLoading ? "" : "Not provided");
    const hasMobile = Boolean(profile?.mobile && profile.mobile.trim() !== "");
    const hasPassword = Boolean(profile?.hasPassword);
    const clientId = profile?.id || authUser?.id || "—";
    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "—";

    const getPasswordDisplay = () => {
        if (profile?.hasPassword) {
            return "••••••••";
        }
        if (profile?.isGoogleLinked) {
            return "Managed via Google";
        }
        return "••••••••";
    };

    return (
        <div>
            {isLoading ? (
                <div className="h-8 w-48 bg-dash-panel-2 animate-pulse rounded mb-8" />
            ) : (
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-semibold text-[#E6E7EA]">{fullName}</h1>
                    <button
                        type="button"
                        onClick={() => setIsEditModalOpen(true)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors cursor-pointer"
                    >
                        <svg
                            className="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L7.125 19.875 3 21l1.125-4.125L18.375 2.625z" />
                            <path d="M15.75 5.25l3 3" />
                        </svg>
                        <span>Edit</span>
                    </button>
                </div>
            )}

            {/* Personal Details Information */}
            <section className="mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 text-sm">
                    <div>
                        <p className="text-[#9AA0A6] mb-1">Client ID</p>
                        {isLoading ? (
                            <div className="h-5 w-28 bg-dash-panel-2 animate-pulse rounded" />
                        ) : (
                            <p className="font-medium text-[#E6E7EA]">{clientId}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-[#9AA0A6] mb-1">Email</p>
                        {isLoading ? (
                            <div className="h-5 w-36 bg-dash-panel-2 animate-pulse rounded" />
                        ) : (
                            <p className="font-medium text-[#E6E7EA]">{userEmail}</p>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <p className="text-[#9AA0A6]">Mobile number</p>
                            {!isLoading && !hasMobile && (
                                <InfoTooltip text="Use edit to add number" />
                            )}
                        </div>
                        {isLoading ? (
                            <div className="h-5 w-28 bg-dash-panel-2 animate-pulse rounded" />
                        ) : (
                            <p className="font-medium text-[#E6E7EA]">{userPhone}</p>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <p className="text-[#9AA0A6]">Password</p>
                            {!isLoading && !hasPassword && (
                                <InfoTooltip text="Use forgot password to add password" />
                            )}
                        </div>
                        {isLoading ? (
                            <div className="h-5 w-24 bg-dash-panel-2 animate-pulse rounded" />
                        ) : (
                            <p className="font-medium text-[#E6E7EA]">{getPasswordDisplay()}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-[#9AA0A6] mb-1">Member since</p>
                        {isLoading ? (
                            <div className="h-5 w-28 bg-dash-panel-2 animate-pulse rounded" />
                        ) : (
                            <p className="font-medium text-[#E6E7EA]">{memberSince}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-[#9AA0A6] mb-1">Google account</p>
                        {isLoading ? (
                            <div className="h-5 w-24 bg-dash-panel-2 animate-pulse rounded" />
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <span
                                    className={`w-2 h-2 rounded-full ${
                                        profile?.isGoogleLinked ? "bg-primary-green" : "bg-gray-500"
                                    }`}
                                />
                                <p className="font-medium text-[#E6E7EA]">
                                    {profile?.isGoogleLinked ? "Linked" : "Not linked"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Settings Section */}
            <section className="border-dash-border pt-8 mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-[#E6E7EA]">Settings</h2>
                <div className="border-t border-dash-border mb-6"></div>

                <div className="space-y-6">
                    <div className="flex items-center gap-8">
                        <label className="text-[#9AA0A6] text-sm pt-1 min-w-[80px]">Theme</label>
                        <div className="flex items-center space-x-6 text-sm">
                            <label className="flex items-center space-x-2.5 cursor-pointer select-none group">
                                <input
                                    type="radio"
                                    name="theme"
                                    value="light"
                                    checked={theme === "light"}
                                    onChange={() => setTheme("light")}
                                    className="sr-only"
                                />
                                <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                        theme === "light"
                                            ? "border-blue-500 bg-[#141517]"
                                            : "border-[#4b5563] bg-[#141517] group-hover:border-gray-400"
                                    }`}
                                >
                                    {theme === "light" && (
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    )}
                                </div>
                                <span className="text-[#E6E7EA]">Light</span>
                            </label>
                            <label className="flex items-center space-x-2.5 cursor-pointer select-none group">
                                <input
                                    type="radio"
                                    name="theme"
                                    value="dark"
                                    checked={theme === "dark"}
                                    onChange={() => setTheme("dark")}
                                    className="sr-only"
                                />
                                <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                        theme === "dark"
                                            ? "border-blue-500 bg-[#141517]"
                                            : "border-[#4b5563] bg-[#141517] group-hover:border-gray-400"
                                    }`}
                                >
                                    {theme === "dark" && (
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    )}
                                </div>
                                <span className="text-[#E6E7EA]">Dark</span>
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentProfile={profile}
                onProfileUpdated={(updated) => setProfile(updated)}
            />
        </div>
    );
}
