import { OtpInputGroup, Button } from "@/components/ui";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "../store/authSlice";

interface VerifyEmailFormProps {
    email: string;
    onChangeEmail: () => void;
}

export function VerifyEmailForm({ email, onChangeEmail }: VerifyEmailFormProps) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>('A verification code has been sent to your email.');
    const [timeLeft, setTimeLeft] = useState(60);
    const [timerKey, setTimerKey] = useState(0);

    useEffect(() => {
        setTimeLeft(60);

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timerId);
                    return 0;
                }

                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [timerKey]);

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

            dispatch(setCredentials({ user: response.user }));
            console.log("Verification Successful!", response);
            navigate("/app");
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
        setIsResending(true);

        try {
            await authService.resendOtp(email);
            setSuccessMsg("A new verification code has been sent to your email!");
            setTimerKey(prev => prev + 1);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsResending(false);
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
                {timeLeft > 0 ? (
                    <p className="text-sm text-gray-500">
                        Resend code in <span className="font-semibold text-primary-green">{timeLeft}s</span>
                    </p>
                ) : (
                    <button
                        onClick={handleResendCode}
                        disabled={isResending}
                        className="text-sm text-primary-green hover:text-primary-green-hover font-semibold transition cursor-pointer bg-transparent border-none p-0 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isResending ? (
                            <>
                                {/* Tailwind animated SVG spinner */}
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Resending...
                            </>
                        ) : (
                            "Resend Code"
                        )}
                    </button>
                )}
            </div>

        </>
    )
}