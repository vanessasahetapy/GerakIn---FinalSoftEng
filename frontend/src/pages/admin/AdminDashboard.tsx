import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, Award, Zap } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { ActivityBarChart } from '../../components/charts/ActivityBarChart';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export const AdminDashboard: React.FC = () => {
  const stats = useQuery(api.analytics.getAdminStats);
  const platform = useQuery(api.analytics.getPlatformAnalytics);
  const activities = useQuery(api.analytics.getSystemActivity);
  
  const kpis = stats?.kpis || [];
  const leaderboard = stats?.leaderboard || [];
  const pulse = platform?.pulse || [];

  if (!stats || !platform || !activities) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Zap className="animate-pulse text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi: any, i: number) => (
          <StatCard 
            key={kpi.label} 
            label={kpi.label} 
            value={kpi.value} 
            numeric={parseFloat(kpi.value.replace(/[^0-9.]/g, ''))}
            trend={kpi.trend}
            delay={i * 0.1}
            icon={i === 0 ? <Users /> : i === 1 ? <UserCheck /> : i === 2 ? <Calendar /> : <DollarSign />}
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 p-8 border-border bg-bg-surface" hover={false}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-accent rounded-full" />
              <h2 className="font-barlow font-bold text-xl uppercase tracking-tight text-text-primary">System Throughput</h2>
            </div>
            <span className="text-[10px] font-bold text-text-light uppercase tracking-widest opacity-40">Booking Pulse (Last 7 Days)</span>
          </div>
          <ActivityBarChart data={pulse} xKey="date" dataKey="sessions" height={300} />
        </Card>

        {/* Activity Feed */}
        <Card className="p-8 overflow-hidden flex flex-col border-border bg-bg-surface" hover={false}>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1 h-6 bg-accent rounded-full" />
            <h2 className="font-barlow font-bold text-xl uppercase tracking-tight text-text-primary">System Feed</h2>
          </div>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide">
            {activities.length === 0 ? (
               <p className="text-center py-10 text-text-light text-xs italic">No activity recorded.</p>
            ) : (
              activities.map((item: any, i: number) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4 relative last:pb-0 pb-6 before:absolute before:left-5 before:top-10 before:bottom-0 before:w-px before:bg-border last:before:hidden"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-border ${
                    item.type === 'booking' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-bg-section text-text-primary'
                  }`}>
                    {item.type === 'booking' ? <Calendar size={18} /> : <Users size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary leading-snug">{item.message}</p>
                    <p className="text-[10px] font-bold text-text-light uppercase tracking-widest mt-1 opacity-50">{item.time}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trainer Leaderboard */}
        <Card className="p-8 border-border bg-bg-surface" hover={false}>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1 h-6 bg-accent rounded-full" />
            <h2 className="font-barlow font-bold text-xl uppercase tracking-tight text-text-primary">Top Trainers</h2>
          </div>
          <div className="space-y-3">
            {leaderboard.length === 0 ? (
               <p className="text-text-light text-sm italic">Synchronizing performance data...</p>
            ) : (
              leaderboard.map((entry: any) => (
                <div key={entry.trainerId} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-bg-base/50 hover:border-accent/40 transition-all group">
                  <div className="w-6 h-6 flex items-center justify-center font-bold text-sm text-text-light group-hover:text-accent transition-colors">
                    {entry.rank === 1 ? <Award size={18} className="text-accent" /> : entry.rank}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-bg-surface border border-border flex items-center justify-center text-text-secondary text-xs font-bold uppercase">
                    {entry.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="font-bold text-text-primary text-sm tracking-tight uppercase truncate">{entry.name}</p>
                     <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-60">{entry.sessions} Sessions · {entry.rating} Rating</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                     <p className="font-barlow font-extrabold text-base text-text-primary mb-0.5">${(entry.revenue || 0).toLocaleString()}</p>
                     <p className="text-[10px] font-bold text-success uppercase tracking-widest">Active</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* System Health */}
        <div className="grid grid-cols-2 gap-4">
           <Card className="bg-bg-surface border-border p-8 relative overflow-hidden" hover={true}>
              <div className="relative z-10">
                 <p className="text-[10px] uppercase font-bold tracking-widest text-text-light mb-2">Platform Health</p>
                 <p className="text-4xl font-barlow font-extrabold text-text-primary leading-none">100<span className="text-xl text-text-light ml-1">%</span></p>
                 <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest">
                    <TrendingUp size={14} /> Database Synced
                 </div>
              </div>
           </Card>
           <Card className="bg-bg-surface border-border p-8 relative overflow-hidden" hover={true}>
              <div className="relative z-10">
                 <p className="text-[10px] uppercase font-bold tracking-widest text-text-light mb-2">Daily Load</p>
                 <p className="text-4xl font-barlow font-extrabold text-text-primary leading-none">{activities.length}</p>
                 <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-text-light uppercase tracking-widest">
                    <Calendar size={14} /> Active Events
                 </div>
              </div>
           </Card>
           <Card className="col-span-2 p-10 flex items-center justify-between border-border border-dashed bg-bg-surface/50">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-accent/10 border border-accent/20 text-accent rounded-2xl flex items-center justify-center">
                    <Zap size={28} />
                 </div>
                 <div>
                    <h4 className="font-barlow font-bold text-text-primary uppercase text-lg">Infrastructure Integrity</h4>
                    <p className="text-xs text-text-secondary mt-1">Convex backend is live. All stats are real-time.</p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

