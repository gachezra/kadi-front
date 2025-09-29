import React from 'react';
import { cn } from '../utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  onClick,
  hover = false 
}) => {
  return (
    <div
      className={cn(
        "backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20",
        "shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]",
        "transition-all duration-300 ease-out",
        hover && "hover:bg-white/15 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.5)]",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};