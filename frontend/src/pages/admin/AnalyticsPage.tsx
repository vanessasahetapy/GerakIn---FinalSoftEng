// === FILE: src/pages/admin/AnalyticsPage.tsx ===
import React, { useState } from 'react';
import { Download, Send, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ActivityBarChart } from '../../components/charts/ActivityBarChart';
import { WorkoutDonutChart } from '../../components/charts/WorkoutDonutChart';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

const RANGES = ['7d', '30d', '90d', '1y'];

export const AnalyticsPage: React.FC = () => {
  const [range, setRange] = useState('30d');
  const analytics = useQuery(api.analytics.getPlatformAnalytics);

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  const { distribution, pulse, userEngagement } = analytics;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="page-title mb-2" style={{ fontSize: '2.5rem' }}>Platform Analytics</h1>
          <p className="text-text-secondary font-inter text-sm">Deep dive into user behavior and session distribution.</p>
        </div>
        <div className="flex gap-2 bg-bg-surface p-1 rounded-xl border border-border shadow-sm">
           {RANGES.map(r => (
             <button
               key={r}
               onClick={() => setRange(r)}
               className={`px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-lg transition-all ${
                 range === r ? 'bg-accent text-white shadow-lg' : 'text-text-light hover:text-text-secondary'
               }`}
             >
               {r}
             </button>
           ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sessions per day */}
        <Card className="lg:col-span-2 p-8 border-border bg-bg-surface" hover={false}>
          <div className="flex items-center justify-between mb-10">
            <div className="section-divider">
              <h2 className="section-title text-xl tracking-tight">Sessions Activity Pulse</h2>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">
               <Download size={14} /> Export Dataset
            </button>
          </div>
          <ActivityBarChart data={pulse} xKey="date" dataKey="sessions" height={320} />
        </Card>

        {/* Workout Type Breakdown */}
        <Card className="p-8 border-border bg-bg-surface flex flex-col" hover={false}>
          <div className="section-divider mb-8">
            <h2 className="section-title text-xl tracking-tight">Workout Distribution</h2>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <WorkoutDonutChart data={distribution} height={280} />
            <div className="mt-8 space-y-4">
               {distribution.map(item => (
                 <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                       <span className="text-xs font-inter font-bold text-text-secondary uppercase tracking-wider">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-text-primary">{item.value}%</span>
                 </div>
               ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
         {/* Engagement Feed (Real Data) */}
         <Card className="p-8 border-border bg-bg-surface" hover={false}>
            <div className="section-divider mb-8">
               <h2 className="section-title text-xl tracking-tight">Engagement Streaks</h2>
            </div>
            <div className="space-y-6">
               {userEngagement.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-bg-base/50 rounded-xl border border-border">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                           {u.name.slice(0, 1)}
                        </div>
                        <div>
                           <p className="font-bold text-sm text-text-primary uppercase">{u.name}</p>
                           <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">{u.sessions} Total Sessions</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black text-white italic">🔥 {u.streak}</p>
                        <p className="text-[9px] font-bold text-text-light uppercase tracking-widest">Active Streak</p>
                     </div>
                  </div>
               ))}
            </div>
         </Card>

         {/* Engagement Table */}
         <Card className="p-8 overflow-hidden flex flex-col border-border bg-bg-surface" hover={false}>
            <div className="section-divider mb-8">
               <h2 className="section-title text-xl tracking-tight">Athlete Engagement Pulse</h2>
            </div>
            <div className="overflow-x-auto flex-1">
               <table className="w-full text-left font-inter">
                  <thead className="text-[10px] uppercase text-text-light font-black border-b border-border tracking-widest opacity-60">
                     <tr>
                        <th className="pb-5">Athlete</th>
                        <th className="pb-5">Sessions</th>
                        <th className="pb-5 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                     {userEngagement.length === 0 ? (
                       <tr><td colSpan={3} className="py-10 text-center text-text-secondary italic">No engagement data.</td></tr>
                     ) : (
                       userEngagement.map((user: any) => (
                         <tr key={user.id} className="group">
                            <td className="py-5">
                               <p className="text-sm font-black text-text-primary uppercase tracking-tight">{user.name}</p>
                               <p className="text-[10px] text-text-light uppercase font-bold tracking-widest">Active User</p>
                            </td>
                            <td className="py-5 text-[11px] font-bold text-accent uppercase tracking-wider">
                               {user.sessions} recorded
                            </td>
                            <td className="py-5 text-right">
                               <button className="w-9 h-9 flex items-center justify-center text-accent bg-accent/10 rounded-xl hover:bg-accent hover:text-white transition-all shadow-sm ml-auto">
                                  <Send size={14} />
                               </button>
                            </td>
                         </tr>
                       ))
                     )}
                  </tbody>
               </table>
            </div>
         </Card>
      </div>
    </div>
  );
};
