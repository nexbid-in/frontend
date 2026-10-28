let razorpayScriptPromise: Promise<boolean> | null = null;

/**
 * Dynamically loads the Razorpay checkout.js script into the DOM.
 * Resolves to true when the script is loaded and ready, or false on error.
 */
export const loadRazorpayScript = (): Promise<boolean> => {
    if (typeof window === "undefined") {
        return Promise.resolve(false);
    }

    if (window.Razorpay) {
        return Promise.resolve(true);
    }

    if (razorpayScriptPromise) {
        return razorpayScriptPromise;
    }

    razorpayScriptPromise = new Promise((resolve) => {
        const existingScript = document.querySelector<HTMLScriptElement>(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

        if (existingScript) {
            if (window.Razorpay) {
                resolve(true);
            } else {
                existingScript.addEventListener("load", () => resolve(true));
                existingScript.addEventListener("error", () => resolve(false));
            }
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => {
            console.error("Failed to load Razorpay SDK from checkout.razorpay.com");
            razorpayScriptPromise = null;
            resolve(false);
        };

        document.body.appendChild(script);
    });

    return razorpayScriptPromise;
};
