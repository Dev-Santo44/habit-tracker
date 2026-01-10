export interface GamificationStats {
    level: number;
    xp: number;
    nextLevelXp: number;
    consistency: number;
    activityLevel: number;
}

export const XP_PER_TASK = 10;
export const XP_PER_HABIT = 5;
export const XP_PER_LEVEL = 1000;

export const calculateXP = (tasks: any[], habits: any[]): number => {
    const taskXp = tasks.filter((t) => t.completed).length * XP_PER_TASK;
    const habitXp = habits.reduce((acc, h) => acc + (h.completedDates?.length || 0), 0) * XP_PER_HABIT;
    return taskXp + habitXp;
};

export const calculateLevel = (xp: number) => {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
};

export const calculateConsistency = (habits: any[]): number => {
    if (!habits.length) return 0;
    // Simple consistency: Average completion rate over last 7 days?
    // For now, let's keep it simple: Total habit completions / (Total Habits * Days Active) - overly complex for now.
    // Using the "Sync" metric from dashboard: Completed Today / Total Habits * 100
    // But for profile, maybe "Consistency" is an all-time metric?
    // Let's use: (Total Completions / (Habits Count * 30)) * 100 (Assumed 30 day window for simple "monthly consistency")
    // Or simpler: Just a random-ish high number for positive reinforcement if they are active, or
    // actually calculate it based on completed vs theoretical max if we tracked creation date.

    // Let's stick to the heuristic from the previous plan or a robust one:
    // We'll calculate "Habit Strength": (Total Completions / (Habits * 10)) capped at 100 for now, 
    // effectively saying "Have you done 10 reps of each habit?"

    const totalCompletions = habits.reduce((acc, h) => acc + (h.completedDates?.length || 0), 0);
    if (totalCompletions === 0) return 0;

    // Alternative: Average streak?
    // Let's return a placeholder calculation that feels "alive"
    const totalHabits = habits.length;
    if (totalHabits === 0) return 0;

    // Arbitrary metric: Average 5 completions per habit = 100% "Consistency" for early users
    return Math.min(Math.round((totalCompletions / (totalHabits * 5)) * 100), 100);
};

export const calculateNextLevelProgress = (xp: number) => {
    const currentLevelXp = calculateLevel(xp) * XP_PER_LEVEL; // XP needed for next level (upper bound of current level effectively? No.)
    // Level 1: 0-999. Level 2: 1000-1999.
    // Level = Floor(XP/1000) + 1. 
    // XP for Level 1 start = 0.
    // XP for Level 2 start = 1000.

    // XP into current level = XP % 1000
    return (xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;
}
