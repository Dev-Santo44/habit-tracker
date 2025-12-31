import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  completedDates: string[]; // ISO date strings
  streak: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: 'routine' | 'task';
  time?: string;
}

interface HabitStore {
  habits: Habit[];
  tasks: Task[];
  addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'streak'>) => void;
  toggleHabit: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: [],
      tasks: [],
      addHabit: (habit) => set((state) => ({
        habits: [...state.habits, { ...habit, id: Math.random().toString(36).substr(2, 9), completedDates: [], streak: 0 }]
      })),
      toggleHabit: (id, date) => set((state) => ({
        habits: state.habits.map((h) => {
          if (h.id === id) {
            const completedDates = h.completedDates.includes(date)
              ? h.completedDates.filter((d) => d !== date)
              : [...h.completedDates, date];
            return { ...h, completedDates };
          }
          return h;
        })
      })),
      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter((h) => h.id !== id)
      })),
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, { ...task, id: Math.random().toString(36).substr(2, 9), completed: false }]
      })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
    }),
    {
      name: 'habit-tracker-storage',
    }
  )
);
