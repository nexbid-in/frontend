import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../schemas";
import { Input, Button } from "@/components/ui";
import { authService } from "../services/authService";

interface ForgotPasswordFormProps {
    onSuccess: (email: string) => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onChange"
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.forgotPassword(data.email);
            onSuccess(data.email);
        } catch (err: any) {
            const errorMsg = err.message || "";
            if (errorMsg.toLowerCase().includes("not found")) {
                setError("No account found with this email.");
            } else {
                setError(errorMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <h2 className="text-2xl font-bold mb-1.5 text-gray-900">Forgot password?</h2>
            <p className="text-sm text-gray-500 mb-8 mt-1">Enter your email to receive a reset code</p>

            {error && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input 
                    label="Email Address" 
                    type="email" 
                    placeholder="name@gmail.com" 
                    {...register("email")}
                    error={!!errors.email}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Code"}
                </Button>
            </form>
        </>
    );
}
