// === FILE: convex/bookings.ts ===
import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

export const getTrainerBookings = query({
  args: { trainerId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('bookings')
      .withIndex('by_trainer', (q) => q.eq('trainerId', args.trainerId))
      .collect();
  },
});

export const getUserBookings = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('bookings')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
  },
});

export const updateStatus = mutation({
  args: { 
    id: v.id('bookings'), 
    status: v.union(v.literal('ACCEPTED'), v.literal('REJECTED')) 
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.id);
    if (!booking) throw new Error("Booking not found");

    await ctx.db.patch(args.id, { status: args.status });

    // 1. Create Notification for User
    await ctx.db.insert('notifications', {
      userId: booking.userId,
      title: args.status === 'ACCEPTED' ? 'Booking Disetujui!' : 'Booking Ditolak',
      message: args.status === 'ACCEPTED' 
        ? `Sesi ${booking.workoutType} Anda dengan ${booking.trainerName} telah disetujui.`
        : `Maaf, sesi ${booking.workoutType} Anda dengan ${booking.trainerName} belum bisa diterima saat ini.`,
      type: 'booking_update',
      isRead: false,
      createdAt: Date.now(),
    });

    // 2. Sync to Appointments on ACCEPTED
    if (args.status === 'ACCEPTED') {
      await ctx.db.insert('appointments', {
        userId: booking.userId,
        trainerId: booking.trainerId,
        userName: booking.userName,
        trainerName: booking.trainerName,
        workoutType: booking.workoutType,
        date: booking.date,
        appointmentTime: `${booking.date} @ ${booking.time}`,
        notes: booking.notes,
        status: 'pending',
        priority: 'normal',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const createBooking = mutation({
  args: {
    userId: v.id('users'),
    userName: v.string(),
    trainerId: v.id('users'),
    trainerName: v.string(),
    workoutType: v.string(),
    date: v.string(),
    time: v.string(),
    duration: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const bookingId = await ctx.db.insert('bookings', {
      ...args,
      status: 'PENDING',
      createdAt: Date.now(),
    });

    // Send notification to trainer
    await ctx.db.insert('notifications', {
      userId: args.trainerId,
      title: 'Pesanan Sesi Baru!',
      message: `${args.userName} telah memesan sesi ${args.workoutType} pada ${args.date} pukul ${args.time}.`,
      type: 'booking_request',
      isRead: false,
      createdAt: Date.now(),
    });

    return bookingId;
  },
});
