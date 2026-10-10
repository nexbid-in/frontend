import { APP_ROUTES } from "@/constants/routes";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInFormData } from "../schemas";

import { AuthLayout, SocialAuth } from "../components";
import { Input, Button, PasswordInput } from "@/components/ui";
import { useState } from "react";
import { authService } from "../services/authService";

import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "../store/authSlice";

export default function SignInPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
        mode: "onChange" 
    });

    const onSubmit = async (data: SignInFormData) => {
        setIsLoading(true);
        setApiError(null);

        try {
            const response = await authService.login(data);

            dispatch(setCredentials({ user: response.data.user }));
            console.log("Login Successful!", response);
            navigate(APP_ROUTES.USER.DASHBOARD);
        } catch (error: unknown) {
            if (error instanceof Error) {
                setApiError(error.message);
            } else {
                setApiError("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            heroTitle={
                <>Trade Smarter. Practice Safely. <br /><span className="text-primary-green">Grow Faster.</span></>
            }
            heroSubtitle="Practice trading with live market data. Build strategies, test ideas, and level up your investing game."
        >
            <h2 className="text-2xl font-bold mb-1.5 text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-8">Sign in to your <span className="text-primary-green font-semibold">nexbid</span> account</p>

            {apiError && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {apiError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Email Address" 
                    id="email-input" 
                    type="email" 
                    placeholder="name@example.com" 
                    {...register("email")}
                    error={!!errors.email} 
                />

                <PasswordInput 
                    label="Password" 
                    placeholder="Enter your password" 
                    {...register("password")}
                    error={errors.password?.message}
                />

                <div className="flex justify-end">
                    <Link to={APP_ROUTES.USER.FORGOT_PASSWORD}
                        className="text-xs text-primary-green hover:text-primary-green-hover transition font-medium">Forgot
                        password?</Link>
                </div>

                <div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                </div>
            </form>

            <div className="mt-5 flex items-center justify-center space-x-1.5 text-[11px] text-gray-500 font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                    </path>
                </svg>
                <span>256-bit SSL · Your data is always secure</span>
            </div>

            <SocialAuth actionText="Or continue with" />

            <div className="mt-6 text-center text-xs text-gray-500">
                Don't have an account? <Link to={APP_ROUTES.USER.SIGN_UP} className="text-primary-green hover:text-primary-green-hover font-medium transition">Create one free</Link>
            </div>
        </AuthLayout>
    );
}