import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "../store/authSlice";
import { showToast } from "@/store/uiSlice";
import { authService } from "../services/authService";
import { APP_ROUTES } from "@/constants/routes";
import { useState } from "react";

interface SocialAuthProps {
    actionText: string;
    buttonText?: string;
    onError?: (error: string) => void;
}

export function SocialAuth({ actionText, buttonText = "Continue with Google", onError }: SocialAuthProps) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            onError?.("Failed to obtain Google credentials");
            return;
        }

        try {
            setIsLoading(true);
            const response = await authService.googleAuth(credentialResponse.credential);

            const firstName = response.data?.user?.firstName;
            const welcomeGreeting = firstName ? `, ${firstName}` : "";
            const isNewUser = response.data?.isNewUser;
            const isFromSignUp = actionText.toLowerCase().includes("sign up");

            // Dispatch toast to Redux if new user or signing in through the signup page
            if (isNewUser) {
                dispatch(showToast({
                    title: "Account Created Successfully",
                    message: `Welcome to nexbid${welcomeGreeting}! Your account has been created with Google.`,
                    type: "success",
                }));
            } else if (isFromSignUp) {
                dispatch(showToast({
                    title: "Welcome Back",
                    message: `Welcome back${welcomeGreeting}! You are now signed in to your account.`,
                    type: "info",
                }));
            }

            // Save credentials and navigate
            dispatch(setCredentials({ user: response.data.user }));
            navigate(APP_ROUTES.USER.DASHBOARD);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Google authentication failed";
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative bg-white px-3">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        {actionText}
                    </span>
                </div>
            </div>

            {/* Custom Google Button with Invisible GIS Overlay */}
            <div className="relative w-full">
                <button
                    type="button"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-2.5 bg-white border border-gray-200 rounded-lg py-2.5 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer disabled:opacity-60"
                >
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="text-gray-500">Connecting...</span>
                        </div>
                    ) : (
                        <>
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span>{buttonText}</span>
                        </>
                    )}
                </button>

                {/* Invisible GoogleLogin overlay for secure GIS click-handling */}
                {!isLoading && (
                    <div className="absolute inset-0 opacity-0 overflow-hidden cursor-pointer flex items-center justify-center [&>div]:w-full [&>div]:h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:scale-125">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => onError?.("Google Sign-In failed or was cancelled")}
                            useOneTap={false}
                            width="400"
                        />
                    </div>
                )}
            </div>
        </>
    );
}
