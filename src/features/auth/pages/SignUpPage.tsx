import { useState } from "react";
import { AuthLayout, SignUpForm, VerifyEmailForm } from "../components";

export default function SignUpPage() {
    const [step, setStep] = useState<'form' | 'verify'>('form');
    const [userEmail, setUserEmail] = useState('');
    

    return (
        <AuthLayout
            heroTitle={
                <>Trade Smarter. Practice Safely. <br /><span className="text-primary-green">Grow Faster.</span></>
            }
            heroSubtitle="Practice trading with live market data. Build strategies, test ideas, and level up your investing game."
        >
            <div className={step === 'form' ? 'block' : 'hidden'}>
                <SignUpForm onSuccess={(email) => {
                    setUserEmail(email);
                    setStep('verify');
                }} />
            </div>
            {step === 'verify' && (
                <VerifyEmailForm
                    email={userEmail}
                    onChangeEmail={() => setStep('form')}
                />
            )}
        </AuthLayout>
    );
}