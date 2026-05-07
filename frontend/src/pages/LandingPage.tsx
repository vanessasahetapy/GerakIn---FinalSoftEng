import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { 
  Zap, ArrowRight, Shield, Activity
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const trainers = useQuery(api.users.getTrainers);
  const portalData = useQuery(api.analytics.getPublicPortalData);
  
  const statsList = [
    { val: portalData?.athleteCount || '15', label: 'Atlet' },
    { val: portalData?.trainerCount || trainers?.length || '3', label: 'Pelatih Elit' },
    { val: portalData?.retention || '98%', label: 'Retensi' },
    { val: portalData?.uptime || '100% Sinkron', label: 'Performa' },
  ];

  return (
    <div className="min-h-screen bg-bg-deep text-text-main font-inter selection:bg-accent/30 selection:text-white overflow-x-hidden bg-mesh scroll-smooth">
      {/* ... navigation code remains same ... */}
      {/* ── NAVIGATION ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-glass backdrop-blur-xl border-b border-border-glass">
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-accent/20">
              <Zap size={24} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-2xl tracking-tighter uppercase font-barlow italic text-white">Gerak<span className="text-accent">In</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {[
              { id: 'features', label: 'Fitur' },
              { id: 'trainers', label: 'Pelatih' },
              { id: 'pricing', label: 'Harga' }
            ].map(item => (
              <a key={item.id} href={`#${item.id}`} className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-soft hover:text-white transition-all">
                {item.label}
              </a>
            ))}
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary py-3 px-8 text-[10px] uppercase tracking-[0.2em]"
            >
              Masuk Sistem
            </button>
          </div>
        </div>
      </nav>

      {/* ... hero and stats sections remain same ... */}
      {/* ── HERO SECTION ── */}
      <section className="relative pt-64 pb-32 px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-accent/20 rounded-full blur-[160px] pointer-events-none opacity-40" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <span className="inline-block px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-12">
              Infrastruktur Performa Elit
            </span>
            <h1 className="heading-xl text-gradient mb-10 max-w-5xl mx-auto font-barlow italic uppercase">
              Latihan dengan Presisi.<br/>
              <span className="text-accent underline decoration-accent/20 underline-offset-8">Membangun Keunggulan.</span>
            </h1>
            <p className="max-w-3xl mx-auto text-text-soft text-xl mb-14 leading-relaxed font-light">
              Masuki masa depan pengembangan performa tinggi. GerakIn menggabungkan pelatihan manusia profesional dengan arsitektur berbasis data untuk mengoptimalkan keberhasilan sesi Anda.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto btn-primary py-6 px-12 text-sm uppercase tracking-[0.3em] group"
              >
                Mulai Evolusi <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#features"
                className="w-full sm:w-auto btn-glass py-6 px-12 text-[10px] uppercase tracking-[0.2em] border border-white/10 flex items-center justify-center"
              >
                Lihat Infrastruktur
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="py-24 border-y border-border-glass bg-white/[0.02] px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
            {statsList.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center lg:items-start"
              >
                <span className="text-5xl font-extrabold text-white font-barlow tracking-tight mb-2 italic">{stat.val}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="py-40 px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-10">
            <div className="max-w-2xl">
              <div className="w-16 h-1.5 bg-accent rounded-full mb-8" />
              <h2 className="heading-lg text-gradient italic uppercase font-barlow">Dibangun untuk 1% Teratas.</h2>
              <p className="text-text-soft mt-6 text-lg font-light leading-relaxed">
                Kami telah menghilangkan kebisingan. Hanya metrik performa inti yang penting bagi keberhasilan kebiasaan harian Anda yang tersisa.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                icon: <Activity className="text-accent" />, 
                title: 'Pelatihan Diagnostik', 
                desc: 'Pelacakan sesi yang presisi dengan loop umpan balik waktu nyata dari pelatih elit Anda.' 
              },
              { 
                icon: <Zap className="text-indigo-400" />, 
                title: 'Arsitektur Atom', 
                desc: 'Desain kebiasaan kustom yang didukung oleh peta panas keberhasilan dan analisis performa puncak.' 
              },
              { 
                icon: <Shield className="text-emerald-400" />, 
                title: 'Kedaulatan Data', 
                desc: 'Keamanan premium untuk metrik kesehatan Anda. Evolusi Anda sangat pribadi.' 
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card group hover:bg-white/[0.06] hover:border-white/20"
              >
                <div className="w-16 h-16 bg-black/20 rounded-2xl flex items-center justify-center mb-10 border border-white/5 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-6 uppercase font-barlow italic tracking-wide">{f.title}</h3>
                <p className="text-text-soft text-sm leading-relaxed font-light">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRAINERS SECTION ── */}
      <section id="trainers" className="py-40 px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="heading-lg text-gradient italic uppercase font-barlow mb-4">Staf Pelatih Elit.</h2>
            <p className="text-text-soft text-lg font-light">Pakar bersertifikat yang didedikasikan untuk evolusi fisik Anda.</p>
          </div>
          
          {trainers && trainers.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-10">
              {trainers.map((t: any, i: number) => (
                <div key={i} className="glass rounded-[2rem] p-10 border border-white/5 hover:border-accent/40 transition-all text-center">
                  <div className="w-24 h-24 bg-accent/20 rounded-full mx-auto mb-8 flex items-center justify-center text-accent text-3xl font-black italic shadow-2xl shadow-accent/10">
                     {t.initials || t.name[0]}
                  </div>
                  <h4 className="text-xl font-bold text-white uppercase font-barlow italic mb-2 tracking-tight">{t.name}</h4>
                  <p className="text-accent text-[10px] font-bold uppercase tracking-[0.2em] mb-6">{t.specialty || 'Pakar Kebugaran'}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                     <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-bold text-text-soft uppercase tracking-widest">⭐ {t.rating || '5.0'}</span>
                     <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-bold text-text-soft uppercase tracking-widest">{t.sessions || '0'} Sesi</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
               <p className="text-text-soft italic text-sm">Belum ada pelatih yang terdaftar dalam sistem.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-40 px-8">
        <div className="max-w-6xl mx-auto glass rounded-[4rem] p-16 md:p-32 text-center relative overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.15)] border-white/10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[140px] pointer-events-none" />
          <h2 className="text-5xl md:text-8xl font-extrabold italic uppercase font-barlow tracking-tighter text-white mb-12 relative z-10 leading-none text-gradient">
            Tulis Ulang<br/>Performa Anda.
          </h2>
          <button 
            onClick={() => navigate('/login')}
            className="btn-primary py-6 px-16 text-sm uppercase tracking-[0.4em] relative z-10 scale-110"
          >
            Buat Akun Anda
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-24 px-8 border-t border-border-glass bg-black/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <Zap size={24} className="text-accent" fill="currentColor" />
              <span className="font-bold text-2xl uppercase font-barlow italic text-white tracking-widest leading-none">Gerak<span className="text-accent">In</span></span>
            </div>
            <p className="text-sm text-text-soft font-light leading-relaxed">
              Membangun konsistensi melalui arsitektur kebiasaan berbasis data. Menempa atlet elit secara global.
            </p>
          </div>
          
          {[
            { title:'Infrastruktur',  items:['Core Engine','Keamanan','Privasi','Log'] },
            { title:'Sumber Daya',       items:['Panduan Performa','Pelatih Elit','Dukungan'] },
            { title:'Legal',           items:['Syarat & Ketentuan','Kebijakan Privasi','Cookie'] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-[10px] font-bold text-white uppercase tracking-[0.4em] mb-10">{col.title}</p>
              <ul className="space-y-5">
                {col.items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[10px] font-bold text-text-soft uppercase tracking-[0.2em] hover:text-white transition-all opacity-40 hover:opacity-100">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-border-glass text-[9px] font-bold text-text-muted uppercase tracking-[0.5em] text-center">
          © 2026 Infrastruktur GerakIn. Dibangun untuk Para Elit.
        </div>
      </footer>
    </div>
  );
};
