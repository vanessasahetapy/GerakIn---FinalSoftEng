// === FILE: src/components/ui/Card.tsx ===
import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;   // orange left border
  hover?: boolean;    // enable hover lift
  animate?: boolean;  // fade+slide on mount
  delay?: number;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  accent = false,
  hover = true,
  animate = false,
  delay = 0,
  onClick,
}) => {
  const base = clsx(
    'glass-card group',
    hover && 'hover:bg-white/5 hover:border-white/20 hover:-translate-y-1',
    accent && 'border-t-2 border-t-accent',
    onClick && 'cursor-pointer',
    className
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        className={base}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={base} onClick={onClick}>
      {children}
    </div>
  );
};
