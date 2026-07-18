import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordFormData } from "../schemas";
import { AuthLayout } from "../components";
import { Input, Button, OtpInputGroup } from "@/components/ui";

export default function ResetPasswordPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onChange"
    });

    const onSubmit = (data: ResetPasswordFormData) => {
        console.log("Valid data ready for API:", data);
    };

    return (
        <AuthLayout
            heroTitle={
                <>Reset your <span className="text-primary-green">password</span> securely</>
            }
            heroSubtitle="Enter your email and we'll send a one-time code to help you set a new password."
        >
            <h2 className="text-2xl font-bold mb-1.5 text-gray-900">Check your email</h2>
            <p className="text-sm text-gray-500 mb-8 mt-1">Enter the 6-digit code sent to <span className="font-bold text-gray-900">name@gmail.com</span></p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Verification Code</label>
                    <OtpInputGroup />
                </div>

                <div className="relative">
                    <Input 
                        label="New Password" 
                        type="password" 
                        placeholder="Min. 8 characters" 
                        {...register("password")}
                        error={errors.password?.message}
                    />
                    <button type="button" className="absolute right-2.5 top-[30px] text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                    </button>
                </div>

                <Button type="submit">Update Password</Button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500">
                Didn't receive the code? <a href="#" className="text-primary-green hover:text-primary-green-hover font-medium transition">Try again</a>
            </div>
        </AuthLayout>
    );
}