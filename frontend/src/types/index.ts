// === FILE: src/types/index.ts ===
export type Role = 'user' | 'trainer' | 'admin';

export interface Trainer {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  rating: number;
  sessions: number;
  rate: number;
  bio: string;
  avatar?: string;
  tags?: string[];
  availability?: Array<{ day: string; hour: string; status: string }>;
}
