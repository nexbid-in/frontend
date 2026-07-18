import { type InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string | boolean; // Accepts a boolean to just show the red border without text
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', id, ...props }, ref) => {
        const inputId = id || label.replace(/\s+/g, '-').toLowerCase();
        
        return (
            <div>
                <label htmlFor={inputId} className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    {label}
                </label>
                <input
                    ref={ref}
                    id={inputId}
                    // If there's an error, make the border red. Otherwise, keep it standard gray/green.
                    className={`w-full bg-gray-50 border rounded-md px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder-gray-400 
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 focus:border-primary-green focus:ring-1 focus:ring-primary-green'} 
                        ${className}`}
                    {...props}
                />
                {/* Display the error message right below the input, only if it's a string */}
                {typeof error === 'string' && error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
