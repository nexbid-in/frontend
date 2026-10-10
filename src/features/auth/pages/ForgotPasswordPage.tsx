import { useState } from "react";
import { APP_ROUTES } from "@/constants/routes";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout, ForgotPasswordForm, ResetPasswordForm } from "../components";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<'request' | 'reset'>('request');
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    return (
        <AuthLayout
            heroTitle={
                <>Reset your <span className="text-primary-green">password</span> securely</>
            }
            heroSubtitle="Enter your email and we'll send a one-time code to help you set a new password."
        >
            <div className={step === 'request' ? 'block' : 'hidden'}>
                <ForgotPasswordForm 
                    onSuccess={(email) => {
                        setUserEmail(email);
                        setStep('reset');
                    }} 
                />
                <div className="mt-6 text-center text-xs text-gray-500">
                    Remember your password? <Link to={APP_ROUTES.USER.SIGN_IN} className="text-primary-green hover:text-primary-green-hover font-medium transition">Sign In</Link>
                </div>
            </div>

            {step === 'reset' && (
                <ResetPasswordForm
                    email={userEmail}
                    onSuccess={() => {
                        navigate(APP_ROUTES.USER.SIGN_IN);
                    }}
                    onBack={() => setStep('request')}
                />
            )}
        </AuthLayout>
    );
}