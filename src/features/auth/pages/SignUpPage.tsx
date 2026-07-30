import { AuthLayout } from "../components";
import { useState } from "react";
import { SignUpForm, VerifyEmailForm } from "../components";

export default function SignUpPage() {
    const [step, setStep] = useState<'form' | 'verify'>('form');
    const [userEmail, setUserEmail] = useState('');
    

    return (
        <AuthLayout
            heroTitle={
                <>Your Gateway to <br /><span className="text-primary-green">Confident</span> Trading.</>
            }
            heroSubtitle="Practice trading with live market data. Build strategies, test ideas, and level up your investing game."
        >
            <div className={step === 'form' ? 'block' : 'hidden'}>
                <SignUpForm onSuccess={(email) => {
                    setUserEmail(email);
                    setStep('verify');
                }} />
            </div>
            <div className={step === 'verify' ? 'block' : 'hidden'}>
                <VerifyEmailForm
                    email={userEmail}
                    onChangeEmail={() => setStep('form')}
                />
            </div>
        </AuthLayout>
    );
}