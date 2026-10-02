import { APP_ROUTES } from "@/constants/routes";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../schemas";
import { AuthLayout } from "../components";
import { Input, Button } from "@/components/ui";

export default function ForgotPasswordPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onChange"
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        console.log("Valid data ready for API:", data);
    };

    return (
        <AuthLayout
            heroTitle={
                <>Reset your <span className="text-primary-green">password</span> securely</>
            }
            heroSubtitle="Enter your email and we'll send a one-time code to help you set a new password."
        >
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

            <div className="mt-6 text-center text-xs text-gray-500">
                Remember your password? <Link to={APP_ROUTES.SIGN_IN} className="text-primary-green hover:text-primary-green-hover font-medium transition">Sign In</Link>
            </div>
        </AuthLayout>
    );
}