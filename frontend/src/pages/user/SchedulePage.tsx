// === FILE: src/pages/user/SchedulePage.tsx ===
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, Loader2, MessageSquare } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';
import { ChatModal } from '../../components/chat/ChatModal';

export const SchedulePage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const bookings = useQuery(api.bookings.getUserBookings, currentUser ? { userId: currentUser.id as any } : "skip");
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [chatUser, setChatUser] = useState<{ id: string; name: string } | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd   = endOfMonth(currentMonth);
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd    = endOfWeek(monthEnd,     { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = gridStart;
  while (day <= gridEnd) { days.push(day); day = addDays(day, 1); }

  const sessionsForSelected = (bookings || []).filter(b => b.date === format(selectedDate, 'yyyy-MM-dd'));

  const getDot = (dateStr: string) => {
    const ss = (bookings || []).filter(b => b.date === dateStr);
    if (!ss.length) return null;
    if (ss.some(s => s.status === 'ACCEPTED')) return 'bg-accent';
    if (ss.some(s => s.status === 'PENDING'))  return 'bg-amber-500';
    return 'bg-text-light';
  };

  if (!bookings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="page-title" style={{fontSize:'2.5rem'}}>Jadwal Saya</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" hover={false}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-barlow font-bold text-2xl text-text-primary uppercase">{format(currentMonth,'MMMM yyyy', { locale: id })}</h2>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(m => addDays(startOfMonth(m), -1))}
                className="w-8 h-8 rounded-lg bg-bg-section hover:bg-accent-light hover:text-accent flex items-center justify-center transition-colors">
                <ChevronLeft size={16}/>
              </button>
              <button onClick={() => setCurrentMonth(m => addDays(endOfMonth(m), 1))}
                className="w-8 h-8 rounded-lg bg-bg-section hover:bg-accent-light hover:text-accent flex items-center justify-center transition-colors">
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(d => (
              <div key={d} className="text-center text-xs font-inter font-semibold text-text-light uppercase py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              const ds = format(d,'yyyy-MM-dd');
              const isSel   = isSameDay(d, selectedDate);
              const isToday = isSameDay(d, new Date());
              const inMonth = isSameMonth(d, currentMonth);
              const dot     = getDot(ds);
              return (
                <motion.button key={i} onClick={() => setSelectedDate(d)} whileHover={{scale:1.05}}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-xl min-h-[52px] transition-all
                    ${isSel ? 'bg-accent text-white shadow-lg' : ''}
                    ${isToday && !isSel ? 'border-2 border-accent text-accent' : ''}
                    ${!isSel && !isToday ? 'hover:bg-bg-section' : ''}
                    ${!inMonth ? 'opacity-30' : ''}`}>
                  <span className="font-inter font-medium text-sm">{format(d,'d')}</span>
                  {dot && <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSel ? 'bg-white' : dot}`}/>}
                </motion.button>
              );
            })}
          </div>
        </Card>

        <Card hover={false} className="flex flex-col">
          <p className="card-label mb-4 uppercase tracking-widest">{format(selectedDate,'EEEE, d MMM', { locale: id })}</p>
          {sessionsForSelected.length === 0 ? (
            <div className="text-center py-20 bg-bg-section/30 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center">
              <Clock size={32} className="text-text-light mb-3 opacity-50"/>
              <p className="text-text-secondary font-inter text-sm mb-4">Tidak ada sesi pada hari ini.</p>
              <Button size="sm" onClick={() => window.location.href='/user/booking'}>Pesan Sekarang</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionsForSelected.map(s => (
                <div key={s._id} className="relative pl-4 overflow-hidden rounded-xl border border-border bg-bg-surface group">
                   <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent" />
                   <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-barlow font-bold text-lg text-text-primary uppercase">{s.trainerName}</p>
                        <Badge status={s.status}/>
                      </div>
                      <p className="text-xs text-text-secondary font-inter font-medium opacity-70">
                        {s.workoutType} · {s.time} · {s.duration} menit
                      </p>
                      
                      <div className="flex gap-4 mt-6 pt-4 border-t border-border/50">
                        <button 
                          onClick={() => setChatUser({ id: s.trainerId, name: s.trainerName })}
                          className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline flex items-center gap-1.5"
                        >
                           <MessageSquare size={12} /> Chat Pelatih
                        </button>
                        <button className="text-[10px] font-bold text-text-light uppercase tracking-widest hover:text-danger transition-colors">
                           Batalkan
                        </button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <AnimatePresence>
        {chatUser && (
          <ChatModal 
            receiverId={chatUser.id} 
            receiverName={chatUser.name} 
            onClose={() => setChatUser(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
