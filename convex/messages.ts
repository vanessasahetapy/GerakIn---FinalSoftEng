// === FILE: convex/messages.ts ===
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const sendMessage = mutation({
  args: {
    senderId: v.id('users'),
    receiverId: v.id('users'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert('messages', {
      senderId: args.senderId,
      receiverId: args.receiverId,
      content: args.content,
      isRead: false,
      createdAt: Date.now(),
    });
    return messageId;
  },
});

export const getConversation = query({
  args: {
    userId: v.id('users'),
    otherId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('messages')
      .filter((q) =>
        q.or(
          q.and(q.eq(q.field('senderId'), args.userId), q.eq(q.field('receiverId'), args.otherId)),
          q.and(q.eq(q.field('senderId'), args.otherId), q.eq(q.field('receiverId'), args.userId))
        )
      )
      .collect();

    return messages.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const getChatList = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('messages')
      .filter(q => q.or(
        q.eq(q.field('senderId'), args.userId),
        q.eq(q.field('receiverId'), args.userId)
      ))
      .collect();

    const usersMap = new Map();

    for (const msg of messages) {
      const otherId = msg.senderId === args.userId ? msg.receiverId : msg.senderId;
      const existing = usersMap.get(otherId);
      if (!existing || existing.createdAt < msg.createdAt) {
        usersMap.set(otherId, msg);
      }
    }

    const chatList = [];
    for (const [otherId, lastMsg] of usersMap.entries()) {
      const user = await ctx.db.get(otherId as any);
      if (user && 'name' in user) {
        chatList.push({
          user: {
            id: user._id,
            name: user.name as string,
            initials: (user.name as string).split(' ').map(n => n[0]).join('').toUpperCase(),
          },
          lastMessage: lastMsg.content,
          time: lastMsg.createdAt,
          unread: !lastMsg.isRead && lastMsg.receiverId === args.userId,
        });
      }
    }

    return chatList.sort((a, b) => b.time - a.time);
  },
});
