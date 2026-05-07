// === FILE: src/components/ui/Avatar.tsx ===
import React from 'react';
import { clsx } from 'clsx';

interface AvatarProps {
  initials: string;
  variant?: 'orange' | 'navy' | 'gray';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  variant = 'orange',
  size = 'md',
  className,
}) => {
  const variants = {
    orange: 'bg-accent text-white',
    navy:   'bg-sidebar-bg text-white',
    gray:   'bg-bg-section text-text-secondary',
  };
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };
  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center font-barlow font-bold shrink-0',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {initials.toUpperCase()}
    </div>
  );
};
