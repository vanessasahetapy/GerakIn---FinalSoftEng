// === FILE: src/pages/LoginPage.tsx ===
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, User, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const QUOTES = [
  { text: "Konsistensi lebih penting daripada kesempurnaan dalam kebugaran.", author: "Marcus Reid, Kepala Pelatih" },
  { text: "Kesehatan Anda adalah investasi, bukan pengeluaran.", author: "Lena Fischer, Pemimpin Wellness" },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, login: setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState(QUOTES[0]);

  const loginMutation = useMutation(api.users.login);
  const portalData = useQuery(api.analytics.getPublicPortalData);

  useEffect(() => {
    setQ(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(`/${role}/dashboard`);
    }
  }, [isAuthenticated, role, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setError('');

    try {
      const user = await loginMutation({ 
        nameOrEmail: email, 
        password: password 
      });

      if (user) {
        setAuth({
          id: user.id as any,
          name: user.name,
          email: user.email,
          role: user.role,
        });
        navigate(`/${user.role}/dashboard`);
      } else {
        setError('Kredensial tidak valid. Periksa nama/kata sandi.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat masuk.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base font-inter flex flex-col md:flex-row overflow-hidden selection:bg-accent/30">
      {/* ── LEFT SIDE: FORM ── */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex flex-col justify-center px-8 md:px-24 py-12 relative z-10"
      >
        <div className="max-w-md w-full mx-auto">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 mb-12 cursor-pointer group w-fit"
          >
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-110 transition-all">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase font-barlow italic text-white group-hover:text-accent transition-colors">Gerak<span className="text-accent">In</span></span>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-black italic uppercase font-barlow tracking-tight text-white mb-2">Masuk ke Sistem</h1>
            <p className="text-text-light opacity-60 text-sm">Masuk ke zona infrastruktur atletik.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-light uppercase tracking-widest ml-1">Identitas UID / Email</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-accent transition-colors" />
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-bg-surface border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-accent/40 outline-none transition-all"
                    placeholder="Masukkan Nama (contoh: Jechris)"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between px-1">
                  <label className="text-[10px] font-bold text-text-light uppercase tracking-widest">Protokol Rahasia</label>
                  <button type="button" className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">Lupa?</button>
                </div>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-accent transition-colors" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-bg-surface border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-accent/40 outline-none transition-all"
                    placeholder="Masukkan Kata Sandi"
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-accent text-white py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-accent/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoggingIn ? 'Mengautentikasi...' : 'Masuk ke Sistem'} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

          </form>

          <p className="mt-8 text-center text-xs text-text-light opacity-60">
            Belum punya akun?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/register')}
              className="text-accent font-bold hover:underline"
            >
              Daftar di sini
            </button>
          </p>

          <p className="mt-12 text-center text-[10px] font-bold text-text-light uppercase tracking-widest opacity-40">
            Sistem Dilindungi oleh GerakIn Security Engine
          </p>
        </div>
      </motion.div>

      {/* ── RIGHT SIDE: QUOTE & STATS ── */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden md:flex flex-1 bg-accent relative flex-col items-center justify-center p-12 text-white"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-sm text-center">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-lg">
            <Zap size={36} className="text-white" fill="white"/>
          </div>
          <blockquote className="font-barlow font-black text-4xl uppercase leading-tight italic tracking-tight mb-6">
            "{q.text}"
          </blockquote>
          <p className="text-white/70 font-inter text-xs font-bold uppercase tracking-widest">— {q.author}</p>
          
          <div className="mt-20 grid grid-cols-3 gap-8 text-center border-t border-white/10 pt-12">
            {[
            {v: portalData?.trainerCount || '180+', l:'Pelatih'},
            {v: portalData?.athleteCount || '2.4K', l:'Pengguna'},
            {v: portalData?.retention || '98%', l:'Keberhasilan'}
            ].map(s=>(
              <div key={s.l}>
                <p className="font-barlow font-black text-3xl italic">{s.v}</p>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
