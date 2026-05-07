// === FILE: src/pages/trainer/AvailabilityPage.tsx ===
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Check, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';
import { Toast, useToast } from '../../components/ui/Toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00',
               '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];

export const AvailabilityPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const dbAvailability = useQuery(api.trainers.getAvailability, currentUser ? { trainerId: currentUser.id as any } : "skip");
  const updateAvailability = useMutation(api.trainers.updateAvailability);
  
  const { toast, show, hide } = useToast();
  const [localAvailability, setLocalAvailability] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dbAvailability) {
      setLocalAvailability(dbAvailability);
    }
  }, [dbAvailability]);

  const toggleSlot = (day: string, hour: string) => {
    setLocalAvailability(prev => {
      const exists = prev.find(s => s.day === day && s.hour === hour);
      if (exists) {
        return prev.filter(s => !(s.day === day && s.hour === hour));
      }
      return [...prev, { day, hour, status: 'available' }];
    });
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await updateAvailability({
        trainerId: currentUser.id as any,
        availability: localAvailability
      });
      show('success', 'Availability saved successfully!');
    } catch (err) {
      show('error', 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  if (dbAvailability === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="page-title mb-2" style={{ fontSize: '2.5rem' }}>Set Availability</h1>
          <p className="text-text-secondary font-inter text-sm">Click time slots to toggle your working hours.</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-border bg-bg-surface" hover={false}>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-8 bg-bg-section/50 border-b border-border">
              <div className="p-4 border-r border-border" />
              {DAYS.map(day => (
                <div key={day} className="p-4 text-center border-r border-border last:border-0">
                  <p className="font-barlow font-bold text-lg text-text-primary uppercase">{day}</p>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="divide-y divide-border">
              {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-8 group">
                  <div className="p-3 flex items-center justify-center border-r border-border bg-bg-section/30">
                    <span className="font-inter font-bold text-xs text-text-light">{hour}</span>
                  </div>
                  {DAYS.map(day => {
                    const isAvailable = localAvailability.find(s => s.day === day && s.hour === hour);
                    return (
                      <button
                        key={`${day}-${hour}`}
                        onClick={() => toggleSlot(day, hour)}
                        className={`p-3 h-14 border-r border-border last:border-0 transition-all relative overflow-hidden group/slot ${
                          isAvailable ? 'bg-accent/10' : 'hover:bg-bg-section'
                        }`}
                      >
                        {isAvailable && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
                               <Check size={16} strokeWidth={3} />
                            </div>
                          </motion.div>
                        )}
                        {!isAvailable && (
                          <div className="opacity-0 group-hover/slot:opacity-100 flex items-center justify-center h-full">
                            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Open</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Sticky Bottom Bar - Updated to Dark Theme */}
      <div className="fixed bottom-0 left-64 right-0 bg-bg-surface/80 backdrop-blur-xl border-t border-white/5 p-6 px-10 flex justify-between items-center z-40 shadow-[0_-8px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md bg-accent shadow-lg shadow-accent/20" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80">Available</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md bg-white/5 border border-white/10" />
            <span className="text-[10px] font-bold text-text-light uppercase tracking-widest opacity-40">Unavailable</span>
          </div>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleSave} 
          loading={saving}
          className="min-w-[240px] py-4 justify-center shadow-2xl shadow-accent/40 bg-accent hover:bg-accent/90 transition-all active:scale-[0.98]"
        >
          <Save size={18} /> <span className="ml-2 font-black italic uppercase tracking-widest text-xs">Save Changes</span>
        </Button>
      </div>

      <Toast 
        visible={toast.visible} 
        type={toast.type} 
        message={toast.message} 
        onClose={hide} 
      />
    </div>
  );
};
