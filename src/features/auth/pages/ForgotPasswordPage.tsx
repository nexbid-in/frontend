import { Link } from "react-router-dom";
import { AuthLayout } from "../components";
import { Input, Button } from "@/components/ui";

export default function ForgotPasswordPage() {
    return (
        <AuthLayout
            heroTitle={
                <>Reset your <span className="text-primary-green">password</span> securely</>
            }
            heroSubtitle="Enter your email and we'll send a one-time code to help you set a new password."
        >
            <h2 className="text-2xl font-bold mb-1.5 text-gray-900">Forgot password?</h2>
            <p className="text-sm text-gray-500 mb-8 mt-1">Enter your email to receive a reset code</p>

            <form className="space-y-6">
                <Input label="Email Address" type="email" placeholder="name@gmail.com" required />
                <Button type="submit">Send Reset Code</Button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500">
                Remember your password? <Link to="/signin" className="text-primary-green hover:text-primary-green-hover font-medium transition">Sign In</Link>
            </div>
        </AuthLayout>
    );
}