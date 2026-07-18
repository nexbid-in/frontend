import { AuthLayout } from "../components";
import { Button, OtpInputGroup } from "@/components/ui";

export default function VerifyEmailPage() {
    return (
        <AuthLayout
            heroTitle={
                <>Your Gateway to <br /><span className="text-primary-green">Confident</span> Trading.</>
            }
            heroSubtitle="Practice trading with live market data. Build strategies, test ideas, and level up your investing game."
        >
            <h2 className="text-2xl font-bold mb-1.5 text-gray-900">Verify your email</h2>
            <div className="mb-6 mt-1">
                <p className="text-sm text-gray-500">We sent a 6-digit code to</p>
                <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm font-bold text-gray-900">name@gmail.com</span>
                    <a href="#" className="text-xs text-primary-green hover:text-primary-green-hover font-medium flex items-center transition">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        Change email
                    </a>
                </div>
            </div>

            <div className="bg-primary-green-light border border-green-200 rounded-md py-2.5 px-3 mb-8 flex items-center">
                <span className="text-primary-green font-bold mr-2 flex-shrink-0">✓</span>
                <p className="text-xs text-primary-green-hover font-medium whitespace-nowrap tracking-tight">A verification code has been sent to your email.</p>
            </div>

            <form className="space-y-6">
                <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Verification Code</label>
                    <OtpInputGroup />
                </div>
                <Button type="submit">Confirm & Continue</Button>
            </form>

            <div className="mt-5">
                <a href="#" className="text-sm text-primary-green hover:text-primary-green-hover font-semibold transition">Resend Code</a>
            </div>
        </AuthLayout>
    );
}