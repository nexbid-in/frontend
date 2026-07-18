import { Link } from "react-router-dom";
import { AuthLayout, SocialAuth } from "../components";
import { Input, Button } from "@/components/ui";

export default function SignInPage() {
    return (
        <AuthLayout
            heroTitle={
                <>Trade Smarter. Practice Safely. <br /><span className="text-primary-green">Grow Faster</span></>
            }
            heroSubtitle="Practice trading with live market data. Build strategies, test ideas, and level up your investing game."
        >
            <h2 className="text-2xl font-bold mb-1.5 text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-8">Sign in to your <span className="text-primary-green font-semibold">nexbid</span> account</p>

            <form className="space-y-4">
                <Input label="Email Address" id="email-input" name="email" type="email" placeholder="name@example.com" required />

                <div className="relative">
                    <Input label="Password" type="password" placeholder="Enter your password" required />
                    <button type="button" className="absolute right-2.5 top-[30px] text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                    </button>
                </div>

                <div className="flex justify-end">
                    <Link to="/forgot-password"
                        className="text-xs text-primary-green hover:text-primary-green-hover transition font-medium">Forgot
                        password?</Link>
                </div>

                <div>
                     <Button type="submit">Sign In</Button>
                </div>
            </form>

            <div className="mt-5 flex items-center justify-center space-x-1.5 text-[11px] text-gray-500 font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                    </path>
                </svg>
                <span>256-bit SSL · Your data is always secure</span>
            </div>

            <SocialAuth actionText="Or continue with" />

            <div className="mt-6 text-center text-xs text-gray-500">
                Don't have an account? <Link to="/signup" className="text-primary-green hover:text-primary-green-hover font-medium transition">Create one free</Link>
            </div>
        </AuthLayout>
    );
}