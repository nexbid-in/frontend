import React, { type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, className = '', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={`w-full bg-primary-green text-white font-medium text-sm py-2.5 rounded-md hover:bg-primary-green-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-green transition shadow-sm ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
