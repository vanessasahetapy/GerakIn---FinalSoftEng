// === FILE: src/components/chat/ChatModal.tsx ===
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Loader2, User } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';

interface ChatModalProps {
  receiverId: string;
  receiverName: string;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ receiverId, receiverName, onClose }) => {
  const { currentUser } = useAuthStore();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.messages.getConversation, 
    currentUser ? { userId: currentUser.id as any, otherId: receiverId as any } : "skip"
  );
  
  const sendMessage = useMutation(api.messages.sendMessage);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;

    const currentText = text;
    setText('');
    try {
      await sendMessage({
        senderId: currentUser.id as any,
        receiverId: receiverId as any,
        content: currentText,
      });
    } catch (err) {
      console.error(err);
      setText(currentText);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="relative w-full max-w-lg bg-bg-surface border-t sm:border border-white/10 sm:rounded-3xl h-[85vh] sm:h-[600px] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-4">
            <Avatar initials={receiverName.charAt(0)} variant="orange" size="md" />
            <div>
              <h3 className="font-barlow font-bold text-lg text-white uppercase tracking-tight leading-none">{receiverName}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-text-light uppercase tracking-widest">Online</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-text-light hover:text-white transition-colors bg-white/5 rounded-xl">
            <X size={20} />
          </button>
        </div>

        {/* Messages Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-gradient-to-b from-transparent to-white/5">
          {!messages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-accent" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
              <MessageSquare size={48} className="mb-4" />
              <p className="text-sm italic">Belum ada percakapan. Mulai sapa {receiverName}!</p>
            </div>
          ) : (
            messages.map((msg: any) => {
              const isMe = msg.senderId === currentUser?.id;
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm font-inter leading-relaxed ${
                      isMe 
                        ? 'bg-accent text-white rounded-tr-none shadow-lg shadow-accent/20' 
                        : 'bg-bg-section text-text-primary rounded-tl-none border border-white/5'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[9px] font-bold text-text-light mt-1.5 uppercase tracking-widest px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-6 bg-white/5 border-t border-white/5">
          <div className="relative flex items-center gap-3">
             <input 
               type="text"
               value={text}
               onChange={(e) => setText(e.target.value)}
               placeholder="Tulis pesan..."
               className="flex-1 bg-bg-base border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-accent/40 outline-none transition-all pr-14 shadow-inner"
             />
             <button 
               type="submit"
               disabled={!text.trim()}
               className="absolute right-2 p-2.5 bg-accent text-white rounded-xl shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
             >
               <Send size={18} />
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const MessageSquare = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
