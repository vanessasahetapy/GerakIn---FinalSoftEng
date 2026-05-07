import React, { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

interface TopBarProps {
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { currentUser } = useAuthStore();
  const streak = currentUser?.streak || 0;
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = useQuery(api.notifications.getNotifications, currentUser?.id ? { userId: currentUser.id as any } : "skip");
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const clearAll = useMutation(api.notifications.clearAll);

  const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;

  const handleMarkAll = async () => {
    if (!currentUser) return;
    await markAllAsRead({ userId: currentUser.id as any });
  };

  const handleClearAll = async () => {
    if (!currentUser) return;
    if (confirm('Hapus semua riwayat notifikasi?')) {
      await clearAll({ userId: currentUser.id as any });
    }
  };

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
          className="relative w-9 h-9 rounded-lg bg-bg-section flex items-center justify-center hover:bg-accent-light transition-colors group"
        >
          <Bell size={18} className="text-text-secondary group-hover:text-accent transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-[8px] font-bold text-white flex items-center justify-center border-2 border-bg-base">
              {unreadCount}
            </span>
          )}
        </button>
        
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-bg-surface rounded-2xl shadow-2xl border border-white/5 z-50 overflow-hidden backdrop-blur-xl"
            >
              <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                <p className="font-bold text-xs text-white uppercase tracking-widest">Notifikasi</p>
                <div className="flex gap-3">
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAll} className="text-[9px] font-bold text-accent hover:underline uppercase">Tandai Dibaca</button>
                  )}
                  {notifications && notifications.length > 0 && (
                    <button onClick={handleClearAll} className="text-[9px] font-bold text-text-light hover:text-white uppercase">Hapus</button>
                  )}
                </div>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                {notifications && notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n._id} 
                      onClick={() => !n.isRead && markAsRead({ id: n._id })}
                      className={`px-5 py-4 transition-all cursor-pointer border-b border-white/5 last:border-0 ${
                        !n.isRead ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm font-bold ${!n.isRead ? 'text-white' : 'text-text-secondary'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1" />}
                      </div>
                      <p className="text-xs text-text-light leading-relaxed mb-2 opacity-70">{n.message}</p>
                      <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest italic opacity-40">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center opacity-30">
                    <Bell size={32} className="mx-auto mb-3" />
                    <p className="text-xs italic">Panel notifikasi kosong.</p>
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-white/5 border-t border-white/5 text-center">
                 <button className="text-[10px] font-bold text-text-light hover:text-white uppercase tracking-widest transition-colors">
                    Lihat Semua Aktivitas
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
