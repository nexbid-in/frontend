import { APP_ROUTES } from "@/constants/routes";
import { Link } from "react-router-dom";
import ctaImg from '../assets/cta-img.png';


export function CtaBanner() {
    return (
        <section className="relative py-24 px-6 md:px-12 cta-color">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
                    <div className="w-52">
                        {/* Ensure image path is correct */}
                        <img src={ctaImg} alt="Start Trading" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-4xl mb-4 font-extrabold text-text-primary">
                            Start Your <span className="text-primary-green">Trading Journey</span> Today
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-[600px]">
                            Learn the markets, test strategies, and build confidence — all in one virtual trading platform powered by real market data.
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <Link to={APP_ROUTES.USER.SIGN_UP} className="px-8 py-3 bg-primary-green hover:bg-primary-green-hover text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-1 block">
                            Sign Up Now
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}