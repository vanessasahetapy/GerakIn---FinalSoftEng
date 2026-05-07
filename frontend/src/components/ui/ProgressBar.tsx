// === FILE: src/components/ui/ProgressBar.tsx ===
import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number;  // 0–100
  className?: string;
  height?: 'sm' | 'md' | 'lg';
  color?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className,
  height = 'md',
  color = 'bg-accent',
  animated = true,
}) => {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  return (
    <div className={clsx('w-full bg-bg-section rounded-full overflow-hidden', heights[height], className)}>
      <motion.div
        className={clsx('h-full rounded-full', color)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: animated ? 0.2 : 0 }}
      />
    </div>
  );
};
