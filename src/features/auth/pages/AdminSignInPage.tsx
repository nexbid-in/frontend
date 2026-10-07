import { useState } from "react";
import { Input, Button, PasswordInput } from "@/components/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInFormData } from "../schemas";
import { authService } from "../services/authService";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "@/constants/routes";

export default function AdminSignInPage() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema)
    });
    
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [apiError, setApiError] = useState<string | null>(null);

    const onSubmit = async (data: SignInFormData) => {
        setApiError(null);
        try {
            const response = await authService.login(data, "ADMIN");
            dispatch(setCredentials({ user: response.data.user }));
            navigate(APP_ROUTES.ADMIN.DASHBOARD); 
        } catch (error: any) {
            setApiError(error.response?.data?.error?.message || "Invalid email or password");
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
            {/* background accents */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900"></div>
            <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-indigo-500/10 blur-[200px]"></div>

            <main className="relative z-10 flex min-h-screen w-full overflow-hidden">
                {/* Left Side: Intro & Features */}
                <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-8 lg:p-12 xl:p-16 relative z-10">
                    {/* Logo */}
                    <div>
                        <div className="inline-flex items-center gap-2 text-3xl font-semibold tracking-tight text-white cursor-default">
                            <span className="text-3xl font-extrabold text-primary-green tracking-tight">nexbid</span>
                            <span className="text-xs font-normal uppercase tracking-[0.3em] text-slate-400 mt-1">admin</span>
                        </div>
                    </div>

                    {/* Main Text & Stats */}
                    <div className="space-y-6 max-w-lg mt-6">
                        <h1 className="text-4xl lg:text-[2.75rem] font-bold leading-[1.15] text-white tracking-tight">
                            Sign in to manage the <span className="text-primary-green">nexbid platform</span>
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Review user accounts, approve leverage changes, monitor community, and keep trading operations healthy from one control plane. Your login is protected with enterprise-grade auditing.
                        </p>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-6 pt-4">
                            <div>
                                <div className="text-2xl font-bold text-white mb-1">100+</div>
                                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Institutions</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white mb-1">99.9%</div>
                                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Uptime</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Monitoring</div>
                            </div>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-6 mt-10">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-primary-green/10 text-primary-green border border-primary-green/20">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                            </div>
                            <div>
                                <div className="font-semibold text-sm text-white">SOC-2 aligned monitoring</div>
                                <div className="text-xs text-slate-400 mt-0.5">Enterprise-grade auditing and alerts</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-primary-green/10 text-primary-green border border-primary-green/20">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/></svg>
                            </div>
                            <div>
                                <div className="font-semibold text-sm text-white">Multi-tenant safeguards</div>
                                <div className="text-xs text-slate-400 mt-0.5">Strict least-privilege roles and permissions</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-primary-green/10 text-primary-green border border-primary-green/20">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </div>
                            <div>
                                <div className="font-semibold text-sm text-white">24/7 SOC Oversight</div>
                                <div className="text-xs text-slate-400 mt-0.5">Continuous platform health monitoring</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-12 bg-[#0B0C0E]/40 backdrop-blur-md lg:border-l border-white/5 relative z-10">
                    <div className="w-full max-w-[360px] relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h2>
                        <p className="text-slate-400 mb-8 text-sm">Sign in to your NexBid Admin account</p>

                        {apiError && (
                            <div className="mb-6 rounded-md bg-red-500/10 border border-red-500/20 p-3">
                                <p className="text-sm text-red-500 font-medium">{apiError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="admin@nexbid.app"
                                variant="dark"
                                {...register("email")}
                                error={errors.email?.message}
                                value="admin@nexbid.com"
                            />

                            <PasswordInput
                                label="Password"
                                placeholder="Enter your password"
                                variant="dark"
                                {...register("password")}
                                error={errors.password?.message}
                                value="Admin@123"
                            />

                            {/* Sign In Button */}
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="mt-1 font-bold shadow-sm shadow-primary-green/20"
                            >
                                {isSubmitting ? "Authenticating..." : "Sign In"}
                            </Button>

                            {/* Security Note */}
                            <div className="mt-5 flex items-center justify-center space-x-1.5 text-[11px] font-medium text-slate-500">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                <span>256-bit SSL • Your data is always secure</span>
                            </div>

                            <div className="text-center mt-6 text-xs text-slate-400">
                                Need help logging in? <a href="#" className="text-primary-green hover:underline font-medium transition">Contact IT Support</a>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
