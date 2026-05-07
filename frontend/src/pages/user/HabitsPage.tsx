// === FILE: src/pages/user/HabitsPage.tsx ===
import React, { useState } from 'react';
import { Zap, Bell, CloudUpload, Loader2, Plus, X, CheckCircle2, MessageSquare, Send, User as UserIcon, Bot } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { useAuthStore } from '../../store/authStore';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { AnimatePresence, motion } from 'framer-motion';

// ── Preset habit suggestions for a fitness/gym coaching app
const HABIT_PRESETS = [
  { title: 'Lari Pagi', emoji: '🏃', color: '#6366f1', frequency: 'daily' as const,   desc: 'Cardio ringan 20–30 menit setiap pagi' },
  { title: 'Push-up 50x', emoji: '💪', color: '#f59e0b', frequency: 'daily' as const,   desc: 'Kekuatan tubuh bagian atas setiap hari' },
  { title: 'Minum 2L Air', emoji: '💧', color: '#38bdf8', frequency: 'daily' as const,   desc: 'Hidrasi optimal untuk performa maksimal' },
  { title: 'Tidur 8 Jam', emoji: '😴', color: '#8b5cf6', frequency: 'daily' as const,   desc: 'Pemulihan otot dan regenerasi sel' },
  { title: 'Latihan Beban', emoji: '🏋️', color: '#ef4444', frequency: 'weekly' as const, desc: '3–4 kali seminggu di gym bersama pelatih' },
  { title: 'Peregangan', emoji: '🧘', color: '#10b981', frequency: 'daily' as const,   desc: 'Fleksibilitas & pencegahan cedera 15 menit' },
  { title: 'Catat Kalori', emoji: '📊', color: '#f97316', frequency: 'daily' as const,   desc: 'Pantau asupan nutrisi harian Anda' },
  { title: 'Sit-up 30x', emoji: '🔥', color: '#ec4899', frequency: 'daily' as const,   desc: 'Core strength dan pembentukan perut' },
];

const FREQ_LABELS: Record<string, string> = {
  daily: 'Setiap Hari',
  weekly: 'Mingguan',
  custom: 'Kustom',
};

interface HabitModalProps {
  onClose: () => void;
  onSave: (title: string, frequency: 'daily' | 'weekly' | 'custom', color: string) => Promise<void>;
}

const HabitModal: React.FC<HabitModalProps> = ({ onClose, onSave }) => {
  const [step, setStep] = useState<'preset' | 'custom'>('preset');
  const [selected, setSelected] = useState<typeof HABIT_PRESETS[0] | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customFreq, setCustomFreq] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [customColor, setCustomColor] = useState('#6366f1');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const COLORS = ['#6366f1','#f59e0b','#38bdf8','#8b5cf6','#ef4444','#10b981','#f97316','#ec4899'];

  const handleSave = async () => {
    const title = step === 'preset' ? selected?.title : customTitle.trim();
    const freq  = step === 'preset' ? (selected?.frequency ?? 'daily') : customFreq;
    const color = step === 'preset' ? (selected?.color ?? '#6366f1') : customColor;
    if (!title) return;
    setSaving(true);
    await onSave(title, freq, color);
    setDone(true);
    setTimeout(onClose, 900);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="bg-bg-surface border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <div>
            <h2 className="font-barlow font-bold text-xl uppercase tracking-tight text-text-primary">
              {done ? '✅ Kebiasaan Ditambahkan!' : 'Tambah Kebiasaan Baru'}
            </h2>
            <p className="text-text-secondary text-xs font-inter mt-0.5">
              {step === 'preset' ? 'Pilih dari template yang disarankan, atau buat sendiri' : 'Sesuaikan kebiasaan Anda'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-bg-base hover:bg-border/50 flex items-center justify-center text-text-light hover:text-text-primary transition-all">
            <X size={16} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <CheckCircle2 size={56} className="text-accent animate-bounce" />
            <p className="text-text-primary font-barlow font-bold text-2xl uppercase">Berhasil disimpan!</p>
          </div>
        ) : (
          <>
            {/* Tab Switch */}
            <div className="flex gap-2 px-8 pt-6">
              <button
                onClick={() => setStep('preset')}
                className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  step === 'preset' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'bg-bg-base text-text-secondary hover:text-text-primary'
                }`}
              >
                Saran Sistem
              </button>
              <button
                onClick={() => setStep('custom')}
                className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  step === 'custom' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'bg-bg-base text-text-secondary hover:text-text-primary'
                }`}
              >
                Buat Sendiri
              </button>
            </div>

            <div className="px-8 py-6">
              {/* PRESET GRID */}
              {step === 'preset' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {HABIT_PRESETS.map((p) => (
                    <button
                      key={p.title}
                      onClick={() => setSelected(p)}
                      className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all group ${
                        selected?.title === p.title
                          ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                          : 'border-border bg-bg-base hover:border-border/80 hover:bg-bg-section'
                      }`}
                    >
                      {selected?.title === p.title && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                          <CheckCircle2 size={10} className="text-white" />
                        </div>
                      )}
                      <span className="text-2xl">{p.emoji}</span>
                      <div>
                        <p className="font-barlow font-bold text-sm text-text-primary uppercase leading-tight">{p.title}</p>
                        <p className="text-[9px] text-text-secondary font-inter mt-0.5 leading-snug opacity-70">{p.desc}</p>
                      </div>
                      <span
                        className="mt-auto text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: p.color + '25', color: p.color }}
                      >
                        {FREQ_LABELS[p.frequency]}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* CUSTOM FORM */}
              {step === 'custom' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Nama Kebiasaan</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Contoh: Plank 1 Menit"
                      maxLength={40}
                      className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 text-text-primary font-inter text-sm outline-none focus:border-accent/60 transition-colors placeholder:text-text-light"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Frekuensi</label>
                    <div className="flex gap-2">
                      {(['daily', 'weekly', 'custom'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setCustomFreq(f)}
                          className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                            customFreq === f
                              ? 'bg-accent/10 border-accent text-accent'
                              : 'bg-bg-base border-border text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {FREQ_LABELS[f]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Warna</label>
                    <div className="flex gap-3">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setCustomColor(c)}
                          className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                          style={{
                            backgroundColor: c,
                            borderColor: customColor === c ? '#ffffff' : 'transparent',
                            boxShadow: customColor === c ? `0 0 0 3px ${c}55` : 'none'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-border bg-bg-base/30">
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary bg-bg-base border border-border transition-all">
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || (step === 'preset' ? !selected : !customTitle.trim())}
                className="px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {saving ? 'Menyimpan...' : 'Simpan Kebiasaan'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

export const HabitsPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  const habits = useQuery(api.habits.getHabits, currentUser ? { userId: currentUser.id as any } : 'skip');
  const intelligence = useQuery(api.analytics.getUserHabitIntelligence, currentUser ? { userId: currentUser.id as any } : 'skip');
  const trainers = useQuery(api.users.getTrainers);

  const getAIRecommendation = useAction(api.ai.getRecommendation);
  const chatWithAI = useAction(api.ai.chat);
  const updateSettings = useMutation(api.analytics.updateUserSettings);
  const createHabit   = useMutation(api.habits.createHabit);
  const runSeed       = useMutation(api.seed.ensureDataIntegrity);

  const handleSeed = async () => {
    if (confirm('Sinkronisasi infrastruktur database dengan data terbaru? (Data Anda tetap aman)')) {
      try {
        await runSeed();
        alert('Berhasil! Integritas data diverifikasi dan database telah diperbarui.');
      } catch {
        alert('Gagal mensinkronisasi data sistem');
      }
    }
  };

  const handleAddHabit = async (title: string, frequency: 'daily' | 'weekly' | 'custom', color: string) => {
    if (!currentUser) return;
    await createHabit({ userId: currentUser.id as any, title, frequency, color });
  };

  const toggleNotifications = () => {
    if (!currentUser || !intelligence) return;
    updateSettings({ userId: currentUser.id as any, notificationsEnabled: !intelligence.notificationsEnabled });
  };

  const toggleAutoBook = () => {
    if (!currentUser || !intelligence) return;
    updateSettings({ userId: currentUser.id as any, autoBookEnabled: !intelligence.autoBookEnabled });
  };
  React.useEffect(() => {
    const fetchAI = async () => {
      if (!currentUser || !habits || !intelligence || !trainers || aiRecommendation) return;
      
      setLoadingAI(true);
      try {
        const recommendation = await getAIRecommendation({ userId: currentUser.id as any });
        setAiRecommendation(recommendation);
      } catch (error) {
        console.error('AI Recommendation Error:', error);
        setAiRecommendation("Tetaplah konsisten! Fokus pada latihan di jam puncak Anda untuk hasil maksimal.");
      } finally {
        setLoadingAI(false);
      }
    };

    fetchAI();
  }, [currentUser, habits, intelligence, trainers, getAIRecommendation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser) return;

    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await chatWithAI({
        userId: currentUser.id as any,
        message: chatInput,
        history: chatMessages
      });
      setChatMessages(prev => [...prev, { role: 'bot', content: response }]);
    } catch (error: any) {
      setChatMessages(prev => [...prev, { role: 'bot', content: `Maaf, terjadi kesalahan koneksi: ${error.message || error.toString()}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!intelligence) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  const { peakHour, peakDays, insights, heatmap, notificationsEnabled, autoBookEnabled, habitScore } = intelligence;

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <HabitModal onClose={() => setShowModal(false)} onSave={handleAddHabit} />
        )}
      </AnimatePresence>

      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="page-title mb-2" style={{ fontSize: '2.5rem' }}>Inteligensi Kebiasaan</h1>
            <p className="text-text-secondary font-inter text-sm">Kuasai rutinitas Anda dengan pelacakan kebiasaan bertenaga AI.</p>
          </div>
          <button
            onClick={handleSeed}
            className="flex items-center gap-2 bg-bg-surface border border-border text-text-secondary px-4 py-2 rounded-xl text-sm font-semibold hover:text-text-primary transition-all shadow-sm"
          >
            <CloudUpload size={16} />
            Sinkronisasi Data
          </button>
        </div>

        {/* Hero Insight Banner */}
        <Card className="bg-bg-surface border border-border p-8 relative overflow-hidden" hover={false}>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent mb-4">
                Analisis perilaku AI
              </div>
              <h2 className="heading-xl uppercase mb-3">
                Performa puncak pada <span className="text-accent">{peakHour}</span>
              </h2>
              <p className="text-text-secondary font-inter max-w-lg leading-relaxed mb-4">
                Sesi paling konsisten Anda terjadi pada hari {peakDays.join(', ')}. Latihan selama waktu ini meningkatkan tingkat keberhasilan kebiasaan Anda secara signifikan.
              </p>
              <div className="bg-accent/5 border border-accent/10 rounded-xl p-4">
                <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Rekomendasi AI Untukmu:</p>
                {loadingAI ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-accent" />
                    <span className="text-xs text-text-secondary italic">Menganalisis pola kebiasaan...</span>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-text-primary font-inter leading-relaxed italic">
                      "{aiRecommendation || "Tetaplah konsisten! Fokus pada latihan di jam puncak Anda untuk hasil maksimal."}"
                    </p>
                    <button 
                      onClick={() => setIsChatOpen(true)}
                      className="shrink-0 flex items-center gap-2 bg-accent text-white px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-accent/20"
                    >
                      <MessageSquare size={14} /> Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="shrink-0">
              <ProgressRing value={habitScore ?? 0} label={(habitScore ?? 0).toString()} sublabel="Skor Kebiasaan" size={140} strokeWidth={8} />
            </div>
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight, i) => {
            const labels: Record<string, string> = {
              'Daily Avg': 'Rata-rata Harian',
              'Completion Rate': 'Tingkat Penyelesaian',
              'Current Streak': 'Sesi Beruntun',
            };
            return (
              <Card key={insight.id} animate delay={i * 0.05} className="flex flex-col items-start p-6 bg-bg-surface">
                <div className="w-10 h-10 rounded-xl bg-bg-base border border-border flex items-center justify-center text-xl mb-4 shadow-inner">
                  {insight.icon}
                </div>
                <p className="text-label mb-1 uppercase tracking-widest opacity-60">{labels[insight.label] || insight.label}</p>
                <p className="font-barlow font-bold text-2xl text-text-primary uppercase tracking-tight">{insight.value}</p>
              </Card>
            );
          })}
        </div>

        {/* Heatmap Section */}
        <Card className="p-8 bg-bg-surface border-border" hover={false}>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1 h-6 bg-accent rounded-full" />
            <h2 className="font-barlow font-bold text-lg uppercase tracking-tight">Peta Panas Konsistensi (90 Hari)</h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {heatmap.map((day, i) => {
              const color = day.count === 0 ? 'bg-bg-base/50' : day.count === 1 ? 'bg-accent/40' : day.count === 2 ? 'bg-accent/70' : 'bg-accent';
              return (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-sm border border-border/10 ${color} transition-all hover:scale-125 cursor-help`}
                  title={`${day.date}: ${day.count} sesi`}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-8 text-[9px] font-bold uppercase tracking-[0.2em] text-text-light opacity-50">
            <span>Rendah</span>
            <div className="flex gap-1.5">
              <div className="w-3.5 h-3.5 bg-bg-base rounded-sm border border-border/10" />
              <div className="w-3.5 h-3.5 bg-accent/40 rounded-sm border border-border/10" />
              <div className="w-3.5 h-3.5 bg-accent/70 rounded-sm border border-border/10" />
              <div className="w-3.5 h-3.5 bg-accent rounded-sm border border-border/10" />
            </div>
            <span>Puncak</span>
          </div>
        </Card>

        {/* Active Habits Section */}
        <div className="flex items-center justify-between section-divider mb-6">
          <h2 className="section-title text-xl tracking-tight">Kebiasaan Aktif Anda</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {habits?.map((habit, i) => (
              <Card key={habit._id} animate delay={i * 0.1} className="p-6 bg-bg-surface border-border relative group">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-light">
                        {FREQ_LABELS[habit.frequency] || habit.frequency}
                      </span>
                    </div>
                    <h3 className="font-barlow font-bold text-xl text-text-primary uppercase leading-tight group-hover:text-accent transition-colors">
                      {habit.title}
                    </h3>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border"
                    style={{ backgroundColor: habit.color + '15', borderColor: habit.color + '30' }}
                  >
                    <Zap size={20} fill={habit.color} color={habit.color} className="opacity-80" />
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <div className="text-[10px] text-text-light uppercase font-bold tracking-wider">
                    Sejak {new Date(habit.createdAt).toLocaleDateString('id-ID')}
                  </div>
                  <button
                    className="text-white px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                    style={{ backgroundColor: habit.color }}
                  >
                    Catat ✓
                  </button>
                </div>
              </Card>
            ))}
          </AnimatePresence>

          {/* Add New Habit Card */}
          <motion.button
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 border-dashed border-2 border-border bg-transparent rounded-2xl flex flex-col items-center justify-center text-text-light cursor-pointer hover:border-accent/50 hover:bg-accent/5 hover:text-accent transition-all group min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Buat Kebiasaan Baru</span>
          </motion.button>
        </div>

        {/* Auto-Book & Notifications */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card accent className="p-8 bg-bg-surface border-border shadow-lg shadow-accent/5">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="font-barlow font-bold text-xl text-text-primary uppercase tracking-tight">Pemesanan Otomatis</h3>
                  <p className="text-xs text-text-secondary font-inter">Sinkronkan sesi ke jam perilaku puncak Anda.</p>
                </div>
              </div>
              <button
                onClick={toggleAutoBook}
                className={`w-14 h-7 rounded-full transition-all duration-300 relative border border-white/10 ${autoBookEnabled ? 'bg-accent' : 'bg-bg-base'}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full shadow-md transition-all duration-300 ${autoBookEnabled ? 'left-8 bg-white' : 'left-1 bg-text-light'}`} />
              </button>
            </div>
          </Card>

          <Card className="p-8 bg-bg-surface border-border">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-bg-base text-text-light flex items-center justify-center border border-border">
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className="font-barlow font-bold text-xl text-text-primary uppercase tracking-tight">Peringatan Pintar</h3>
                  <p className="text-xs text-text-secondary font-inter">Pengingat yang disesuaikan dengan pola aktivitas.</p>
                </div>
              </div>
              <button
                onClick={toggleNotifications}
                className={`w-14 h-7 rounded-full transition-all duration-300 relative border border-white/10 ${notificationsEnabled ? 'bg-accent' : 'bg-bg-base'}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full shadow-md transition-all duration-300 ${notificationsEnabled ? 'left-8 bg-white' : 'left-1 bg-text-light'}`} />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* ── AI CHAT DRAWER ── */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full md:w-[400px] h-full bg-bg-surface border-l border-border z-[100] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-border flex items-center justify-between bg-bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <Zap size={20} />
                </div>
                <div>
                  <h2 className="font-barlow font-bold text-lg uppercase tracking-tight">Asisten GerakIn AI</h2>
                  <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Online & Menganalisis</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="w-10 h-10 rounded-xl bg-bg-base flex items-center justify-center text-text-light hover:text-text-primary transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {chatMessages.length === 0 && (
                <div className="text-center py-12">
                   <div className="w-16 h-16 rounded-full bg-bg-base border border-border flex items-center justify-center mx-auto mb-4">
                      <Bot size={32} className="text-text-light" />
                   </div>
                   <p className="text-text-primary font-barlow font-bold uppercase mb-2">Halo, {currentUser?.name}!</p>
                   <p className="text-xs text-text-secondary max-w-[200px] mx-auto">Tanyakan apapun tentang kebiasaan latihan Anda atau rekomendasi pelatih.</p>
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                     <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white ${msg.role === 'user' ? 'bg-accent' : 'bg-bg-base border border-border text-text-light'}`}>
                        {msg.role === 'user' ? <UserIcon size={14} /> : <Zap size={14} />}
                     </div>
                     <div className={`p-4 rounded-2xl text-sm font-inter leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-accent text-white rounded-tr-none' 
                        : 'bg-bg-base border border-border text-text-primary rounded-tl-none shadow-sm'
                     }`}>
                        {msg.content}
                     </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-bg-base border border-border p-4 rounded-2xl flex gap-1">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-6 border-t border-border bg-bg-surface">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Tanyakan sesuatu..."
                  className="flex-1 bg-bg-base border border-border rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent/50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className="w-12 h-12 bg-accent text-white rounded-xl flex items-center justify-center hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-accent/20"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
