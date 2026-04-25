// === FILE: convex/users.ts ===
import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();
    
    if (existingUser) {
      throw new Error('User with this name already exists');
    }

    const userId = await ctx.db.insert('users', {
      name: args.name,
      email: args.email,
      passwordHash: args.password, // In a real app, use hashing!
      role: 'user',
      createdAt: Date.now(),
      streak: 0,
    });

    return userId;
  },
});

export const login = mutation({
  args: { 
    nameOrEmail: v.string(), 
    password: v.string() 
  },
  handler: async (ctx, args) => {
    let user = await ctx.db
      .query('users')
      .withIndex('by_name', (q) => q.eq('name', args.nameOrEmail))
      .first();

    if (!user) {
      user = await ctx.db
        .query('users')
        .filter((q) => q.eq(q.field('email'), args.nameOrEmail))
        .first();
    }

    if (!user) return null;

    if (user.passwordHash === args.password) {
      return {
        id: user._id,
        name: user.name,
        email: user.email || '',
        role: (user.role as 'user' | 'trainer' | 'admin') || 'user',
        streak: user.streak || 0,
        rating: user.rating,
        specialty: user.specialty,
      };
    }

    return null;
  },
});

export const getTrainers = query({
  args: {},
  handler: async (ctx) => {
    const trainers = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('role'), 'trainer'))
      .collect();
    
    return trainers.map(t => ({
      id: t._id,
      name: t.name,
      specialty: t.specialty,
      rating: t.rating,
      rate: t.rate,
      bio: t.bio,
      sessions: t.sessions,
      initials: t.name.split(' ').map(n => n[0]).join('')
    }));
  },
});

export const getTrainerClients = query({
  args: { trainerId: v.id('users') },
  handler: async (ctx, args) => {
    // Find all accepted bookings for this trainer
    const bookings = await ctx.db
      .query('bookings')
      .filter((q) => 
        q.and(
          q.eq(q.field('trainerId'), args.trainerId),
          q.eq(q.field('status'), 'ACCEPTED')
        )
      )
      .collect();
    
    const userIds = Array.from(new Set(bookings.map(b => b.userId)));
    
    const clients = [];
    for (const userId of userIds) {
      const user = await ctx.db.get(userId as any);
      if (user && 'name' in user) {
        const clientBookings = bookings.filter(b => b.userId === userId);
        const name = user.name as string;
        clients.push({
          id: user._id,
          name: name,
          initials: name.split(' ').map((n: string) => n[0]).join(''),
          sessions: clientBookings.length,
          lastVisit: clientBookings[clientBookings.length - 1]?.date || 'None',
          workoutType: clientBookings[clientBookings.length - 1]?.workoutType || 'N/A',
          consistency: Math.min(100, (clientBookings.length * 15)),
        });
      }
    }
    
    return clients;
  },
});
