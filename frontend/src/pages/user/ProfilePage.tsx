import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, User, Ruler, Weight, Target, Activity, Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';
import { Toast, useToast } from '../../components/ui/Toast';
import { clsx } from 'clsx';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { toast, show, hide } = useToast();
  
  const user = useQuery(api.users.getUserById, currentUser ? { id: currentUser.id as any } : "skip");
  const updateProfile = useMutation(api.users.updateUserProfile);
  
  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [goals, setGoals] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('Beginner');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setWeight(user.weight || '');
      setHeight(user.height || '');
      setGoals(user.goals || '');
      setFitnessLevel(user.fitnessLevel || 'Beginner');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validation
    if (weight !== '' && (weight <= 0 || weight > 500)) {
      show('error', 'Please enter a valid weight (20 - 500 kg)');
      return;
    }
    if (height !== '' && (height <= 0 || height > 300)) {
      show('error', 'Please enter a valid height (50 - 300 cm)');
      return;
    }
    
    setSaving(true);
    try {
      await updateProfile({
        userId: currentUser.id as any,
        weight: weight === '' ? undefined : Number(weight),
        height: height === '' ? undefined : Number(height),
        goals: goals.trim(),
        fitnessLevel
      });
      show('success', 'Profile updated successfully!');
      setIsEditing(false); // Switch back to view mode
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
            {isEditing ? 'Edit Athlete Profile' : 'My Athlete Profile'}
          </h1>
          <p className="text-text-secondary font-inter text-sm">
            {isEditing ? 'Update your metrics for better AI coaching.' : 'Your personal fitness metrics and goals.'}
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="ghost" className="border border-white/10 hover:bg-white/5">
            <Activity size={18} className="mr-2 text-accent" /> Edit Profile
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
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Metric Cards */}
            {[
              { label: 'Weight', value: `${weight || '—'} kg`, icon: <Weight size={24} />, color: 'bg-blue-500/10 text-blue-400' },
              { label: 'Height', value: `${height || '—'} cm`, icon: <Ruler size={24} />, color: 'bg-purple-500/10 text-purple-400' },
              { label: 'Fitness Level', value: fitnessLevel, icon: <Activity size={24} />, color: 'bg-green-500/10 text-green-400' },
              { label: 'Primary Goal', value: goals || 'Not set yet', icon: <Target size={24} />, color: 'bg-accent/10 text-accent', full: true },
            ].map((item, i) => (
              <Card key={i} className={clsx("p-8 flex items-center gap-6 border-white/5", item.full && "md:col-span-2")} hover={false}>
                <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0", item.color)}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-light uppercase tracking-[0.2em] mb-1">{item.label}</p>
                  <p className="text-2xl font-barlow font-black text-white">{item.value}</p>
                </div>
              </Card>
            ))}
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
                {/* Weight */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-light uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Weight size={12} className="text-accent" /> Weight (kg)
                  </label>
                  <input 
                    type="number" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-bg-base border border-white/10 rounded-xl py-4 px-6 text-sm text-white focus:border-accent/40 outline-none transition-all"
                  />
                </div>

                {/* Height */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-light uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Ruler size={12} className="text-accent" /> Height (cm)
                  </label>
                  <input 
                    type="number" 
                    value={height}
                    onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-bg-base border border-white/10 rounded-xl py-4 px-6 text-sm text-white focus:border-accent/40 outline-none transition-all"
                  />
                </div>

                {/* Fitness Level */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-light uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Activity size={12} className="text-accent" /> Fitness Level
                  </label>
                  <select 
                    value={fitnessLevel}
                    onChange={(e) => setFitnessLevel(e.target.value)}
                    className="w-full bg-bg-base border border-white/10 rounded-xl py-4 px-6 text-sm text-white focus:border-accent/40 outline-none transition-all appearance-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Elite">Elite / Pro</option>
                  </select>
                </div>

                {/* Goals */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-text-light uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Target size={12} className="text-accent" /> Fitness Goals
                  </label>
                  <textarea 
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    className="w-full h-32 bg-bg-base border border-white/10 rounded-xl py-4 px-6 text-sm text-white focus:border-accent/40 outline-none transition-all resize-none"
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
