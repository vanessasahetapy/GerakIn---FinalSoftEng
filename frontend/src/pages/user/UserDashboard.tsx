// === FILE: src/pages/user/UserDashboard.tsx ===
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Heart, Clock, Zap, ChevronRight, Loader2 } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ActivityBarChart } from '../../components/charts/ActivityBarChart';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';

const QUICK_ACTIONS = [
  { label:'Pesan Pelatih', icon:<BookOpen size={22}/>,  path:'/user/booking',  color:'bg-accent/10 text-accent' },
  { label:'Jadwal Saya',  icon:<Calendar size={22}/>,  path:'/user/schedule', color:'bg-blue-500/10 text-blue-400'   },
  { label:'Kebiasaan Saya', icon:<Heart size={22}/>,     path:'/user/habits',   color:'bg-green-500/10 text-green-400' },
  { label:'Riwayat',      icon:<Clock size={22}/>,     path:'/user/history',  color:'bg-amber-500/10 text-amber-400' },
];

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const data = useQuery(api.analytics.getUserDashboardData, currentUser ? { userId: currentUser.id as any } : "skip");

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  const { stats, pulse, upcoming, recent } = data;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sesi"     value={stats.totalSessions} numeric={stats.totalSessions} trend={stats.trends?.sessions}   delay={0}    />
        <StatCard label="Minggu Ini"     value={stats.thisWeek}      numeric={stats.thisWeek}      trend={stats.trends?.week}       delay={0.07} />
        <StatCard label="Sesi Beruntun"  value={`${stats.streak} hari`}                           trend={stats.trends?.streak}     delay={0.14} />
        <StatCard label="Sesi Berikutnya" value={stats.nextSessionDate}                                          delay={0.21} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly chart */}
        <Card animate className="lg:col-span-2 p-6" hover={false}>
          <div className="flex items-center justify-between mb-6">
            <div className="section-divider">
              <h2 className="section-title text-xl">Aktivitas Mingguan</h2>
            </div>
            <span className="text-xs text-text-secondary font-inter">Metrik langsung dari database</span>
          </div>
          <ActivityBarChart data={pulse} xKey="day" dataKey="sessions" height={220} />
        </Card>

        {/* Upcoming session */}
        <Card accent animate delay={0.1} className="flex flex-col gap-4">
          <p className="card-label">Sesi Mendatang</p>
          {upcoming ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-white font-bold text-lg">
                  {upcoming.trainerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-lg text-text-primary leading-tight">{upcoming.trainerName}</p>
                  <p className="text-xs text-accent font-semibold">{upcoming.workoutType}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm font-inter text-text-secondary">
                <div className="flex justify-between"><span>Tanggal</span><span className="font-medium text-text-primary">{upcoming.date}</span></div>
                <div className="flex justify-between"><span>Waktu</span><span className="font-medium text-text-primary">{upcoming.time}</span></div>
                <div className="flex justify-between"><span>Durasi</span><span className="font-medium text-text-primary">{upcoming.duration} menit</span></div>
              </div>
              <Badge status={upcoming.status} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-40 text-center">
              <Calendar size={48} className="mb-4 text-text-light" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2">Belum Ada Jadwal</p>
              <p className="text-[10px] text-text-secondary leading-relaxed px-4">Siap untuk mulai? Pesan pelatih profesionalmu sekarang juga!</p>
            </div>
          )}
          <button onClick={() => navigate('/user/booking')}
            className="flex items-center gap-2 text-sm text-accent font-semibold hover:underline mt-auto">
            Cari Pelatih <ChevronRight size={14}/>
          </button>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 bg-accent rounded-full" />
          <h2 className="font-bold text-lg uppercase tracking-tight">Tindakan Cepat</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((a, i) => (
            <motion.div key={a.label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
              transition={{delay: i*0.07}} whileHover={{y:-4}}
              onClick={() => navigate(a.path)}
              className="matte-card p-5 flex flex-col items-center gap-3 text-center cursor-pointer hover:border-accent/40">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${a.color} border border-border/10`}>{a.icon}</div>
              <span className="text-label text-text-primary">{a.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <Card animate delay={0.2} hover={false}>
        <div className="flex items-center justify-between mb-5">
          <div className="section-divider">
            <h2 className="section-title text-xl">Pemesanan Terbaru</h2>
          </div>
          <button onClick={() => navigate('/user/history')} className="text-xs text-accent font-semibold hover:underline transition-all">Lihat Semua</button>
        </div>
        <div className="space-y-3">
          {recent.length === 0 ? (
            <div className="py-16 text-center opacity-30">
              <Zap size={40} className="mx-auto mb-4" />
              <p className="text-sm italic">Belum ada riwayat pemesanan.</p>
            </div>
          ) : (
            recent.map(b => (
              <div key={b._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-bg-section transition-all group border border-transparent hover:border-border/40">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <Zap size={16}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter font-bold text-sm text-text-primary uppercase tracking-tight">{b.trainerName}</p>
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest opacity-60">{b.workoutType} · {b.date} {b.time}</p>
                </div>
                <Badge status={b.status}/>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
