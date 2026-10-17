import { useState } from "react";
import { useAppSelector } from "@/store/hooks";

export function PersonalDetailsPage() {
    const user = useAppSelector((state) => state.auth.user);
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    const displayName = user?.firstName || "Vaisakh";
    const lastName = user?.lastName && user.lastName !== "undefined" ? user.lastName.trim() : "";
    const fullName = user ? `${displayName}${lastName ? ` ${lastName}` : ""}` : "Vaisakh Ramanan";
    const userEmail = user?.email || "vaisakh123@gmail.com";
    // Phone will be populated via dedicated GET /api/v1/users/profile
    const userPhone = "9876543210";

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-8 text-[#E6E7EA]">{fullName}</h1>

            {/* Personal Details Information */}
            <section className="mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 text-sm">
                    <div>
                        <p className="text-[#9AA0A6] mb-1">Email</p>
                        <p className="font-medium text-[#E6E7EA]">{userEmail}</p>
                    </div>
                    <div>
                        <p className="text-[#9AA0A6] mb-1">Mobile number</p>
                        <p className="font-medium text-[#E6E7EA]">{userPhone}</p>
                    </div>
                    <div>
                        <p className="text-[#9AA0A6] mb-1">Password</p>
                        <p className="font-medium text-[#E6E7EA]">********</p>
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
