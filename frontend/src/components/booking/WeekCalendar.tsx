// === FILE: src/components/booking/WeekCalendar.tsx ===
import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
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
  const days = Array.from({ length: 60 }, (_, i) => addDays(today, i));

  // Group days by month for navigation
  const months = days.reduce((acc: any[], day) => {
    const monthName = format(day, 'MMMM yyyy', { locale: id });
    if (!acc.find(m => m.name === monthName)) {
      acc.push({ name: monthName, firstDate: format(day, 'yyyy-MM-dd') });
    }
    return acc;
  }, []);

  const [activeMonth, setActiveMonth] = React.useState(months[0].name);

  // Filter days based on active month
  const visibleDays = days.filter(day => format(day, 'MMMM yyyy', { locale: id }) === activeMonth);

  return (
    <div className="space-y-6">
      {/* Month Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-bg-base/50 rounded-2xl w-fit border border-white/5">
        {months.map((m) => (
          <button
            key={m.name}
            onClick={() => setActiveMonth(m.name)}
            className={clsx(
              'px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300',
              activeMonth === m.name 
                ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                : 'text-text-secondary hover:text-white hover:bg-white/5'
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 min-h-[110px]">
        {visibleDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = selectedDate === dateStr;
          const isToday    = isSameDay(day, today);
          const isBooked   = bookedDates.includes(dateStr);
          const isPast     = day < today && !isToday;

          return (
            <motion.button
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={dateStr}
              onClick={() => !isPast && onSelect(dateStr)}
              disabled={isPast}
              className={clsx(
                'flex flex-col items-center gap-1.5 px-3 py-4 rounded-2xl min-w-[64px] border-2 transition-all duration-200',
                isSelected && 'bg-accent border-accent text-white shadow-lg shadow-accent/20 scale-105',
                !isSelected && !isPast && 'bg-bg-surface/50 border-white/5 text-text-primary hover:border-accent/40 hover:bg-bg-surface',
                isPast && 'bg-bg-section/30 border-transparent text-text-muted cursor-not-allowed opacity-40',
              )}
            >
              <span className="text-[10px] font-inter font-bold uppercase opacity-50 tracking-tighter">
                {format(day, 'EEE', { locale: id })}
              </span>
              <span className={clsx('font-barlow font-black text-2xl leading-none', isToday && !isSelected && 'text-accent')}>
                {format(day, 'd')}
              </span>
              {isBooked && (
                <span className={clsx('w-1.5 h-1.5 rounded-full mt-1', isSelected ? 'bg-white' : 'bg-accent')} />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
