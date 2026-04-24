// === FILE: src/components/ui/Button.tsx ===
import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...rest
}) => {
  const base = 'inline-flex items-center gap-2 font-inter font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none active:scale-95';

  const variants = {
    // Tombol utama — hijau (selected state)
    primary:
      'bg-gradient-to-r from-green-500 to-emerald-600 text-white ' +
      'shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/60 ' +
      'hover:brightness-110 hover:scale-[1.03] border border-white/10',

    // Tombol ghost — biru solid
    ghost:
      'bg-blue-500 ' +
      'border-2 border-blue-400 text-white ' +
      'hover:bg-blue-600 ' +
      'hover:border-blue-500 hover:scale-[1.03] ' +
      'shadow-md shadow-blue-500/40 hover:shadow-blue-500/60',

    // Tombol bahaya — gradient merah
    danger:
      'bg-gradient-to-r from-rose-500 to-red-600 text-white ' +
      'shadow-lg shadow-rose-500/40 hover:shadow-xl hover:shadow-rose-500/60 ' +
      'hover:brightness-110 hover:scale-[1.03] border border-white/10',

    // Tombol outline — biru solid
    outline:
      'bg-blue-600 border-2 border-blue-600 text-white ' +
      'hover:bg-blue-700 hover:border-blue-700 hover:scale-[1.02] ' +
      'shadow-md shadow-blue-500/40 hover:shadow-lg hover:shadow-blue-500/60',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={clsx(base, variants[variant], sizes[size], disabled && 'opacity-50 cursor-not-allowed', className)}
      disabled={disabled || loading}
      {...(rest as any)}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
};
