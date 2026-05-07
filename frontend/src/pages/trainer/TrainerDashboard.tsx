import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Users, DollarSign, Star, ChevronRight } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';

export const TrainerDashboard: React.FC = () => {
  const { currentUser } = useAuthStore();
  const bookings = useQuery(api.bookings.getTrainerBookings, currentUser ? { trainerId: currentUser.id as any } : "skip");
  const trainerStats = useQuery(api.analytics.getTrainerStats, currentUser ? { trainerId: currentUser.id as any } : "skip");
  const trainerRatings = useQuery(api.ratings.getTrainerRatings, currentUser ? { trainerId: currentUser.id as any } : "skip");
  const updateStatus = useMutation(api.bookings.updateStatus);

  const pendingRequests = bookings?.filter((b: any) => b.status === 'PENDING') || [];
  const schedule = bookings?.filter((b: any) => b.status === 'ACCEPTED') || [];

  const handleStatusUpdate = async (id: any, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await updateStatus({ id, status });
    } catch (err) {
      console.error(err);
    }
  };

  if (!trainerStats || !bookings) {
    return <div className="p-20 text-center text-text-light">Synchronizing performance data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Live Clients" value={trainerStats.liveClients} numeric={trainerStats.liveClients} icon={<Users />} delay={0} />
        <StatCard label="Pending Requests" value={trainerStats.pendingRequests} numeric={trainerStats.pendingRequests} icon={<Clock />} delay={0.07} />
        <StatCard label="Weekly Revenue" value={`$${(trainerStats.revenue || 0).toLocaleString()}`} numeric={trainerStats.revenue} icon={<DollarSign />} trend={trainerStats.trend} delay={0.14} />
        <StatCard label="Avg Rating" value={trainerStats.rating.toString()} numeric={trainerStats.rating} icon={<Star />} delay={0.21} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Timeline */}
        <Card className="lg:col-span-2 p-8" hover={false}>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1 h-6 bg-accent rounded-full" />
            <h2 className="font-bold text-lg uppercase tracking-tight">Confirmed Schedule</h2>
          </div>
          <div className="relative pl-8 space-y-10 border-l border-border ml-2">
            {schedule.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                <Clock size={48} className="mb-4 text-text-light" />
                <p className="text-text-light text-sm italic">No confirmed sessions yet. Your schedule is clear.</p>
              </div>
            ) : (
              schedule.map((session: any, i: number) => (
                <div key={session._id} className="relative">
                  <div className={`absolute -left-[37px] top-1.5 w-4 h-4 rounded-full border-[3px] border-bg-surface ${i === 0 ? 'bg-accent' : 'bg-bg-section'}`} />
                  <div className="flex items-center justify-between gap-4">
                     <div className="flex-1">
                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">{session.time} · {session.date}</p>
                        <h3 className="font-bold text-lg text-text-primary tracking-tight">{session.workoutType} Session</h3>
                        <p className="text-xs text-text-secondary mt-1">Athlete: <span className="text-text-primary font-medium">{session.userName}</span></p>
                        
                        {session.notes && (
                          <div className="mt-4 p-3 bg-white/5 border border-white/5 rounded-lg">
                            <p className="text-[10px] font-bold text-text-light uppercase tracking-widest mb-1 opacity-50">Target Sesi:</p>
                            <p className="text-xs text-text-secondary italic">"{session.notes}"</p>
                          </div>
                        )}
                     </div>
                     {i === 0 && (
                       <Badge status="ACCEPTED" className="animate-pulse" />
                     )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Pending Requests */}
        <Card className="p-8 overflow-hidden flex flex-col" hover={false}>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1 h-6 bg-accent rounded-full" />
            <h2 className="font-bold text-lg uppercase tracking-tight">Incoming ({pendingRequests.length})</h2>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {pendingRequests.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20 opacity-40">
                  <Users size={40} className="mb-4 text-text-light" />
                  <p className="text-text-light text-sm">No pending requests at the moment.</p>
                </div>
              ) : (
                pendingRequests.map((request: any) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 bg-bg-base rounded-xl border border-border group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold uppercase">
                        {request.userName?.charAt(0) || 'RQ'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-text-primary truncate">{request.userName}</p>
                        <p className="text-xs text-text-secondary">{request.workoutType} · {request.date}</p>
                      </div>
                    </div>
                    
                    {request.notes && (
                      <div className="mb-4 p-3 bg-accent/5 rounded-lg border border-accent/5">
                         <p className="text-[10px] font-bold text-accent/60 uppercase tracking-widest mb-1">Target Sesi:</p>
                         <p className="text-[11px] text-text-secondary italic line-clamp-2">"{request.notes}"</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(request._id, 'ACCEPTED')}
                        className="flex-1 bg-accent/10 border border-accent/20 text-accent py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(request._id, 'REJECTED')}
                        className="flex-1 bg-danger/10 border border-danger/20 text-danger py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-danger hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
          <button className="text-accent text-[11px] font-bold uppercase tracking-widest mt-8 hover:underline flex items-center gap-2">
            View All Requests <ChevronRight size={14} />
          </button>
        </Card>

        {/* Latest Reviews */}
        <Card className="lg:col-span-3 p-8 mt-6" hover={false}>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1 h-6 bg-accent rounded-full" />
            <h2 className="font-bold text-lg uppercase tracking-tight">Recent Feedback ({trainerRatings?.length || 0})</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {!trainerRatings || trainerRatings.length === 0 ? (
              <div className="col-span-3 py-10 text-center opacity-30 italic text-sm">
                No reviews yet. Keep training hard!
              </div>
            ) : (
              trainerRatings.slice(0, 3).map((r: any) => (
                <div key={r._id} className="p-5 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-1 text-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < r.rating ? 'fill-accent' : 'opacity-20'} />
                      ))}
                    </div>
                    <span className="text-[9px] font-bold text-text-light uppercase tracking-widest">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary italic mb-2 line-clamp-3 leading-relaxed">
                    "{r.comment || 'No comment provided.'}"
                  </p>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Athlete #{r.userId.slice(-4)}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

