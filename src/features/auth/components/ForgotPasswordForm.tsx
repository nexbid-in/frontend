import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../schemas";
import { Input, Button } from "@/components/ui";

interface ForgotPasswordFormProps {
    onSuccess: (email: string) => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onChange"
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        console.log("Valid data ready for API:", data);
        onSuccess(data.email);
    };

    return (
        <>
            <h2 className="text-2xl font-bold mb-1.5 text-gray-900">Forgot password?</h2>
            <p className="text-sm text-gray-500 mb-8 mt-1">Enter your email to receive a reset code</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input 
                    label="Email Address" 
                    type="email" 
                    placeholder="name@gmail.com" 
                    {...register("email")}
                    error={!!errors.email}
                />
                <Button type="submit">Send Reset Code</Button>
            </form>
        </>
    );
}
