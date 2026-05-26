import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as LucideIcons from 'lucide-react';
import React from 'react';

/**
 * Combines Tailwind CSS classes with merge safety.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Dynamically resolves a Lucide icon by its string name.
 */
export function DynamicIcon({
  name,
  className,
  size = 20,
  ...props
}: {
  name: string;
  className?: string;
  size?: number;
} & React.ComponentPropsWithoutRef<'svg'>) {
  // Fallback to LayoutDashboard if the icon name is invalid or not found
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.LayoutDashboard;
  return React.createElement(IconComponent, { className, size, ...props });
}

/**
 * GlassCard component providing flat, clean border styling matching YC spec.
 */
export function GlassCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border-color bg-bg-secondary p-7 shadow-subtle transition-subtle hover:border-text-muted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Premium flat YC Orange title highlight text.
 */
export function GradientText({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-accent-primary font-bold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Custom modern button matching YC design specification.
 */
export function ModernButton({
  children,
  className,
  variant = 'primary',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = "px-[22px] rounded-xl font-semibold text-[15px] h-[48px] transition-subtle flex items-center justify-center gap-2 select-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-accent-primary hover:bg-accent-hover text-white hover:-translate-y-[1px]",
    secondary: "bg-bg-secondary hover:bg-[#FAFAFA] text-text-primary border border-border-color hover:-translate-y-[1px]",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-secondary/40 h-auto py-2.5 px-4 font-medium text-sm",
    danger: "bg-rose-600 hover:bg-rose-500 text-white"
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
