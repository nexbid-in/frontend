import React, { useState, useRef, useEffect } from 'react';

interface OtpInputGroupProps {
    length?: number;
    onComplete?: (otp: string) => void;
}

export function OtpInputGroup({ length = 6, onComplete }: OtpInputGroupProps) {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (otp.every(v => v !== "") && onComplete) {
            onComplete(otp.join(""));
        }
    }, [otp, onComplete]);

    const handleChange = (element: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (isNaN(Number(element.target.value))) return;

        const newOtp = [...otp];
        newOtp[index] = element.target.value;
        setOtp(newOtp);

        // Focus next input
        if (element.target.value && element.target.nextSibling) {
            (element.target.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
             const newOtp = [...otp];
             newOtp[index] = "";
             setOtp(newOtp);
             
             if (index > 0 && e.currentTarget.previousSibling) {
                  (e.currentTarget.previousSibling as HTMLInputElement).focus();
             }
        }
    };

    return (
        <div className="flex justify-between gap-2">
            {otp.map((data, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={data}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                    className="w-11 h-12 text-center text-xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition shadow-sm"
                />
            ))}
        </div>
    );
}
