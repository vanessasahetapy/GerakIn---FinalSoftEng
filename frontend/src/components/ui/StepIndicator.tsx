// === FILE: src/components/ui/StepIndicator.tsx ===
import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  current: number;  // 1-indexed
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, current }) => {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center font-barlow font-bold text-lg transition-all duration-300',
                  done   && 'bg-accent text-white',
                  active && 'bg-accent text-white ring-4 ring-accent-light',
                  !done && !active && 'bg-bg-section text-text-light border-2 border-border'
                )}
              >
                {done ? <Check size={18} strokeWidth={3} /> : idx}
              </div>
              <span className={clsx('mt-2 text-xs font-inter font-medium whitespace-nowrap',
                active ? 'text-accent' : done ? 'text-text-primary' : 'text-text-light')}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={clsx(
                'flex-1 h-0.5 mx-3 mt-[-16px] transition-all duration-500',
                idx < current ? 'bg-accent' : 'bg-border'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
