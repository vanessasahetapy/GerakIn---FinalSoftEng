// === FILE: src/components/booking/WeekCalendar.tsx ===
import React from 'react';
import { clsx } from 'clsx';
import { addDays, format, startOfWeek, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';

interface WeekCalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  bookedDates?: string[];
}

export const WeekCalendar: React.FC<WeekCalendarProps> = ({
  selectedDate, onSelect, bookedDates = [],
}) => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const isSelected = selectedDate === dateStr;
        const isToday    = isSameDay(day, today);
        const isBooked   = bookedDates.includes(dateStr);
        const isPast     = day < today && !isToday;

        return (
          <button
            key={dateStr}
            onClick={() => !isPast && onSelect(dateStr)}
            disabled={isPast}
            className={clsx(
              'flex flex-col items-center gap-1 px-3 py-3 rounded-xl min-w-[56px] border-2 transition-all duration-150',
              isSelected && 'bg-accent border-accent text-white',
              !isSelected && !isPast && 'bg-bg-surface/50 border-border/40 text-text-primary hover:border-accent hover:bg-bg-surface',
              isPast && 'bg-bg-section/30 border-transparent text-text-muted cursor-not-allowed opacity-40',
            )}
          >
            <span className="text-xs font-inter font-medium uppercase opacity-70">
              {format(day, 'EEE', { locale: id })}
            </span>
            <span className={clsx('font-barlow font-bold text-xl leading-none', isToday && !isSelected && 'text-accent')}>
              {format(day, 'd')}
            </span>
            {isBooked && (
              <span className={clsx('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white' : 'bg-accent')} />
            )}
          </button>
        );
      })}
    </div>
  );
};
