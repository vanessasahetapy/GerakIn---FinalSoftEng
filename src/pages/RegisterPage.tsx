// === FILE: src/pages/RegisterPage.tsx ===
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, User, Lock, Mail, ArrowRight, Shield, Globe } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const registerMutation = useMutation(api.users.register);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) return;
    
    setIsRegistering(true);
    setError('');

    try {
      await registerMutation({ 
        name,
        email, 
        password 
      });
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat mendaftar.');
    } finally {
      setIsRegistering(false);
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
            <h1 className="text-4xl font-black italic uppercase font-barlow tracking-tight text-white mb-2">Daftar Akun</h1>
            <p className="text-text-light opacity-60 text-sm">Bergabunglah dengan infrastruktur atletik kami.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-light uppercase tracking-widest ml-1">Nama Lengkap</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-accent transition-colors" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-bg-surface border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-accent/40 outline-none transition-all"
                    placeholder="Masukkan Nama Anda"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-light uppercase tracking-widest ml-1">Email</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-accent transition-colors" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-bg-surface border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-accent/40 outline-none transition-all"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-light uppercase tracking-widest ml-1">Kata Sandi</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-accent transition-colors" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-bg-surface border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-accent/40 outline-none transition-all"
                    placeholder="Buat Kata Sandi"
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isRegistering}
              className="w-full bg-accent text-white py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-accent/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isRegistering ? 'Mendaftarkan...' : 'Daftar Sekarang'} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="mt-8 text-center text-xs text-text-light opacity-60">
              Sudah punya akun?{' '}
              <button 
                type="button" 
                onClick={() => navigate('/login')}
                className="text-accent font-bold hover:underline"
              >
                Masuk di sini
              </button>
            </p>
          </form>

          <p className="mt-12 text-center text-[10px] font-bold text-text-light uppercase tracking-widest opacity-40">
            Sistem Dilindungi oleh GerakIn Security Engine
          </p>
        </div>
      </motion.div>

      {/* ── RIGHT SIDE ── */}
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
          <h2 className="font-barlow font-black text-5xl uppercase leading-tight italic tracking-tight mb-6">
            Mulai Evolusi Anda.
          </h2>
          <p className="text-white/80 font-inter text-sm leading-relaxed mb-10">
            Dapatkan akses penuh ke pelatih elit dan sistem pelacakan kebiasaan tercanggih.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
