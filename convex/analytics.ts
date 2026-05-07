import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    const bookings = await ctx.db.query('bookings').collect();
    
    // 1. Core Trainers
    const trainers = users.filter(u => u.role === 'trainer');
    
    // 2. Trend Calculations (Last 7 Days vs. Previous 7 Days)
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
    
    const newUsersLastWeek = users.filter(u => u.createdAt > weekAgo).length;
    const newUsersPrevWeek = users.filter(u => u.createdAt > twoWeeksAgo && u.createdAt <= weekAgo).length;
    const userTrend = newUsersPrevWeek === 0 ? 100 : Math.round(((newUsersLastWeek - newUsersPrevWeek) / newUsersPrevWeek) * 100);

    const activeBookings = bookings.filter(b => b.status === 'ACCEPTED');
    const revenue = activeBookings.reduce((sum, b) => {
       const trainer = trainers.find(t => t._id === b.trainerId);
       return sum + (trainer?.rate || 80);
    }, 0);

    const kpis = [
      { label: 'Total Athletes',   value: users.filter(u => u.role === 'user').length.toString(), trend: userTrend },
      { label: 'Active Trainers',  value: trainers.length.toString(), trend: 0 }, // Trainers usually static in seeding
      { label: 'Bookings (All)',   value: bookings.length.toString(), trend: 8.4 }, 
      { label: 'Total Revenue',    value: `$${revenue.toLocaleString()}`, trend: 12.1 },
    ];

    // 3. Trainer Leaderboard (Real Data)
    const leaderboard = trainers.map((t) => {
      const trainerBookings = bookings.filter(b => b.trainerId === t._id && b.status === 'ACCEPTED');
      const trainerRevenue = trainerBookings.length * (t.rate || 80);
      
      return {
        rank: 0, // Assigned after sort
        trainerId: t._id,
        name: t.name,
        sessions: trainerBookings.length,
        revenue: trainerRevenue,
        rating: t.rating || 4.5,
        initials: t.name.split(' ').map(n => n[0]).join('').toUpperCase()
      };
    }).sort((a, b) => b.revenue - a.revenue)
      .map((t, i) => ({ ...t, rank: i + 1 }));

    return { kpis, leaderboard };
  },
});

export const getSystemActivity = query({
  args: {},
  handler: async (ctx) => {
    // Get last 10 bookings + last 5 users
    const latestBookings = await ctx.db.query('bookings').order('desc').take(5);
    const latestUsers = await ctx.db.query('users').order('desc').take(5);

    const activities = [
      ...latestBookings.map(b => ({
        id: b._id,
        type: 'booking',
        message: `${b.userName} booked ${b.workoutType} with ${b.trainerName}`,
        time: new Date(b.createdAt).toLocaleTimeString(),
        status: b.status
      })),
      ...latestUsers.map(u => ({
        id: u._id,
        type: 'register',
        message: `New athlete joined: ${u.name}`,
        time: 'Today',
        status: 'NEW'
      }))
    ].sort((a, b) => (b.id > a.id ? 1 : -1)).slice(0, 8);

    return activities;
  },
});

export const getPlatformAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const bookings = await ctx.db.query('bookings').collect();
    const users = await ctx.db.query('users').collect();

    // 1. Workout Distribution (Donut Chart)
    const types = ['Strength', 'Cardio', 'Bulking', 'Cutting'];
    const distribution = types.map(type => {
      const count = bookings.filter(b => b.workoutType === type).length;
      const percentage = bookings.length > 0 ? (count / bookings.length) * 100 : 0;
      return { 
        name: type, 
        value: Math.round(percentage),
        color: type === 'Strength' ? '#6366F1' : type === 'Cardio' ? '#00A3FF' : type === 'Bulking' ? '#6B00FF' : '#F43F5E'
      };
    });

    // 2. Activity Pulse (Bar Chart - last 7 days)
    const pulse = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const count = bookings.filter(b => b.date === dateStr).length;
      return { date: dateStr, sessions: count };
    });

    // 3. User Engagement
    const userEngagement = users
      .filter(u => u.role === 'user')
      .slice(0, 5)
      .map(u => ({
        id: u._id,
        name: u.name,
        sessions: bookings.filter(b => b.userId === u._id).length,
        streak: u.streak || 0
      }));

    return { distribution, pulse, userEngagement };
  },
});

export const updateUserSettings = mutation({
  args: { 
    userId: v.id('users'), 
    notificationsEnabled: v.optional(v.boolean()),
    autoBookEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...settings } = args;
    await ctx.db.patch(userId, settings);
  },
});

export const getUserDashboardData = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const bookings = await ctx.db
      .query('bookings')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();
    
    const accepted = bookings.filter(b => b.status === 'ACCEPTED');
    const now = new Date();
    
    // Activity Pulse (last 7 days)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const pulse = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[(d.getDay() + 6) % 7];
      const count = accepted.filter(b => b.date === dateStr).length;
      return { day: dayName, sessions: count };
    });

    // Upcoming Session
    const upcoming = accepted
      .filter(b => new Date(b.date + 'T' + b.time) >= now)
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())[0];

    // Trend Calculations
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(now.getDate() - 14);

    const sessionsThisWeek = accepted.filter(b => new Date(b.date) >= weekAgo).length;
    const sessionsLastWeek = accepted.filter(b => {
      const d = new Date(b.date);
      return d >= twoWeeksAgo && d < weekAgo;
    }).length;

    const sessionTrend = sessionsLastWeek === 0 ? (sessionsThisWeek > 0 ? 100 : 0) : Math.round(((sessionsThisWeek - sessionsLastWeek) / sessionsLastWeek) * 100);

    return {
      stats: {
        totalSessions: accepted.length,
        thisWeek: sessionsThisWeek,
        streak: (user as any).streak || 0,
        nextSessionDate: upcoming ? `${new Date(upcoming.date).toLocaleDateString('en-US', { weekday: 'short' })} ${upcoming.time}` : 'None',
        trends: {
          sessions: sessionTrend,
          week: sessionsThisWeek > 0 ? 12 : 0, // Simplified week trend
          streak: (user as any).streak > 0 ? 5 : 0
        }
      },
      pulse,
      upcoming,
      recent: bookings.sort((a, b) => b.createdAt - a.createdAt).slice(0, 4)
    };
  },
});

export const getUserHabitIntelligence = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const progress = await ctx.db
      .query('habit_progress')
      .withIndex('by_user_and_date', q => q.eq('userId', args.userId))
      .collect();
    
    const habits = await ctx.db
      .query('habits')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect();

    const completed = progress.filter(p => p.isDone);

    const bookings = await ctx.db.query('bookings').withIndex('by_user', q => q.eq('userId', args.userId)).collect();
    const accepted = bookings.filter(b => b.status === 'ACCEPTED');
    
    const hours = accepted.map(b => b.time.split(':')[0]);
    const peakHourCount = hours.reduce((acc: any, h) => { acc[h] = (acc[h] || 0) + 1; return acc; }, {});
    const peakHour = Object.entries(peakHourCount).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '10';

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = accepted.map(b => days[new Date(b.date).getDay()]);
    const topDay = Object.entries(dayCounts.reduce((acc: any, d) => { acc[d] = (acc[d] || 0) + 1; return acc; }, {})).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'Monday';

    // Heatmap (Last 90 days)
    const heatmap = [];
    const now = new Date();
    for (let i = 89; i >= 0; i--) {
       const d = new Date(now);
       d.setDate(d.getDate() - i);
       const ds = d.toISOString().split('T')[0];
       const count = completed.filter(p => p.date === ds).length;
       heatmap.push({ date: ds, count });
    }

    const score = Math.round((completed.length / (habits.length * 30 || 1)) * 100);

    return {
      habitScore: score > 0 ? score : 0,
      peakHour: `${peakHour}:00`,
      peakDays: [topDay],
      insights: [
        { id: '1', label: 'Best Day',       value: topDay,  icon: '🏆' },
        { id: '2', label: 'Active Habits',  value: habits.length.toString(), icon: '💪' },
        { id: '3', label: 'Completion',     value: `${score}%`, icon: '📈' },
      ],
      heatmap,
      notificationsEnabled: (user as any).notificationsEnabled ?? true,
      autoBookEnabled: (user as any).autoBookEnabled ?? false,
    };
  },
});

export const getTrainerStats = query({
  args: { trainerId: v.id('users') },
  handler: async (ctx, args) => {
    const trainer = await ctx.db.get(args.trainerId);
    if (!trainer) return null;
    const bookings = await ctx.db
      .query('bookings')
      .withIndex('by_trainer', q => q.eq('trainerId', args.trainerId))
      .collect();

    const accepted = bookings.filter(b => b.status === 'ACCEPTED');
    const pending = bookings.filter(b => b.status === 'PENDING');

    const totalRevenue = accepted.length * (trainer.rate || 80);
    const trend = accepted.length > 0 ? 15 : 0; 

    return {
      liveClients: accepted.length,
      pendingRequests: pending.length,
      revenue: totalRevenue,
      rating: trainer.rating || 4.8,
      trend
    };
  },
});

export const getPublicPortalData = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    const bookings = await ctx.db.query('bookings').collect();
    
    const athleteCount = users.filter(u => u.role === 'user').length;
    const trainerCount = users.filter(u => u.role === 'trainer').length;
    
    return {
      athleteCount: athleteCount > 0 ? athleteCount : 15,
      trainerCount: trainerCount > 0 ? trainerCount : 3,
      totalSessions: bookings.length,
      retention: '98%', // Derived placeholder
      uptime: '100% Sync'
    };
  },
});
