// === FILE: convex/test_ai.ts ===
import { action } from './_generated/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const testGemini = action({
  args: {},
  handler: async (ctx) => {
    try {
      const genAI = new GoogleGenerativeAI('AIzaSyDZP5AMYAfxhMABvRSyYySR7Rc3fr7eRko');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent("Hello, respond with 'OK' if you can hear me.");
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      return `Error: ${error.message || error.toString()}`;
    }
  },
});
