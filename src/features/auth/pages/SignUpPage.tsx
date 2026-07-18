import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpFormData } from "../schemas";

import { AuthLayout, SocialAuth } from "../components";
import { Input, Button } from "@/components/ui";

export default function SignUpPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        mode: "onChange"
    });

    const onSubmit = (data: SignUpFormData) => {
        console.log("Valid data ready for API:", data);
    };

    return (
        <AuthLayout
            heroTitle={
                <>Your Gateway to <br /><span className="text-primary-green">Confident</span> Trading.</>
            }
            heroSubtitle="Practice trading with live market data. Build strategies, test ideas, and level up your investing game."
        >
            <h2 className="text-2xl font-bold mb-1.5 text-gray-900">Create your account</h2>
            <p className="text-sm text-gray-500 mb-8">Free forever. No credit card required.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Row */}
                <div className="flex space-x-3">
                    <div className="w-1/2">
                        <Input 
                            label="First Name" 
                            type="text" 
                            placeholder="Will" 
                            {...register("firstName")}
                            error={!!errors.firstName}
                        />
                    </div>
                    <div className="w-1/2">
                        <Input 
                            label="Last Name" 
                            type="text" 
                            placeholder="Smith" 
                            {...register("lastName")}
                            error={!!errors.lastName}
                        />
                    </div>
                </div>

                {/* Email Address */}
                <Input 
                    label="Email Address" 
                    type="email" 
                    placeholder="name@gmail.com" 
                    {...register("email")}
                    error={!!errors.email} 
                />

                {/* Password */}
                <div className="relative">
                    <Input 
                        label="Password" 
                        type="password" 
                        placeholder="Minimum 8 characters" 
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

                {/* Confirm Password */}
                <Input 
                    label="Confirm Password" 
                    type="password" 
                    placeholder="Repeat password" 
                    {...register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                />

                <div>
                    <Button type="submit">Create Free Account</Button>
                </div>
            </form>

            <SocialAuth actionText="Or sign up with" />

            <div className="mt-5 text-center text-[10px] text-gray-500">
                By signing up I agree to the <a href="#" className="text-primary-green hover:underline">Terms of Service</a> and <a href="#" className="text-primary-green hover:underline">Privacy Policy</a>
            </div>

            <div className="mt-6 text-center text-xs text-gray-500">
                Already have an account? <Link to="/signin" className="text-primary-green hover:text-primary-green-hover font-medium transition">Sign In</Link>
            </div>
        </AuthLayout>
    );
}