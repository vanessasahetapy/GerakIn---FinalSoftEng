import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // -------------------------------------------------
  // USERS – Pengguna & Trainer
  // -------------------------------------------------
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    passwordHash: v.string(),
    role: v.optional(v.string()),          // user, trainer, admin
    createdAt: v.number(),
    streak: v.optional(v.number()),
    specialty: v.optional(v.string()),
    rating: v.optional(v.number()),
    sessions: v.optional(v.number()),
    rate: v.optional(v.number()),
    bio: v.optional(v.string()),
    notificationsEnabled: v.optional(v.boolean()),
    autoBookEnabled: v.optional(v.boolean()),
    favType: v.optional(v.string()),
    availability: v.optional(
      v.array(
        v.object({ day: v.string(), hour: v.string(), status: v.string() })
      )
    ),
    tags: v.optional(v.array(v.string())),
    weight: v.optional(v.number()),
    height: v.optional(v.number()),
    goals: v.optional(v.string()),
    fitnessLevel: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .index("by_role", ["role"])
    .index("by_streak", ["streak"]),

  // -------------------------------------------------
  // NOTIFICATIONS – Pesan sistem untuk user
  // -------------------------------------------------
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(), // booking_update, goal_reached, system
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // -------------------------------------------------
  // AI_MESSAGES – Riwayat chat asisten AI
  // -------------------------------------------------
  ai_messages: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // -------------------------------------------------
  // MESSAGES – Chat antar pengguna (Trainer <-> User)
  // -------------------------------------------------
  messages: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"])
    .index("by_conversation", ["senderId", "receiverId"]),

  // -------------------------------------------------
  // BOOKINGS – Pemesanan sesi pelatihan
  // -------------------------------------------------
  bookings: defineTable({
    userId: v.id("users"),
    userName: v.string(),
    trainerId: v.id("users"),
    trainerName: v.string(),
    workoutType: v.string(),
    date: v.string(),
    time: v.string(),
    duration: v.number(),
    notes: v.optional(v.string()),
    status: v.union(v.literal("PENDING"), v.literal("ACCEPTED"), v.literal("REJECTED")),
    createdAt: v.number(),
  })
    .index("by_trainer", ["trainerId"])
    .index("by_user", ["userId"]),

  // -------------------------------------------------
  // HABITS – Kebiasaan pengguna
  // -------------------------------------------------
  habits: defineTable({
    userId: v.id("users"),
    title: v.string(),
    frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("custom")),
    color: v.string(),
    createdAt: v.number(),
    customDays: v.optional(v.array(v.number())),
  }).index("by_user", ["userId"]),

  habit_progress: defineTable({
    habitId: v.id("habits"),
    userId: v.id("users"),
    date: v.string(),
    isDone: v.boolean(),
  })
    .index("by_habit_and_date", ["habitId", "date"])
    .index("by_user_and_date", ["userId", "date"]),

  // -------------------------------------------------
  // MOOD LOGS – Catatan suasana hati
  // -------------------------------------------------
  moodLogs: defineTable({
    userId: v.id("users"),
    mood: v.number(),
    note: v.optional(v.string()),
    date: v.string(),
  }).index("by_user_and_date", ["userId", "date"]),

  // -------------------------------------------------
  // APPOINTMENTS – Janji (Metadata Syarat Tugas)
  // -------------------------------------------------
  appointments: defineTable({
    userId: v.id("users"),      // referensi ke atlet/user
    trainerId: v.id("users"),   // referensi ke pelatih/trainer
    userName: v.string(),
    trainerName: v.string(),
    workoutType: v.optional(v.string()),
    date: v.optional(v.string()),
    appointmentTime: v.string(),   // Waktu sesi latihan
    notes: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("canceled")),
    priority: v.union(v.literal("normal"), v.literal("urgent")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_trainer", ["trainerId"])
    .index("by_status", ["status"]),

  // -------------------------------------------------
  // RATINGS – Penilaian untuk pelatih
  // -------------------------------------------------
  ratings: defineTable({
    trainerId: v.id("users"),
    userId: v.id("users"),
    rating: v.number(),      // 1-5
    comment: v.optional(v.string()),
    bookingId: v.optional(v.id("bookings")),
    createdAt: v.number(),
  }).index("by_trainer", ["trainerId"])
    .index("by_booking", ["bookingId"]),
});
