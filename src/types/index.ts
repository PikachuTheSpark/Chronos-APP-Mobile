export type BlockCategory = 'deep_work' | 'meeting' | 'urgent' | 'recovery' | 'protocol';

export interface TimeBlock {
  id: string;
  title: string;
  category: BlockCategory;
  startTime: string; // "HH:mm" e.g. "09:00"
  endTime: string;   // "HH:mm" e.g. "10:30"
  durationMinutes: number;
  date: string;      // "YYYY-MM-DD"
  completed: boolean;
  notes?: string;
  focusTimeSpent?: number; // seconds spent in active focus
}

export interface HabitProtocol {
  id: string;
  title: string;
  category: BlockCategory;
  streak: number;
  completedDates: string[]; // ISO Date strings "YYYY-MM-DD"
  targetTime?: string;
}

export interface FocusSession {
  id: string;
  blockId?: string;
  blockTitle?: string;
  durationSeconds: number;
  timestamp: number;
  mode: 'pomodoro' | 'stopwatch' | 'countdown';
  category: BlockCategory;
}

export type SoundscapeType = 'none' | 'rain' | 'binaural_gamma' | 'deep_space' | 'cyber_fan';

export interface CategoryMetadata {
  id: BlockCategory;
  label: string;
  color: string;      // Accent hex
  bgTint: string;     // Tailwind or rgba class
  borderColor: string;
  textColor: string;
}

export const CATEGORIES: Record<BlockCategory, CategoryMetadata> = {
  deep_work: {
    id: 'deep_work',
    label: 'Deep Work',
    color: '#6366f1',
    bgTint: 'bg-indigo-950/60',
    borderColor: 'border-indigo-500/40',
    textColor: 'text-indigo-300',
  },
  meeting: {
    id: 'meeting',
    label: 'Sync / Meeting',
    color: '#0ea5e9',
    bgTint: 'bg-sky-950/60',
    borderColor: 'border-sky-500/40',
    textColor: 'text-sky-300',
  },
  urgent: {
    id: 'urgent',
    label: 'Urgent Sprint',
    color: '#f43f5e',
    bgTint: 'bg-rose-950/60',
    borderColor: 'border-rose-500/40',
    textColor: 'text-rose-300',
  },
  recovery: {
    id: 'recovery',
    label: 'Rest & Buffer',
    color: '#f59e0b',
    bgTint: 'bg-amber-950/60',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-300',
  },
  protocol: {
    id: 'protocol',
    label: 'Protocol / Habit',
    color: '#10b981',
    bgTint: 'bg-emerald-950/60',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-300',
  },
};
