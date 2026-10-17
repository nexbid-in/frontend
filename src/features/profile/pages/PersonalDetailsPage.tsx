import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { profileService, type UserProfileDTO } from "../services/profileService";

export function PersonalDetailsPage() {
    const authUser = useAppSelector((state) => state.auth.user);
    const [profile, setProfile] = useState<UserProfileDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [theme, setTheme] = useState<"light" | "dark">("dark");

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
                <h1 className="text-2xl font-semibold mb-8 text-[#E6E7EA]">{fullName}</h1>
            )}

            {/* Personal Details Information */}
            <section className="mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 text-sm">
                    <div>
                        <p className="text-[#9AA0A6] mb-1">Email</p>
                        {isLoading ? (
                            <div className="h-5 w-36 bg-dash-panel-2 animate-pulse rounded" />
                        ) : (
                            <p className="font-medium text-[#E6E7EA]">{userEmail}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-[#9AA0A6] mb-1">Mobile number</p>
                        {isLoading ? (
                            <div className="h-5 w-28 bg-dash-panel-2 animate-pulse rounded" />
                        ) : (
                            <p className="font-medium text-[#E6E7EA]">{userPhone}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-[#9AA0A6] mb-1">Password</p>
                        {isLoading ? (
                            <div className="h-5 w-24 bg-dash-panel-2 animate-pulse rounded" />
                        ) : (
                            <p className="font-medium text-[#E6E7EA]">{getPasswordDisplay()}</p>
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
        </div>
    );
}
