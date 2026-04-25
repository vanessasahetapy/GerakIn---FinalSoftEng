// === FILE: convex/list_models.ts ===
import { action } from './_generated/server';

export const listModels = action({
  args: {},
  handler: async (ctx) => {
    const apiKey = 'AIzaSyDZP5AMYAfxhMABvRSyYySR7Rc3fr7eRko';
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error: any) {
      return { error: error.message || error.toString() };
    }
  },
});
