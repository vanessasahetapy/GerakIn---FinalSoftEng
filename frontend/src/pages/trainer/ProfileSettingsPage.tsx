// === FILE: src/pages/trainer/ProfileSettingsPage.tsx ===
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, User, Briefcase, DollarSign, Tag, FileText, Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';
import { Toast, useToast } from '../../components/ui/Toast';

export const ProfileSettingsPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { toast, show, hide } = useToast();
  
  const updateProfile = useMutation(api.users.updateTrainerProfile);
  const trainers = useQuery(api.users.getTrainers);
  
  const [isEditing, setIsEditing] = useState(false);
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [rate, setRate] = useState(0);
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (trainers && currentUser) {
      const myData = trainers.find((t: any) => t.id === currentUser.id);
      if (myData) {
        setSpecialty(myData.specialty || '');
        setBio(myData.bio || '');
        setRate(myData.rate || 0);
        if (myData.tags) {
          setTags(myData.tags.join(', '));
        }
      }
    }
  }, [trainers, currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (rate < 0) {
      show('error', 'Hourly rate cannot be negative');
      return;
    }
    
    setSaving(true);
    try {
      await updateProfile({
        trainerId: currentUser.id as any,
        specialty,
        bio,
        rate: Number(rate),
        tags: tags.split(',').map(t => t.trim()).filter(t => t !== '')
      });
      show('success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      show('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black italic uppercase font-barlow tracking-tight text-white mb-2">
            {isEditing ? 'Edit Professional Profile' : 'Professional Profile'}
          </h1>
          <p className="text-text-secondary font-inter text-sm">
            {isEditing ? 'Update your public profile information.' : 'How you appear to athletes on the platform.'}
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="ghost" className="border border-white/10 hover:bg-white/5">
            <Briefcase size={18} className="mr-2 text-accent" /> Edit Professional Info
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div 
            key="view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-3 gap-6">
               <Card className="p-8 border-white/5" hover={false}>
                  <p className="text-[10px] font-bold text-text-light uppercase tracking-[0.2em] mb-4">Specialty</p>
                  <p className="text-xl font-barlow font-black text-white">{specialty || 'Not set'}</p>
               </Card>
               <Card className="p-8 border-white/5" hover={false}>
                  <p className="text-[10px] font-bold text-text-light uppercase tracking-[0.2em] mb-4">Hourly Rate</p>
                  <p className="text-xl font-barlow font-black text-accent">Rp {(rate || 0).toLocaleString()}rb <span className="text-xs text-text-muted">/ hour</span></p>
               </Card>
               <Card className="p-8 border-white/5" hover={false}>
                  <p className="text-[10px] font-bold text-text-light uppercase tracking-[0.2em] mb-4">Expertise Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.split(',').map((t, i) => t.trim() && (
                      <span key={i} className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-text-light border border-white/5">
                        {t.trim()}
                      </span>
                    ))}
                    {!tags && <span className="text-sm italic text-text-muted">None</span>}
                  </div>
               </Card>
            </div>
            
            <Card className="p-10 border-white/5" hover={false}>
              <p className="text-[10px] font-bold text-text-light uppercase tracking-[0.2em] mb-6">Professional Bio</p>
              <p className="text-base text-text-secondary leading-relaxed font-inter whitespace-pre-wrap">
                {bio || 'Please write a bio to introduce yourself to potential clients.'}
              </p>
            </Card>
          </motion.div>
        ) : (
          <motion.form 
            key="edit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSave} 
            className="space-y-8"
          >
            <Card className="p-10 border-white/5 bg-bg-surface/50 backdrop-blur-xl" hover={false}>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Specialty */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-light uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Briefcase size={12} className="text-accent" /> Specialty / Role
                  </label>
                  <input 
                    type="text" 
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Strength & Conditioning Coach"
                    className="w-full bg-bg-base border border-white/10 rounded-xl py-4 px-6 text-sm text-white focus:border-accent/40 outline-none transition-all"
                    required
                  />
                </div>

                {/* Rate */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-light uppercase tracking-widest ml-1 flex items-center gap-2">
                    <DollarSign size={12} className="text-accent" /> Hourly Rate (Rp ...rb)
                  </label>
                  <input 
                    type="number" 
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-bg-base border border-white/10 rounded-xl py-4 px-6 text-sm text-white focus:border-accent/40 outline-none transition-all"
                    required
                  />
                </div>

                {/* Bio */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-text-light uppercase tracking-widest ml-1 flex items-center gap-2">
                    <FileText size={12} className="text-accent" /> Professional Bio
                  </label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell athletes about your experience and training philosophy..."
                    className="w-full h-32 bg-bg-base border border-white/10 rounded-xl py-4 px-6 text-sm text-white focus:border-accent/40 outline-none transition-all resize-none"
                    required
                  />
                </div>

                {/* Tags */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-text-light uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Tag size={12} className="text-accent" /> Expertise Tags (comma separated)
                  </label>
                  <input 
                    type="text" 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="HIIT, Nutrition, Weight Loss, Muscle Gain"
                    className="w-full bg-bg-base border border-white/10 rounded-xl py-4 px-6 text-sm text-white focus:border-accent/40 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mt-12 flex justify-end gap-4">
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button 
                  type="submit"
                  loading={saving}
                  variant="primary"
                  className="min-w-[200px] py-4 bg-accent shadow-xl shadow-accent/20"
                >
                  <Save size={18} className="mr-2" /> Save Changes
                </Button>
              </div>
            </Card>
          </motion.form>
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
