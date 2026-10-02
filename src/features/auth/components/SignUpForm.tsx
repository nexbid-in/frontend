import { APP_ROUTES } from "@/constants/routes";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpFormData } from "../schemas";
import { Input, PasswordInput, Button } from "@/components/ui";
import { SocialAuth } from "./SocialAuth";
import { authService } from "../services/authService";

interface SignUpFormProps {
    onSuccess: (email: string) => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isValid } } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        mode: "onChange"
    });

    const onSubmit = async (data: SignUpFormData) => {
        setIsLoading(true);
        setApiError(null);
        try {
            const { confirmPassword, ...registerData } = data;
            await authService.register(registerData);

            onSuccess(data.email);
        } catch (error: any) {
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div>
                <h2 className="text-2xl font-bold mb-1.5 text-gray-900">Create your account</h2>
                <p className="text-sm text-gray-500 mb-8">Free forever. No credit card required.</p>

                {/* Display API Errors */}
                {apiError && (
                    <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {apiError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name Row */}
                    <div className="flex space-x-3">
                        <div className="w-1/2">
                            <Input
                                label="First Name"
                                type="text"
                                placeholder="Will"
                                {...register("firstName")}
                                error={!!errors.firstName}
                            />
                        </div>
                        <div className="w-1/2">
                            <Input
                                label="Last Name"
                                type="text"
                                placeholder="Smith"
                                {...register("lastName")}
                                error={!!errors.lastName}
                            />
                        </div>
                    </div>

                    {/* Email Address */}
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="name@gmail.com"
                        {...register("email")}
                        error={!!errors.email}
                    />

                    {/* Password */}
                    <PasswordInput
                        label="Password"
                        placeholder="Minimum 8 characters"
                        {...register("password")}
                        error={errors.password?.message}
                    />

                    {/* Confirm Password */}
                    <PasswordInput
                        label="Confirm Password"
                        placeholder="Repeat password"
                        {...register("confirmPassword")}
                        error={errors.confirmPassword?.message}
                    />

                    <div>
                        <Button type="submit" disabled={!isValid || isLoading}>
                            {isLoading ? "Creating Account..." : "Create Free Account"}
                        </Button>
                    </div>
                </form>

                <SocialAuth actionText="Or sign up with" />

                <div className="mt-5 text-center text-[10px] text-gray-500">
                    By signing up I agree to the <a href="#" className="text-primary-green hover:underline">Terms of Service</a> and <a href="#" className="text-primary-green hover:underline">Privacy Policy</a>
                </div>

                <div className="mt-6 text-center text-xs text-gray-500">
                    Already have an account? <Link to={APP_ROUTES.SIGN_IN} className="text-primary-green hover:text-primary-green-hover font-medium transition">Sign In</Link>
                </div>
            </div>
        </>
    )
}