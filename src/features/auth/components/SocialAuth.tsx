import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "../store/authSlice";
import { authService } from "../services/authService";
import { APP_ROUTES } from "@/constants/routes";
import { useState } from "react";

interface SocialAuthProps {
    actionText: string;
    onError?: (error: string) => void;
}

export function SocialAuth({ actionText, onError }: SocialAuthProps) {
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

            // 1. Save user into Redux store
            dispatch(setCredentials({ user: response.data.user }));

            // 2. Redirect to dashboard
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
            <div className="mt-6 flex items-center justify-between">
                <hr className="w-full border-gray-200" />
                <span className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {actionText}
                </span>
                <hr className="w-full border-gray-200" />
            </div>

            <div className="mt-5 flex justify-center">
                {isLoading ? (
                    <div className="text-xs text-gray-500 py-2">Signing in with Google...</div>
                ) : (
                    <div className="w-full flex justify-center [&>div]:w-full">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => onError?.("Google Sign-In failed or was cancelled")}
                            useOneTap={false}
                            theme="outline"
                            shape="rectangular"
                            width="100%"
                        />
                    </div>
                )}
            </div>
        </>
    );
}
