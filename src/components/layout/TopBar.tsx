import React, { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

interface TopBarProps {
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { currentUser } = useAuthStore();
  const streak = currentUser?.streak || 0;
  const [notifOpen, setNotifOpen] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam';

  return (
    <header className="h-16 bg-bg-base border-b border-border flex items-center px-6 gap-4 sticky top-0 z-20">
      <div className="flex-1">
        {title ? (
          <h1 className="font-bold text-xl text-text-primary tracking-tight">{title}</h1>
        ) : (
          <div className="flex items-center gap-3">
            <p className="font-inter font-medium text-text-primary">
              {greeting}, <span className="font-semibold text-text-primary">{currentUser?.name?.split(' ')[0]} 💪</span>
            </p>
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                className="flex items-center gap-1.5 bg-accent-light text-accent px-3 py-1 rounded-full text-xs font-inter font-semibold"
              >
                🔥 {streak} Hari Beruntun
              </motion.div>
            )}
          </div>
        )}
      </div>


      {/* Bell */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative w-9 h-9 rounded-lg bg-bg-section flex items-center justify-center hover:bg-accent-light transition-colors"
        >
          <Bell size={18} className="text-text-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
        </button>
        {notifOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-2 w-72 bg-bg-surface rounded-xl shadow-card-hover border border-border z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border">
              <p className="font-bold text-base text-text-primary uppercase tracking-widest">Notifikasi</p>
            </div>
            {[
              { msg: 'Marcus Reid mengonfirmasi sesi Anda', time: '2 jam yang lalu' },
              { msg: 'Sesi besok jam 17:00 — pengingat', time: '5 jam yang lalu' },
              { msg: 'Pelatih baru tersedia: Lena Fischer', time: '1 hari yang lalu' },
            ].map((n, i) => (
              <div key={i} className="px-4 py-3 hover:bg-bg-section transition-colors border-b border-border last:border-0">
                <p className="text-sm font-inter text-text-primary">{n.msg}</p>
                <p className="text-xs text-text-light mt-0.5">{n.time}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </header>
  );
};
