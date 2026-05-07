// === FILE: convex/ratings.ts ===
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const addRating = mutation({
  args: {
    trainerId: v.id('users'),
    userId: v.id('users'),
    rating: v.number(),
    comment: v.optional(v.string()),
    bookingId: v.optional(v.id('bookings')),
  },
  handler: async (ctx, args) => {
    // 1. Insert new rating
    await ctx.db.insert('ratings', {
      trainerId: args.trainerId,
      userId: args.userId,
      rating: args.rating,
      comment: args.comment,
      bookingId: args.bookingId,
      createdAt: Date.now(),
    });

    // 2. Recalculate average rating for the trainer
    const allRatings = await ctx.db
      .query('ratings')
      .withIndex('by_trainer', (q) => q.eq('trainerId', args.trainerId))
      .collect();
    
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    
    // 3. Update trainer's profile
    await ctx.db.patch(args.trainerId, {
      rating: Number(avgRating.toFixed(1)),
      sessions: allRatings.length // Optionally use ratings count as session count proxy
    });

    return { success: true };
  },
});

export const getTrainerRatings = query({
  args: { trainerId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('ratings')
      .withIndex('by_trainer', (q) => q.eq('trainerId', args.trainerId))
      .order('desc')
      .collect();
  },
});
