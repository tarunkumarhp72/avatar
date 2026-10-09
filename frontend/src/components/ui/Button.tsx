import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  fullWidth = false, 
  isLoading = false,
  className = '', 
  children, 
  disabled,
  ...props 
}: ButtonProps) {
  const baseClass = "base-button";
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const widthClass = fullWidth ? "w-full" : "";
  const loadingClass = isLoading ? "is-loading" : "";
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${className}`.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span className="spinner-inline" /> : null}
      {children}
    </button>
  );
}
