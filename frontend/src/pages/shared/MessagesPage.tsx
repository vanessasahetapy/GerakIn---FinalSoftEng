// === FILE: src/pages/shared/MessagesPage.tsx ===
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Loader2, User } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';
import { ChatModal } from '../../components/chat/ChatModal';
import { Avatar } from '../../components/ui/Avatar';

export const MessagesPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const chatList = useQuery(api.messages.getChatList, currentUser ? { userId: currentUser.id as any } : "skip");
  const [search, setSearch] = useState('');
  const [selectedChat, setSelectedChat] = useState<{ id: string; name: string } | null>(null);

  if (!chatList) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  const filtered = chatList.filter(c => c.user.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title mb-2" style={{ fontSize: '2.5rem' }}>Kotak Pesan</h1>
        <p className="text-text-secondary font-inter text-sm">Kelola percakapan Anda dengan pelatih atau atlet Anda.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 bg-bg-surface px-6 py-4 rounded-2xl border border-border mb-6 shadow-sm">
          <Search size={20} className="text-text-light" />
          <input 
            type="text" 
            placeholder="Cari percakapan..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-inter w-full text-text-primary" 
          />
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-bg-surface/50 rounded-3xl border border-dashed border-border">
              <MessageSquare size={48} className="mx-auto mb-4 text-text-light opacity-20" />
              <p className="text-text-secondary italic">Belum ada percakapan aktif.</p>
            </div>
          ) : (
            filtered.map((chat) => (
              <motion.div
                key={chat.user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedChat({ id: chat.user.id, name: chat.user.name })}
              >
                <Card className="p-5 flex items-center gap-4 cursor-pointer hover:border-accent/40 transition-all group">
                   <div className="relative">
                      <Avatar initials={chat.user.initials} size="lg" variant="orange" />
                      {chat.unread && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-bg-surface flex items-center justify-center">
                           <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        </div>
                      )}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                         <h3 className="font-bold text-text-primary group-hover:text-accent transition-colors truncate">
                           {chat.user.name}
                         </h3>
                         <span className="text-[10px] font-bold text-text-light uppercase tracking-widest whitespace-nowrap">
                           {new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      <p className={`text-sm truncate ${chat.unread ? 'text-white font-bold' : 'text-text-secondary'}`}>
                        {chat.lastMessage}
                      </p>
                   </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedChat && (
          <ChatModal 
            receiverId={selectedChat.id} 
            receiverName={selectedChat.name} 
            onClose={() => setSelectedChat(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
