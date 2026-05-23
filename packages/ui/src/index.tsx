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
 * GlassCard component providing premium dark-mode glassmorphic aesthetics.
 */
export function GlassCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:border-white/[0.15] hover:shadow-blue-500/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Premium gradient title header.
 */
export function GradientText({
  children,
  className,
  from = 'from-blue-400',
  via = 'via-indigo-400',
  to = 'to-purple-400',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        `bg-gradient-to-r ${from} ${via} ${to} bg-clip-text text-transparent font-extrabold tracking-tight`,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Custom modern button matching glassmorphic theme.
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
  const base = "px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 select-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-98",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 active:scale-98",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 active:scale-98"
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
