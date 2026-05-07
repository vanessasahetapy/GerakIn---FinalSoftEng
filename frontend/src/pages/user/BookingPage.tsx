// === FILE: src/pages/user/BookingPage.tsx ===
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { CheckCircle, Loader2 } from 'lucide-react';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { TrainerCard } from '../../components/booking/TrainerCard';
import { TimeSlotGrid } from '../../components/booking/TimeSlotGrid';
import { WeekCalendar } from '../../components/booking/WeekCalendar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';

const STEPS = ['Pilih Pelatih', 'Detail Sesi', 'Konfirmasi'];
const TYPES = ['Strength', 'Cardio', 'Nutrition', 'Consultation', 'Bulking', 'Cutting'];
const FILTERS = ['Semua', 'Cardio', 'Strength', 'Nutrition', 'Consultation', 'Bulking', 'Cutting'];

export const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const trainers = useQuery(api.users.getTrainers);
  const createBooking = useMutation(api.bookings.createBooking);

  const [step, setStep] = useState(1);
  const [filter, setFilter] = useState('Semua');
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [workoutType, setWorkoutType] = useState('Strength');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bookings = useQuery(api.bookings.getTrainerBookings, selectedTrainerId ? { trainerId: selectedTrainerId as any } : "skip");

  const unavailableSlots = bookings
    ? bookings
        .filter(b => b.date === selectedDate && b.status !== 'REJECTED')
        .map(b => b.time)
    : [];

  const filtered = filter === 'Semua' 
    ? (trainers || []) 
    : (trainers || []).filter(t => (t.specialty || '').includes(filter) || (t.tags || []).includes(filter));
    
  const selectedTrainer = trainers?.find(t => t.id === selectedTrainerId);

  const handleConfirm = async () => {
    if (!selectedTrainer || !currentUser) return;
    setIsSubmitting(true);
    try {
      await createBooking({
        userId: currentUser.id as any,
        userName: currentUser.name,
        trainerId: selectedTrainer.id as any,
        trainerName: selectedTrainer.name,
        workoutType: workoutType,
        date: selectedDate,
        time: selectedTime,
        duration: 60,
        notes: notes.trim() || undefined
      });
      setConfirmed(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedTrainerId(null);
    setSelectedDate('');
    setSelectedTime('');
    setNotes('');
    setConfirmed(false);
  };

  if (!trainers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} className="text-center max-w-md">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-white"/>
          </div>
          <h2 className="font-barlow font-extrabold text-3xl text-text-primary uppercase mb-2">Pemesanan Berhasil!</h2>
          <p className="text-text-secondary font-inter mb-4">Sesi Anda dengan <strong>{selectedTrainer?.name}</strong> pada tanggal <strong>{selectedDate}</strong> pukul <strong>{selectedTime}</strong> sedang menunggu konfirmasi.</p>
          <Badge status="PENDING" className="mb-6"/>
          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={handleReset}>Pesan Lagi</Button>
            <Button variant="ghost"   onClick={() => navigate('/user/schedule')}>Lihat Jadwal</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title mb-2" style={{fontSize:'2.5rem'}}>Pesan Sesi</h1>
        <p className="text-text-secondary font-inter text-sm">Ikuti langkah-langkah untuk memesan pelatih Anda.</p>
      </div>

      <StepIndicator steps={STEPS} current={step} />

      <AnimatePresence mode="wait">
        {/* STEP 1 */}
        {step === 1 && (
          <motion.div key="step1" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
            <div className="flex flex-wrap gap-2 mb-6">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={filter===f ? 'pill-active' : 'pill-inactive'}>{f}</button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(t => (
                <TrainerCard 
                  key={t.id} 
                  trainer={t as any}
                  selected={selectedTrainerId === t.id}
                  onSelect={(tr: any) => setSelectedTrainerId(tr.id)} 
                />
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <Button disabled={!selectedTrainerId} onClick={() => setStep(2)}>
                Lanjut →
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 2 */}
        {step === 2 && selectedTrainer && (
          <motion.div key="step2" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}
            className="grid lg:grid-cols-3 gap-6">
            <Card accent className="lg:col-span-1 h-fit">
              <p className="card-label mb-3">Pelatih Terpilih</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-white font-barlow font-bold text-lg uppercase">
                  {selectedTrainer.name?.charAt(0) || 'T'}
                </div>
                <div>
                  <p className="font-barlow font-bold text-lg text-text-primary">{selectedTrainer.name}</p>
                  <p className="text-xs text-accent font-semibold">{selectedTrainer.specialty || 'Professional Coach'}</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary mb-4 line-clamp-3">{selectedTrainer.bio || 'Pelatih berpengalaman siap membantumu.'}</p>
              <p className="font-barlow font-extrabold text-2xl text-accent">Rp {(selectedTrainer.rate || 0).toLocaleString()}rb<span className="text-sm font-inter font-normal text-text-light">/jam</span></p>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <Card hover={false} className="p-8 border-white/5 bg-bg-surface/50">
                <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4">Langkah 1: Jenis Sesi</p>
                <div className="flex flex-wrap gap-3 mb-10">
                  {TYPES.map(t => (
                    <button 
                      key={t} 
                      onClick={() => setWorkoutType(t)}
                      className={clsx(
                        'px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 border',
                        workoutType === t 
                          ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20 scale-105' 
                          : 'bg-white/5 border-white/10 text-text-secondary hover:border-white/20 hover:text-white'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4">Langkah 2: Pilih Tanggal</p>
                <WeekCalendar selectedDate={selectedDate} onSelect={d => setSelectedDate(d)} />
                
                <div className="mt-10">
                  <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4">Langkah 3: Tujuan Sesi (Opsional)</p>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tuliskan detail apa yang ingin dikonsultasikan atau target spesifikmu..."
                    className="w-full h-24 bg-bg-base border border-white/10 rounded-xl py-4 px-6 text-sm text-white focus:border-accent/40 outline-none transition-all resize-none placeholder:text-white/20"
                  />
                </div>
              </Card>
              {selectedDate && (
                <Card hover={false}>
                  <p className="card-label mb-4">Langkah 4: Pilih Waktu</p>
                  <TimeSlotGrid 
                    selectedTime={selectedTime} 
                    onSelect={t => setSelectedTime(t)} 
                    unavailable={unavailableSlots}
                  />
                </Card>
              )}
            </div>

            <div className="lg:col-span-3 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>← Kembali</Button>
              <Button disabled={!selectedDate || !selectedTime} onClick={() => setStep(3)}>
                Tinjau Pesanan →
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3 */}
        {step === 3 && selectedTrainer && (
          <motion.div key="step3" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}
            className="max-w-lg mx-auto space-y-6">
            <Card accent>
              <h2 className="font-barlow font-bold text-2xl text-text-primary uppercase mb-6">Ringkasan Pemesanan</h2>
              <div className="space-y-4 text-sm font-inter">
                {[
                  { l:'Pelatih',      v: selectedTrainer.name    },
                  { l:'Spesialisasi',  v: selectedTrainer.specialty},
                  { l:'Jenis Latihan', v: workoutType },
                  { l:'Tanggal',      v: selectedDate      },
                  { l:'Waktu',        v: selectedTime      },
                  { l:'Durasi',       v: '60 menit'             },
                  { l:'Tarif',        v: `Rp ${(selectedTrainer.rate || 0).toLocaleString()}rb/jam` },
                  ...(notes ? [{ l:'Tujuan Sesi', v: notes }] : []),
                ].map(row => (
                  <div key={row.l} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-text-secondary">{row.l}</span>
                    <span className="font-semibold text-text-primary">{row.v}</span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 justify-center">← Kembali</Button>
              <Button onClick={handleConfirm} disabled={isSubmitting} className="flex-1 justify-center" size="lg">
                {isSubmitting ? 'Mengonfirmasi...' : 'Konfirmasi Pesanan ✓'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
