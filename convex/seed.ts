// === FILE: convex/seed.ts ===
import { mutation } from './_generated/server';

export const ensureDataIntegrity = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Maintain the 15 requested users + Admin
    const userNames = [
      "Echris", "Vena", "Larry", "Franklin", "Onco", 
      "Niha", "Inyo", "Josh", "Jay", "Alex", 
      "Daniel", "Muti", "Cheril", "Injil", "Arlan",
      "Budi", "Siti", "Andi", "Dewi", "Rian",
      "Lina", "Agus", "Maya", "Rizky", "Putri"
    ];

    const userIds = [];
    for (const name of userNames) {
      const existing = await ctx.db.query('users').withIndex('by_name', q => q.eq('name', name)).first();
      let uid;
      if (!existing) {
        uid = await ctx.db.insert('users', {
          name,
          email: `${name.toLowerCase()}@fit-habit.com`,
          passwordHash: `${name}123`,
          role: 'user',
          streak: 5 + Math.floor(Math.random() * 10),
          createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        });
      } else {
        uid = existing._id;
        // Patch existing to ensure they have a streak for the demo
        await ctx.db.patch(uid, {
          streak: existing.streak || (5 + Math.floor(Math.random() * 10)),
          role: existing.role || 'user',
        });
      }
      userIds.push(uid);
    }

    // 1.1 Ensure Admin exists
    const adminName = 'Admin';
    const adminExisting = await ctx.db.query('users').withIndex('by_name', q => q.eq('name', adminName)).first();
    if (!adminExisting) {
      await ctx.db.insert('users', {
        name: adminName,
        email: 'admin@fit-habit.com',
        passwordHash: 'Admin123',
        role: 'admin',
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
      });
    }

    // 2. Ensure Trainers are complete
    const trainerData = [
      { name: 'Marcus Reid', specialty: 'Strength', rating: 4.9, sessions: 350, rate: 100, bio: 'NSCA-certified strength coach with 10+ years experience.' },
      { name: 'Sofia Reyes', specialty: 'Cardio',   rating: 4.8, sessions: 290, rate: 90,  bio: 'Endurance and VO2 max expert specializing in HIIT.' },
      { name: 'Jake Torres', specialty: 'Cutting',  rating: 4.7, sessions: 280, rate: 110, bio: 'Body recomposition specialist and nutrition advisor.' },
      { name: 'Elena Vance', specialty: 'Bulking',  rating: 4.9, sessions: 150, rate: 120, bio: 'Science-based hyperthrophy specialist for elite athletes.' },
      { name: 'Sarah Jenkins', specialty: 'Strength', rating: 4.8, sessions: 210, rate: 95, bio: 'Specialist in functional strength and posture correction.' },
      { name: 'David Miller', specialty: 'Bulking', rating: 4.9, sessions: 420, rate: 130, bio: 'Former pro bodybuilder focusing on maximum muscle gain.' },
      { name: 'Chloe Chen', specialty: 'Cardio', rating: 4.7, sessions: 180, rate: 85, bio: 'High-energy instructor for interval and metabolic conditioning.' },
      { name: 'Ryan Cooper', specialty: 'Strength', rating: 4.6, sessions: 310, rate: 105, bio: 'Expert in olympic weightlifting and explosive power.' },
      { name: 'Maya Patel', specialty: 'Cardio', rating: 4.9, sessions: 500, rate: 110, bio: 'Renowned endurance coach with a background in marathons.' },
      { name: 'Thomas Wright', specialty: 'Cutting', rating: 4.8, sessions: 240, rate: 115, bio: 'Boxing and metabolic conditioning for fat loss.' },
      { name: 'Isabella Rossi', specialty: 'Strength', rating: 4.7, sessions: 190, rate: 90, bio: 'Combining calisthenics and traditional strength training.' },
      { name: 'Liam O\'Connor', specialty: 'Bulking', rating: 4.8, sessions: 270, rate: 125, bio: 'Hypertrophy coach focusing on compound movements.' },
      { name: 'Sophia Kim', specialty: 'Cutting', rating: 4.9, sessions: 330, rate: 100, bio: 'Specialist in aesthetic conditioning and diet optimization.' },
      { name: 'Lucas Silva', specialty: 'Cardio', rating: 4.6, sessions: 160, rate: 80, bio: 'Focusing on athletic speed, agility, and stamina.' },
    ];

    const trainers = [];
    for (const t of trainerData) {
      const existing = await ctx.db.query('users').withIndex('by_name', q => q.eq('name', t.name)).first();
      if (!existing) {
        const id = await ctx.db.insert('users', {
          ...t,
          email: `${t.name.toLowerCase().replace(' ', '.')}@fit-habit.com`,
          passwordHash: `${t.name.split(' ')[0]}123`,
          role: 'trainer',
          createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        });
        trainers.push({ _id: id, ...t });
      } else {
        await ctx.db.patch(existing._id, { ...t });
        trainers.push({ ...existing, ...t });
      }
    }

    // 3. Ensure Habits, Progress, and Mood for ALL users
    const habitSets = [
      { title: 'Morning Training', color: '#6366F1', type: 'Strength' },
      { title: 'Hydration 3L', color: '#00A3FF', type: 'Cardio' },
      { title: 'Deep Sleep 8h', color: '#6B00FF', type: 'Recovery' },
      { title: 'High Protein', color: '#F43F5E', type: 'Bulking' },
    ];

    const users = await ctx.db.query('users').filter(q => q.eq(q.field('role'), 'user')).collect();
    
    for (const u of users) {
      // 3.1 Habits
      let userHabits = await ctx.db.query('habits').withIndex('by_user', q => q.eq('userId', u._id)).collect();
      if (userHabits.length === 0) {
        for (const h of habitSets) {
          const hid = await ctx.db.insert('habits', {
            userId: u._id,
            title: h.title,
            color: h.color,
            frequency: 'daily',
            createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
          });
          userHabits.push({ _id: hid, ...h } as any);
        }
      }

      // 3.2 Habit Progress (Ensure 30 days of history)
      const existingProgress = await ctx.db.query('habit_progress').withIndex('by_user_and_date', q => q.eq('userId', u._id)).collect();
      if (existingProgress.length < 90) { // Check for a bit more
        for (const h of userHabits) {
          for (let i = 0; i < 45; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const ds = d.toISOString().split('T')[0];
            const hasProg = existingProgress.find(p => p.habitId === h._id && p.date === ds);
            if (!hasProg && Math.random() > 0.2) { // 80% completion rate for good looks
              await ctx.db.insert('habit_progress', {
                userId: u._id,
                habitId: h._id,
                date: ds,
                isDone: true,
              });
            }
          }
        }
      }

      // 3.3 Mood Logs (New: last 30 days)
      const moodHistory = await ctx.db.query('moodLogs').withIndex('by_user_and_date', q => q.eq('userId', u._id)).collect();
      if (moodHistory.length < 20) {
        for (let i = 0; i < 30; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const ds = d.toISOString().split('T')[0];
          const hasMood = moodHistory.find(m => m.date === ds);
          if (!hasMood) {
            await ctx.db.insert('moodLogs', {
              userId: u._id,
              mood: 3 + Math.floor(Math.random() * 3), // 3-5
              note: ['Feeling strong', 'A bit tired but motivated', 'Sleep was great', 'Killed the workout today'][Math.floor(Math.random() * 4)],
              date: ds,
            });
          }
        }
      }

      // 4. Ensure Diverse Bookings (Vitality Check)
      const userBookings = await ctx.db.query('bookings').withIndex('by_user', q => q.eq('userId', u._id)).collect();
      if (userBookings.length < 10) {
        // Add past sessions with diverse types
        const types = ['Strength', 'Cardio', 'Bulking', 'Cutting'];
        for (let i = 1; i <= 10; i++) {
          const trainer = trainers[i % trainers.length];
          const d = new Date(); d.setDate(d.getDate() - (i * 3));
          
          await ctx.db.insert('bookings', {
            userId: u._id,
            userName: u.name,
            trainerId: trainer._id,
            trainerName: trainer.name,
            workoutType: types[i % types.length],
            date: d.toISOString().split('T')[0],
            time: `${9 + (i % 8)}:00`,
            duration: 60,
            status: i % 7 === 0 ? 'REJECTED' : 'ACCEPTED', // Add some rejected
            createdAt: d.getTime(),
          });
        }
        
        // Add 2-3 pending sessions
        for (let i = 1; i <= 2; i++) {
          const nextDate = new Date(); nextDate.setDate(nextDate.getDate() + (i * 2));
          await ctx.db.insert('bookings', {
            userId: u._id,
            userName: u.name,
            trainerId: trainers[i % trainers.length]._id,
            trainerName: trainers[i % trainers.length].name,
            workoutType: types[i % types.length],
            date: nextDate.toISOString().split('T')[0],
            time: '14:30',
            duration: 60,
            status: 'PENDING',
            createdAt: Date.now(),
          });
        }
      }
    }

    return { message: "System fully populated with users, trainers, admins, habits, progress, and mood logs." };
  },
});

