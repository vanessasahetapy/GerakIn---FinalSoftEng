// === FILE: src/pages/trainer/BookingRequestsPage.tsx ===
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Calendar, Clock, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';

const TABS = ['Pending', 'Accepted', 'Rejected'];

export const BookingRequestsPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const bookings = useQuery(api.bookings.getTrainerBookings, currentUser ? { trainerId: currentUser.id as any } : "skip");
  const updateStatus = useMutation(api.bookings.updateStatus);
  
  const [activeTab, setActiveTab] = useState('Pending');

  if (!bookings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  const filtered = bookings.filter(b => {
    if (activeTab === 'Pending') return b.status === 'PENDING';
    if (activeTab === 'Accepted') return b.status === 'ACCEPTED';
    if (activeTab === 'Rejected') return b.status === 'REJECTED';
    return true;
  });

  const handleStatusUpdate = async (id: any, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await updateStatus({ id, status });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title mb-2" style={{ fontSize: '2.5rem' }}>Booking Requests</h1>
        <p className="text-text-secondary font-inter text-sm">Manage incoming session requests and schedule.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-8">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-xs font-inter font-bold uppercase tracking-[0.2em] transition-all relative ${
              activeTab === tab ? 'text-accent' : 'text-text-light hover:text-text-secondary'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-24 text-center border border-dashed border-border rounded-3xl"
            >
              <div className="w-16 h-16 bg-bg-section rounded-full flex items-center justify-center mx-auto mb-4 text-text-light opacity-50">
                <Calendar size={32} />
              </div>
              <p className="text-text-secondary font-inter text-sm font-medium">No {activeTab.toLowerCase()} requests found.</p>
            </motion.div>
          ) : (
            filtered.map((request) => (
              <motion.div
                key={request._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col border-border bg-bg-surface group">
                  <div className="flex justify-between items-start mb-6">
                    <Badge status={request.status} />
                    <span className="text-[10px] font-inter font-bold text-text-light uppercase tracking-widest opacity-50">
                      ID: {request._id.slice(0, 8)}...
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-8">
                    <Avatar initials={request.userName.slice(0,1)} size="lg" variant="navy" className="shadow-lg" />
                    <div>
                      <h3 className="font-barlow font-bold text-xl text-text-primary uppercase truncate max-w-[180px] tracking-tight">
                        {request.userName}
                      </h3>
                      <p className="text-[10px] text-accent font-bold uppercase tracking-[0.1em]">{request.workoutType}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    <div className="flex items-center gap-3 text-xs font-medium text-text-secondary font-inter">
                      <div className="w-8 h-8 rounded-lg bg-bg-section flex items-center justify-center text-text-light group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                        <Calendar size={14} />
                      </div>
                      <span>{request.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-text-secondary font-inter">
                       <div className="w-8 h-8 rounded-lg bg-bg-section flex items-center justify-center text-text-light group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                        <Clock size={14} />
                      </div>
                      <span>{request.time} ({request.duration || 60} min)</span>
                    </div>

                    {request.notes && (
                      <div className="mt-4 p-4 bg-white/5 border border-white/5 rounded-2xl group-hover:border-accent/10 transition-colors">
                         <p className="text-[10px] font-bold text-accent/60 uppercase tracking-[0.15em] mb-1.5">Target Sesi / Catatan:</p>
                         <p className="text-xs text-text-secondary leading-relaxed italic">"{request.notes}"</p>
                      </div>
                    )}
                  </div>

                  {activeTab === 'Pending' && (
                    <div className="flex gap-3 mt-auto">
                      <Button 
                        variant="primary" 
                        size="sm"
                        className="flex-1 justify-center bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 text-[10px] tracking-widest"
                        onClick={() => handleStatusUpdate(request._id, 'ACCEPTED')}
                      >
                        <Check size={14} /> Accept
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        className="flex-1 justify-center border-border/50 text-[10px] tracking-widest"
                        onClick={() => handleStatusUpdate(request._id, 'REJECTED')}
                      >
                        <X size={14} /> Reject
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
