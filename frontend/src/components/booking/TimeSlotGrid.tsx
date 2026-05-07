// === FILE: src/components/booking/TimeSlotGrid.tsx ===
import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const ALL_SLOTS = [
  '07:00','08:00','09:00','10:00','11:00',
  '14:00','15:00','16:00','17:00','18:00','19:00','20:00',
];

interface TimeSlotGridProps {
  selectedTime: string;
  onSelect: (time: string) => void;
  unavailable?: string[];
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  selectedTime, onSelect, unavailable = [],
}) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ALL_SLOTS.map((slot, i) => {
        const isUnavailable = unavailable.includes(slot);
        const isSelected    = selectedTime === slot;
        return (
          <motion.button
            key={slot}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            disabled={isUnavailable}
            onClick={() => !isUnavailable && onSelect(slot)}
            className={clsx(
              'px-2 py-2.5 rounded-lg text-sm font-inter font-medium border-2 transition-all duration-150',
              isSelected    && 'bg-accent border-accent text-white',
              isUnavailable && 'bg-bg-section/30 border-transparent text-text-muted cursor-not-allowed line-through opacity-40',
              !isSelected && !isUnavailable && 'bg-bg-surface/50 border-border/40 text-text-primary hover:border-accent hover:bg-bg-surface hover:text-accent',
            )}
          >
            {slot}
          </motion.button>
        );
      })}
    </div>
  );
};
