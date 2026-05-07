// === FILE: src/components/ui/Badge.tsx ===
import React from 'react';
import { clsx } from 'clsx';

type BadgeType = 'PENDING' | 'ACCEPTED' | 'REJECTED' | string;

interface BadgeProps {
  status: BadgeType;
  className?: string;
}

const config: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING:  { bg: 'bg-pending/10',  text: 'text-pending', dot: 'bg-pending'  },
  ACCEPTED: { bg: 'bg-success/10',  text: 'text-success', dot: 'bg-success'  },
  REJECTED: { bg: 'bg-danger/10',    text: 'text-danger',  dot: 'bg-danger'   },
};

export const Badge: React.FC<BadgeProps> = ({ status, className }) => {
  const c = config[status] ?? { bg: 'bg-bg-section', text: 'text-text-secondary', dot: 'bg-text-secondary' };
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-inter font-semibold uppercase tracking-wide', c.bg, c.text, className)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', c.dot)} />
      {status}
    </span>
  );
};
