import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { calculateXP, calculateLevel, calculateConsistency, calculateNextLevelProgress, XP_PER_LEVEL } from '@/lib/gamification';

export function useUserStats() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        level: 1,
        xp: 0,
        consistency: 0,
        loading: true,
        nextLevelXp: XP_PER_LEVEL,
        progressToNextLevel: 0,
        totalTasksCompleted: 0,
        totalHabitsCompleted: 0,
        habits: [] as any[],
        tasks: [] as any[]
    });

    useEffect(() => {
        if (!user || !db) return;

        const habitsRef = collection(db, 'users', user.uid, 'habits');
        const tasksRef = collection(db, 'users', user.uid, 'tasks');

        let habits: any[] = [];
        let tasks: any[] = [];

        const updateStats = () => {
            const xp = calculateXP(tasks, habits);
            const level = calculateLevel(xp);
            const consistency = calculateConsistency(habits);
            const progress = calculateNextLevelProgress(xp);

            const totalTasksCompleted = tasks.filter(t => t.completed).length;
            const totalHabitsCompleted = habits.reduce((acc, h) => acc + (h.completedDates?.length || 0), 0);

            setStats({
                level,
                xp,
                consistency,
                loading: false,
                nextLevelXp: level * XP_PER_LEVEL, // Target XP for *next* level (e.g. if Lvl 1, target is 1000)
                progressToNextLevel: progress,
                totalTasksCompleted,
                totalHabitsCompleted,
                habits,
                tasks
            });
        };

        const unsubscribeHabits = onSnapshot(habitsRef, (snapshot) => {
            habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            updateStats();
        });

        const unsubscribeTasks = onSnapshot(tasksRef, (snapshot) => {
            tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            updateStats();
        });

        return () => {
            unsubscribeHabits();
            unsubscribeTasks();
        };
    }, [user]);

    return stats;
}
