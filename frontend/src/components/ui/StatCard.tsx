// === FILE: src/components/ui/StatCard.tsx ===
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  numeric?: number;  // if provided, count-up animation
  trend?: number;    // % positive or negative
  icon?: React.ReactNode;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, numeric, trend, icon, delay = 0 }) => {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (numeric == null) return;
    
    let start = displayed;
    const end = numeric;
    
    if (start === end) return;

    const duration = 800;
    const step = (end - start) / (duration / 16);
    
    const timer = setInterval(() => {
      start += step;
      if (step > 0 ? start >= end : start <= end) { 
        setDisplayed(end); 
        clearInterval(timer); 
      } else {
        setDisplayed(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [numeric]);

  return (
    <Card animate delay={delay} className="relative overflow-hidden">
      {icon && <div className="absolute top-4 right-4 text-accent opacity-20 scale-150">{icon}</div>}
      <p className="text-label mb-2">{label}</p>
      <motion.p
        className="font-bold text-4xl text-text-primary tracking-tight leading-none"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.1, duration: 0.4 }}
      >
        {numeric != null ? displayed.toLocaleString() : value}
      </motion.p>
      {trend != null && (
        <div className={`flex items-center gap-1 mt-2 text-sm font-inter font-medium ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trend >= 0 ? '+' : ''}{trend}%</span>
          <span className="text-text-light font-normal">vs last period</span>
        </div>
      )}
    </Card>
  );
};
