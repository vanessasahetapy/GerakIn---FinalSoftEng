import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Trainer } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface TrainerCardProps {
  trainer: Trainer;
  selected?: boolean;
  onSelect: (t: Trainer) => void;
}

const specialtyColors: Record<string, string> = {
  Strength: 'bg-accent/20 text-accent',
  Cardio:   'bg-blue-500/20 text-blue-400',
  Bulking:  'bg-amber-500/20 text-amber-400',
  Cutting:  'bg-green-500/20 text-green-400',
};

export const TrainerCard: React.FC<TrainerCardProps> = ({ trainer, selected, onSelect }) => {
  const initials = trainer.initials || trainer.name?.charAt(0) || 'T';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-bg-surface rounded-xl border shadow-card p-5 flex flex-col gap-4 transition-all duration-200 cursor-pointer ${
        selected ? 'border-accent shadow-card-hover' : 'border-border/40 hover:border-accent'
      }`}
      onClick={() => onSelect(trainer)}
    >
      <div className="flex items-start gap-3">
        <Avatar initials={initials} variant="orange" size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-barlow font-bold text-lg text-text-primary leading-tight">{trainer.name}</h3>
          <span className={`inline-block text-xs font-inter font-semibold px-2 py-0.5 rounded-full mt-1 ${specialtyColors[trainer.specialty || ''] ?? 'bg-bg-section text-text-secondary'}`}>
            {trainer.specialty || 'Trainer'}
          </span>
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>

      <p className="text-sm font-inter text-text-secondary leading-relaxed line-clamp-2">{trainer.bio || 'Pelatih berpengalaman siap membantumu mencapai target kebugaran.'}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star size={14} className="text-accent-2 fill-accent-2" />
          <span className="font-inter font-semibold text-sm text-text-primary">{trainer.rating || 0}</span>
          <span className="text-xs text-text-light">({trainer.sessions || 0})</span>
        </div>
        <span className="font-barlow font-bold text-lg text-accent">Rp {(trainer.rate || 0).toLocaleString()}rb/jam</span>
      </div>

      <Button variant={selected ? 'primary' : 'ghost'} size="sm" className="w-full justify-center" onClick={() => onSelect(trainer)}>
        {selected ? 'Terpilih ✓' : 'Pilih Pelatih'}
      </Button>
    </motion.div>
  );
};
