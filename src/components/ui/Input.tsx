import { type InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, className = '', id, ...props }, ref) => {
        const inputId = id || label.replace(/\s+/g, '-').toLowerCase();
        
        return (
            <div>
                <label 
                    htmlFor={inputId}
                    className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                >
                    {label}
                </label>
                <input
                    ref={ref}
                    id={inputId}
                    className={`w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition placeholder-gray-400 ${className}`}
                    {...props}
                />
            </div>
        );
    }
);

Input.displayName = 'Input';
