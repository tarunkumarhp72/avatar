import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className = '', ...props }, ref) => {
    const widthClass = fullWidth ? "w-full" : "";
    const errorClass = error ? "has-error" : "";

    return (
      <div className={`input-wrapper ${widthClass} ${className}`.trim()}>
        {label && <label className="input-label">{label}</label>}
        <input 
          ref={ref}
          className={`base-input ${errorClass}`}
          {...props}
        />
        {error && <span className="input-error">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
