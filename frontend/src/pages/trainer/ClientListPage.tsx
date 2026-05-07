// === FILE: src/pages/trainer/ClientListPage.tsx ===
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SortAsc, MoreVertical, MessageSquare, Calendar, ChevronRight, X, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';
import { ChatModal } from '../../components/chat/ChatModal';

export const ClientDetailDrawer: React.FC<{ clientId: string; onClose: () => void; onOpenChat: (id: string, name: string) => void }> = ({ clientId, onClose, onOpenChat }) => {
  const { currentUser } = useAuthStore();
  const clientBookings = useQuery(api.bookings.getUserBookings, { userId: clientId as any });
  const clients = useQuery(api.users.getTrainerClients, currentUser ? { trainerId: currentUser.id as any } : "skip");
  const selectedClient = (clients as any)?.find((c: any) => c.id === clientId);

  if (!clientBookings || !selectedClient) return null;

  const recentSessions = clientBookings.filter(b => b.status === 'ACCEPTED').reverse().slice(0, 3);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-bg-surface border-l border-border shadow-2xl z-50 p-8 flex flex-col"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-barlow font-extrabold text-2xl text-text-primary uppercase tracking-tight">Client Detail</h2>
          <button onClick={onClose} className="p-2 text-text-light hover:text-text-primary transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center mb-8 bg-bg-section/30 p-8 rounded-3xl border border-border/50">
           <Avatar initials={selectedClient.initials} size="xl" variant="orange" className="mb-4 shadow-xl" />
           <h3 className="font-barlow font-extrabold text-3xl text-text-primary uppercase leading-none">{selectedClient.name}</h3>
           <p className="text-accent font-bold uppercase tracking-widest text-sm mt-3">{selectedClient.workoutType}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-bg-section p-6 rounded-2xl text-center border border-border/50 shadow-sm">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Sessions</p>
              <p className="font-barlow font-extrabold text-4xl text-text-primary">{selectedClient.sessions}</p>
           </div>
           <div className="bg-bg-section p-6 rounded-2xl text-center border border-border/50 shadow-sm">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Consistency</p>
              <p className="font-barlow font-extrabold text-4xl text-accent">{selectedClient.consistency}%</p>
           </div>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide">
           <div className="section-divider">
              <h4 className="section-title text-sm tracking-widest">Recent Activity</h4>
           </div>
           <div className="space-y-4">
              {recentSessions.length === 0 ? (
                <p className="text-center py-10 text-text-secondary italic text-xs">No completed sessions found.</p>
              ) : (
                recentSessions.map(session => (
                    <div key={session._id} className="flex gap-4 p-4 border border-border bg-bg-section/10 rounded-xl hover:bg-bg-section/20 transition-all">
                       <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                          <Calendar size={18} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-text-primary uppercase tracking-tight">{session.workoutType} Session</p>
                          <p className="text-[10px] font-bold text-text-light uppercase tracking-wide">{session.date} · {session.time}</p>
                       </div>
                    </div>
                ))
              )}
           </div>
        </div>

        <div className="mt-8 flex gap-3">
            <button 
              onClick={() => onOpenChat(selectedClient.id, selectedClient.name)}
              className="flex-1 bg-accent text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg shadow-accent/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} /> Message
            </button>
           <button className="w-16 bg-bg-section text-text-primary py-4 rounded-xl font-bold flex items-center justify-center border border-border/50 hover:bg-border transition-all">
              <MoreVertical size={18} />
           </button>
        </div>
      </motion.div>
    </>
  );
};

export const ClientListPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const clients = useQuery(api.users.getTrainerClients, currentUser ? { trainerId: currentUser.id as any } : "skip");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Chat State
  const [chatUser, setChatUser] = useState<{ id: string; name: string } | null>(null);

  const handleOpenChat = (id: string, name: string) => {
    setChatUser({ id, name });
  };
  
  const filteredClients = (clients || []).filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!clients) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div className="space-y-8 h-full">
        <div>
          <h1 className="page-title mb-2" style={{ fontSize: '2.5rem' }}>My Clients</h1>
          <p className="text-text-secondary font-inter text-sm">Track progress and manage your roster.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-bg-surface p-4 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 bg-bg-section px-4 py-2 rounded-lg w-full md:w-96">
            <Search size={18} className="text-text-light" />
            <input 
              type="text" 
              placeholder="Search clients by name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-inter w-full text-text-primary" 
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-light uppercase tracking-wider">Sort by:</span>
            <select className="bg-transparent text-sm font-bold text-text-primary font-inter outline-none cursor-pointer">
               <option>Consistency</option>
               <option>Total Sessions</option>
               <option>Recently Active</option>
            </select>
            <SortAsc size={16} className="text-accent" />
          </div>
        </div>

        {/* Clients Table */}
        <Card className="overflow-hidden border-border bg-bg-surface" hover={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter">
              <thead className="bg-bg-section/50 text-[10px] uppercase tracking-widest text-text-secondary font-bold">
                <tr>
                  <th className="px-6 py-5">Client</th>
                  <th className="px-6 py-5">Sessions</th>
                  <th className="px-6 py-5">Last Visit</th>
                  <th className="px-6 py-5">Consistency</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20 text-text-secondary italic">No clients found.</td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr 
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className="hover:bg-bg-section transition-all cursor-pointer group"
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <Avatar initials={client.initials} size="md" variant="orange" />
                          <div>
                            <p className="font-bold text-text-primary group-hover:text-accent transition-colors uppercase tracking-tight">{client.name}</p>
                            <p className="text-[10px] text-text-light uppercase tracking-widest">{client.workoutType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm font-bold text-text-primary">
                        {client.sessions}
                      </td>
                      <td className="px-6 py-6 text-sm text-text-secondary font-medium">
                        {client.lastVisit}
                      </td>
                      <td className="px-6 py-6 w-48">
                         <div className="flex items-center gap-3">
                            <ProgressBar value={client.consistency} height="sm" className="flex-1" />
                            <span className="text-xs font-bold text-text-primary w-8">{client.consistency}%</span>
                         </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                         <button className="p-2 text-text-light hover:text-accent transition-colors">
                            <ChevronRight size={20} />
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

      {/* Right Drawer */}
      <AnimatePresence>
        {selectedClientId && (
          <ClientDetailDrawer 
            clientId={selectedClientId} 
            onClose={() => setSelectedClientId(null)} 
            onOpenChat={handleOpenChat}
          />
        )}
      </AnimatePresence>

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
