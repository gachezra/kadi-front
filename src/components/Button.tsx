import React from 'react';
import { cn } from '../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  glassMorphism?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  glassMorphism = true,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = "font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50";
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg'
  };

  const variantClasses = glassMorphism ? {
    primary: 'bg-blue-500/20 border border-blue-400/50 text-blue-100 hover:bg-blue-500/30 focus:ring-blue-400 backdrop-blur-md',
    secondary: 'bg-gray-500/20 border border-gray-400/50 text-gray-100 hover:bg-gray-500/30 focus:ring-gray-400 backdrop-blur-md',
    success: 'bg-green-500/20 border border-green-400/50 text-green-100 hover:bg-green-500/30 focus:ring-green-400 backdrop-blur-md',
    danger: 'bg-red-500/20 border border-red-400/50 text-red-100 hover:bg-red-500/30 focus:ring-red-400 backdrop-blur-md',
    warning: 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-100 hover:bg-yellow-500/30 focus:ring-yellow-400 backdrop-blur-md'
  } : {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed hover:scale-100';

  return (
    <button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        disabled && disabledClasses,
        glassMorphism && 'hover:scale-105 hover:shadow-lg',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};