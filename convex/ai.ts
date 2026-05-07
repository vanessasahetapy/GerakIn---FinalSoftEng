import { v } from 'convex/values';
import { action, query, mutation } from './_generated/server';
import { api } from './_generated/api';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

async function callGroq(systemPrompt: string, userMessage: string, history: any[] = []) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []).map(h => ({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: h.content
    })),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }
  throw new Error("Respon kosong dari Groq.");
}

export const getRecommendation = action({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const habits = await ctx.runQuery(api.habits.getHabits, { userId: args.userId });
    const intelligence = await ctx.runQuery(api.analytics.getUserHabitIntelligence, { userId: args.userId });
    const trainers = await ctx.runQuery(api.users.getTrainers);

    if (!habits || !intelligence || !trainers) return "Data tidak cukup untuk analisis.";

    const systemPrompt = `Anda adalah pelatih kebugaran profesional dari GerakIn. 
    Berdasarkan data:
    - Kebiasaan: [${habits.map(h => h.title).join(', ')}]
    - Jam Puncak: ${intelligence.peakHour}
    - Pelatih Tersedia: [${trainers.map(t => t.name).join(', ')}]
    
    Tugas: Berikan 1 langkah konkret berikutnya dan 1 rekomendasi pelatih yang cocok.
    Format: Maksimal 3 kalimat, Bahasa Indonesia.`;

    try {
      return await callGroq(systemPrompt, "Berikan rekomendasi kebugaran saya hari ini.");
    } catch (error: any) {
      console.error('Groq Recommendation Error:', error);
      return `Kesalahan AI (Groq): ${error.message}`;
    }
  },
});

export const getChatHistory = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('ai_messages')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('asc')
      .collect();
  },
});

export const saveChatMessage = mutation({
  args: {
    userId: v.id('users'),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('ai_messages', {
      userId: args.userId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const chat = action({
  args: {
    userId: v.id('users'),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getUserById, { id: args.userId });
    const habits = await ctx.runQuery(api.habits.getHabits, { userId: args.userId });
    const intelligence = await ctx.runQuery(api.analytics.getUserHabitIntelligence, { userId: args.userId });
    const trainers = await ctx.runQuery(api.users.getTrainers);
    const history = await ctx.runQuery(api.ai.getChatHistory, { userId: args.userId });

    // Save user message
    await ctx.runMutation(api.ai.saveChatMessage, {
      userId: args.userId,
      role: 'user',
      content: args.message
    });

    const habitList = habits?.map(h => h.title).join(', ') || 'Belum ada kebiasaan.';
    const trainerList = trainers?.map(t => `${t.name} (Spesialis: ${t.specialty})`).join(', ') || 'Tidak ada pelatih tersedia.';
    
    const userContext = user ? `
    Data Fisik User:
    - Berat: ${user.weight || '?'} kg
    - Tinggi: ${user.height || '?'} cm
    - Goals: ${user.goals || 'Belum diatur'}
    - Level Fitness: ${user.fitnessLevel || 'Beginner'}
    ` : '';

    const systemPrompt = `Anda adalah asisten AI kebugaran dari GerakIn. 
    Konteks User:
    ${userContext}
    - Kebiasaan: [${habitList}]
    - Performa Puncak: [Jam: ${intelligence?.peakHour}, Hari: ${intelligence?.peakDays.join(', ')}]
    - Pelatih Tersedia: [${trainerList}]
    
    Jawablah dengan ramah, memotivasi, dan gunakan data di atas (terutama Goals user) untuk saran personal dalam Bahasa Indonesia.`;

    try {
      const response = await callGroq(systemPrompt, args.message, history || []);
      
      // Save assistant response
      await ctx.runMutation(api.ai.saveChatMessage, {
        userId: args.userId,
        role: 'assistant',
        content: response
      });

      return response;
    } catch (error: any) {
      console.error('Groq Chat Error:', error);
      return `Kesalahan Chat (Groq): ${error.message}`;
    }
  },
});
