import { OtpInputGroup, Button } from "@/components/ui";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

interface VerifyEmailFormProps {
    email: string;
    onChangeEmail: () => void;
}

export function VerifyEmailForm({ email, onChangeEmail }: VerifyEmailFormProps) {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otp.length !== 6) {
            setError('Please enter the complete 6-digit code.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.verifyOtp(email, otp);
            console.log("Verification Successful!", response);
            navigate("/");
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleResendCode = async (e: React.MouseEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        try {
            await authService.resendOtp(email);
            setSuccessMsg("A new code has been sent to your email!");
        } catch (error: any) {
            setError(error.message);
        }
    }

    return (
        <>
            <h2 className="text-2xl font-bold mb-1.5 text-gray-900">Verify your email</h2>
            <div className="mb-6 mt-1">
                <p className="text-sm text-gray-500">We sent a 6-digit code to</p>
                <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm font-bold text-gray-900">{email}</span>
                    <button type="button" onClick={onChangeEmail} className="text-xs text-primary-green hover:text-primary-green-hover font-medium flex items-center transition cursor-pointer">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        Change email
                    </button>
                </div>
            </div>

            <div className="bg-primary-green-light border border-green-200 rounded-md py-2.5 px-3 mb-8 flex items-center">
                <span className="text-primary-green font-bold mr-2 flex-shrink-0">✓</span>
                <p className="text-xs text-primary-green-hover font-medium whitespace-nowrap tracking-tight">A verification code has been sent to your email.</p>
            </div>

             {successMsg && (
                <div className="bg-primary-green-light border border-green-200 rounded-md py-2.5 px-3 mb-4 flex items-center">
                    <span className="text-primary-green font-bold mr-2 flex-shrink-0">✓</span>
                    <p className="text-xs text-primary-green-hover font-medium whitespace-nowrap tracking-tight">{successMsg}</p>
                </div>
            )}
            {error && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Verification Code</label>
                    <OtpInputGroup onComplete={(code) => setOtp(code)} />
                </div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Confirm & Continue"}
                </Button>
            </form>

            <div className="mt-5">
                <button onClick={handleResendCode} className="text-sm text-primary-green hover:text-primary-green-hover font-semibold transition cursor-pointer bg-transparent border-none p-0">
                    Resend Code
                </button>
            </div>
        </>
    )
}