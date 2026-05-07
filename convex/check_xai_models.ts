import { action } from './_generated/server';

export const checkModels = action({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.GROQ_API_KEY;
    const url = 'https://api.x.ai/v1/models';

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      });
      const data = await response.json();
      return data;
    } catch (error: any) {
      return { error: error.message || error.toString() };
    }
  },
});
