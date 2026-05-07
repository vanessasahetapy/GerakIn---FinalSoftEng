// === FILE: src/pages/user/AICoachPage.tsx ===
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Zap, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { useAction, useQuery } from 'convex/react';
import ReactMarkdown from 'react-markdown';
import { api } from '../../../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AICoachPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const chatAction = useAction(api.ai.chat);
  const dbHistory = useQuery(api.ai.getChatHistory, currentUser ? { userId: currentUser.id as any } : "skip");
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dbHistory, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentUser) return;

    const userMsg = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      await chatAction({
        userId: currentUser.id as any,
        message: userMsg
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const messages = dbHistory || [
    { role: 'assistant', content: 'Halo! Saya AI Coach GerakIn. Ada yang bisa saya bantu dengan program latihan atau kebiasaan sehatmu hari ini?' }
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
            <BrainCircuit size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic uppercase font-barlow tracking-tight text-white leading-none">AI Virtual Coach</h1>
            <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">Ditenagai oleh Groq Llama 3.3</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
          <Sparkles size={14} className="text-accent animate-pulse" />
          <span className="text-[10px] font-bold text-text-light uppercase tracking-widest">Saran Personal Aktif</span>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col p-0 overflow-hidden border-white/5 bg-bg-surface/30 backdrop-blur-xl" hover={false}>
        {/* Messages area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-hide"
        >
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border ${
                msg.role === 'assistant' 
                ? 'bg-accent/20 border-accent/30 text-accent' 
                : 'bg-white/5 border-white/10 text-white'
              }`}>
                {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className={`max-w-[85%] p-5 rounded-2xl text-base leading-relaxed ${
                msg.role === 'assistant' 
                ? 'bg-white/10 text-gray-100 border border-white/10 shadow-xl shadow-black/20' 
                : 'bg-accent text-white shadow-lg shadow-accent/20 font-medium'
              }`}>
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-white prose-strong:font-black">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0s' }} />
                 <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0.2s' }} />
                 <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input area */}
        <div className="p-6 md:p-8 bg-black/20 border-t border-white/5">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya pelatih AI tentang latihanmu..."
              disabled={isLoading}
              className="w-full bg-bg-base border border-white/10 rounded-2xl py-5 pl-6 pr-16 text-sm text-white focus:border-accent/40 outline-none transition-all placeholder:text-text-light/30"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-accent text-white rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="flex justify-center mt-4">
             <p className="text-[10px] font-bold text-text-light opacity-30 uppercase tracking-[0.3em]">AI GerakIn menggunakan data kebiasaanmu untuk saran yang presisi</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
