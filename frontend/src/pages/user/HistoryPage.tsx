// === FILE: src/pages/user/HistoryPage.tsx ===
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Loader2, Star, MessageSquare } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';
import { Toast, useToast } from '../../components/ui/Toast';

const FILTERS = ['Semua', 'Strength', 'Cardio', 'Nutrition', 'Consultation', 'Bulking', 'Cutting'];

export const HistoryPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { toast, show, hide } = useToast();
  const bookings = useQuery(api.bookings.getUserBookings, currentUser ? { userId: currentUser.id as any } : "skip");
  const addRating = useMutation(api.ratings.addRating);
  
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Rating Modal State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!bookings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  const handleOpenRating = (booking: any) => {
    setSelectedBooking(booking);
    setRating(5);
    setComment('');
    setRatingModalOpen(true);
  };

  const handleSubmitRating = async () => {
    if (!currentUser || !selectedBooking) return;
    setSubmitting(true);
    try {
      await addRating({
        trainerId: selectedBooking.trainerId,
        userId: currentUser.id as any,
        rating,
        comment: comment.trim() || undefined,
        bookingId: selectedBooking._id
      });
      show('success', 'Rating dikirim! Terima kasih atas feedback-nya.');
      setRatingModalOpen(false);
    } catch (err) {
      console.error(err);
      show('error', 'Gagal mengirim rating');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = activeFilter === 'Semua' || b.workoutType === activeFilter;
    const matchesSearch = b.trainerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.workoutType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const acceptedBookings = bookings.filter(b => b.status === 'ACCEPTED');

  const stats = [
    { label: 'Total Sesi', value: acceptedBookings.length },
    { label: 'Total Jam', value: Math.floor(acceptedBookings.reduce((acc, b) => acc + (b.duration || 60), 0) / 60) },
    { label: 'Pelatih Ditemui', value: new Set(bookings.map(b => b.trainerId)).size },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="page-title mb-2" style={{ fontSize: '2.5rem' }}>Riwayat Latihan</h1>
        <p className="text-text-secondary font-inter text-sm">Tinjau perjalanan Anda dan lacak kemajuan Anda dari waktu ke waktu.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={stat.label} animate delay={i * 0.1} className="p-6">
            <p className="card-label mb-2">{stat.label}</p>
            <p className="font-barlow font-extrabold text-6xl text-accent">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className="overflow-hidden border-border bg-bg-surface" hover={false}>
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={activeFilter === f ? 'pill-active' : 'pill-inactive'}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-bg-section px-3 py-2 rounded-lg border border-border/50 focus-within:border-accent/50 transition-all">
              <Search size={16} className="text-text-light" />
              <input
                type="text"
                placeholder="Cari sesi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-inter w-40 text-text-primary"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-inter">
            <thead className="bg-bg-section/50 text-[10px] uppercase tracking-widest text-text-secondary font-bold">
              <tr>
                <th className="px-6 py-5">Tanggal</th>
                <th className="px-6 py-5">Pelatih</th>
                <th className="px-6 py-5">Tipe</th>
                <th className="px-6 py-5">Durasi</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-text-secondary italic">Tidak ada sesi ditemukan.</td>
                </tr>
              ) : (
                filteredBookings.map((booking, i) => (
                  <motion.tr
                    key={booking._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-bg-section transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-text-primary text-sm">{booking.date}</p>
                      <p className="text-[10px] text-text-light uppercase tracking-tighter">{booking.time}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-text-primary group-hover:text-accent transition-colors uppercase tracking-tight">
                      {booking.trainerName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-1 bg-bg-section rounded-md text-text-secondary border border-border/30 uppercase tracking-wider">
                        {booking.workoutType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text-secondary">
                      {booking.duration || 60} menit
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.status === 'ACCEPTED' && (
                        <button 
                          onClick={() => handleOpenRating(booking)}
                          className="p-2 hover:bg-accent/10 rounded-lg text-accent transition-all flex items-center gap-2 text-xs font-bold ml-auto uppercase tracking-wider"
                        >
                          <Star size={14} className="fill-accent" /> Beri Rating
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rating Modal */}
      <AnimatePresence>
        {ratingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setRatingModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-accent">
                  <Star size={32} className="fill-accent" />
                </div>
                <h2 className="font-barlow font-black text-2xl text-white uppercase italic">Rating Sesi</h2>
                <p className="text-text-secondary text-sm font-inter">Bagaimana pengalaman latihan Anda dengan <strong>{selectedBooking?.trainerName}</strong>?</p>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star 
                        size={32} 
                        className={rating >= star ? 'text-accent fill-accent' : 'text-text-muted'} 
                      />
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-light uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MessageSquare size={12} className="text-accent" /> Ulasan Anda (Opsional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Apa yang Anda sukai dari sesi ini?"
                    className="w-full h-32 bg-bg-base border border-white/10 rounded-xl py-4 px-6 text-sm text-white focus:border-accent/40 outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setRatingModalOpen(false)}>Batal</Button>
                  <Button 
                    variant="primary" 
                    className="flex-1" 
                    onClick={handleSubmitRating}
                    loading={submitting}
                  >
                    Kirim Rating
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Toast 
        visible={toast.visible} 
        type={toast.type} 
        message={toast.message} 
        onClose={hide} 
      />
    </div>
  );
};
