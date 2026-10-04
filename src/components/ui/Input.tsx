import { type InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string | boolean; 
    variant?: 'default' | 'dark';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', id, variant = 'default', ...props }, ref) => {
        const inputId = id || label.replace(/\s+/g, '-').toLowerCase();
        
        const baseInputStyles = "w-full rounded-md px-3 py-2.5 text-sm outline-none transition";
        const lightInputStyles = "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-green focus:ring-1 focus:ring-primary-green";
        const darkInputStyles = "border border-white/5 bg-white/[0.03] text-white placeholder:text-slate-600 focus:border-primary-green focus:ring-1 focus:ring-primary-green";
        const errorStyles = "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500";

        const labelStyles = variant === 'dark' 
            ? "block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
            : "block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5";
            
        return (
            <div>
                <label htmlFor={inputId} className={labelStyles}>
                    {label}
                </label>
                <input
                    ref={ref}
                    id={inputId}
                    className={`${baseInputStyles} ${variant === 'dark' ? darkInputStyles : lightInputStyles} ${error ? errorStyles : ''} ${className}`}
                    {...props}
                />
                
                {typeof error === 'string' && error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
