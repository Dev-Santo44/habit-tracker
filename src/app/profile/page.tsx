'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useUserStats } from '@/hooks/useUserStats';
import { XP_PER_LEVEL } from '@/lib/gamification';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ActivityCanvas from '@/components/ActivityCanvas';
import Navigation from '@/components/Navigation';
import {
    User,
    Shield,
    Trophy,
    Settings,
    Zap,
    Star,
    Flame,
    CheckCircle2,
    Bell,
    Palette,
    Eye,
    Activity,
    LogOut
} from 'lucide-react';

export default function ProfilePage() {
    const [mounted, setMounted] = useState(false);
    const [showBlobs, setShowBlobs] = useState(true);
    const [showParticles, setShowParticles] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const { user, loading: authLoading, logout } = useAuth();
    const { level, xp, consistency, progressToNextLevel, totalHabitsCompleted, totalTasksCompleted, nextLevelXp } = useUserStats();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/auth');
    };

    const achievements = [
        { id: 1, name: 'Consistency King', icon: Flame, color: '#f472b6', description: 'Maintained excellent habit consistency.', unlocked: consistency > 80 },
        { id: 2, name: 'Task Master', icon: CheckCircle2, color: '#8b5cf6', description: 'Completed 100 total tasks.', unlocked: totalTasksCompleted >= 100 },
        { id: 3, name: 'Habit Hero', icon: Star, color: '#fbbf24', description: 'Completed 50 habit repetitions.', unlocked: totalHabitsCompleted >= 50 },
        { id: 4, name: 'Legendary', icon: Zap, color: '#2dd4bf', description: 'Reached Level 10.', unlocked: level >= 10 },
    ];

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !authLoading && !user) {
            router.push('/auth');
        }
    }, [mounted, authLoading, user, router]);

    useEffect(() => {
        if (!user || !db) return;

        const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
        const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.showBlobs !== undefined) setShowBlobs(data.showBlobs);
                if (data.showParticles !== undefined) setShowParticles(data.showParticles);
                if (data.notificationsEnabled !== undefined) setNotificationsEnabled(data.notificationsEnabled);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const toggleSetting = async (key: string, value: boolean) => {
        if (!user || !db) return;
        const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
        try {
            await setDoc(settingsRef, { [key]: value }, { merge: true });
        } catch (error) {
            console.error('Failed to update settings:', error);
        }
    };

    if (!mounted || authLoading) return null;
    if (!user) return null;

    return (
        <main className="min-h-screen relative bg-background text-foreground p-4 md:p-8 lg:p-12 selection:bg-primary/30">
            {/* Dynamic Background */}
            <div className="fixed inset-0 bg-gradient-mesh opacity-50 pointer-events-none" />

            {/* Animated Blobs (Toggleable) */}
            <AnimatePresence>
                {showBlobs && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 overflow-hidden pointer-events-none -z-10"
                    >
                        <div className="blob top-[-10%] left-[-10%] bg-primary/20" />
                        <div className="blob top-[60%] right-[-5%] bg-secondary/20 animation-delay-2000" style={{ animationDuration: '30s' }} />
                        <div className="blob bottom-[-10%] left-[20%] bg-accent/20 animation-delay-5000" style={{ animationDuration: '35s' }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pass dynamic activity level primarily based on consistency/recent activity logic if more complex, 
                for now using a derived value or simple static visual enhancement based on level? 
                Let's use consistency / 100 for visual flare. */}
            <ActivityCanvas activityLevel={consistency / 100} />

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                <Navigation />

                {/* Profile Header */}
                <section className="flex flex-col md:flex-row items-center gap-8 md:gap-12 py-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] bg-linear-to-br from-primary via-secondary to-accent p-1 shadow-2xl shadow-primary/30 rotate-3">
                            <div className="w-full h-full bg-slate-950 rounded-[2.3rem] flex items-center justify-center -rotate-3 overflow-hidden">
                                <User className="w-16 h-16 md:w-24 md:h-24 text-white/20" />
                                {/* Future: User Image */}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-accent text-slate-950 p-3 rounded-2xl shadow-xl rotate-12">
                            <Shield className="w-6 h-6" />
                        </div>
                    </motion.div>

                    <div className="text-center md:text-left space-y-4">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-2">
                                {user.displayName || 'Commander'} <span className="text-primary text-3xl">Lvl {level}</span>
                            </h1>
                            <p className="text-slate-400 text-xl font-medium max-w-xl">
                                {user.email} • Optimizing the self, one habit at a time.
                            </p>
                        </motion.div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <span className="px-5 py-2 glass border-white/5 rounded-full text-xs font-bold uppercase tracking-widest text-primary">Initiated: {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Unknown'}</span>
                            <span className="px-5 py-2 glass border-white/5 rounded-full text-xs font-bold uppercase tracking-widest text-accent">Consistency: {consistency}%</span>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                    {/* Achievements Grid */}
                    <section className="lg:col-span-2 space-y-8">
                        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-4">
                            <Trophy className="w-8 h-8 text-secondary" />
                            Achievements
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {achievements.map((ach) => (
                                <motion.div
                                    key={ach.id}
                                    whileHover={{ y: -5 }}
                                    className={cn(
                                        "glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden group",
                                        !ach.unlocked && "opacity-50 grayscale"
                                    )}
                                >
                                    {!ach.unlocked && (
                                        <div className="absolute inset-0 flex items-center justify-center z-20">
                                            <Shield className="w-12 h-12 text-slate-600 opacity-50" />
                                        </div>
                                    )}
                                    <div className="space-y-6">
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                                            style={{ background: ach.color }}
                                        >
                                            <ach.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black mb-1">{ach.name}</h3>
                                            <p className="text-slate-400 text-sm font-medium">{ach.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                        {/* Current Level Progress Card */}
                        <div className="glass p-8 rounded-[2rem] bg-linear-to-br from-primary/10 via-transparent to-accent/5 border-white/5 relative overflow-hidden">
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none block mb-2">Current Rank</span>
                                    <div className="flex items-baseline gap-3">
                                        <h3 className="text-4xl font-black text-white leading-none">Level {level}</h3>
                                        <span className="text-lg font-medium text-slate-400">
                                            {level < 5 ? 'Novice' : level < 10 ? 'Adept' : level < 20 ? 'Expert' : 'Master'}
                                        </span> 
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none block mb-2">Next Milestone</span>
                                    <h3 className="text-2xl font-bold text-primary opacity-80 leading-none">Level {level + 1}</h3>
                                </div>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                                    <span className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-primary" />
                                        Progress
                                    </span>
                                    <span>{Math.round(progressToNextLevel)}%</span>
                                </div>
                                <div className="h-6 bg-slate-900/50 rounded-full overflow-hidden p-1 border border-white/5 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressToNextLevel}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full rounded-full bg-linear-to-r from-primary to-accent shadow-[0_0_20px_rgba(139,92,246,0.3)] relative"
                                    >
                                        <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent" />
                                    </motion.div>
                                </div>
                                <div className="flex justify-between text-sm font-medium pt-1">
                                    <span className="text-slate-300 font-bold">{Math.floor(xp % XP_PER_LEVEL)} <span className="text-slate-500 font-normal">XP Earned</span></span>
                                    <span className="text-slate-500">{XP_PER_LEVEL - Math.floor(xp % XP_PER_LEVEL)} XP required</span>
                                </div>
                            </div>
                        </div>
                    {/* Quick Settings & Prefs */}
                    <section className="space-y-8">
                        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-4">
                            <Settings className="w-8 h-8 text-accent" />
                            Settings
                        </h2>
                        <div className="glass rounded-[2rem] p-8 space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Interface</h3>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                            <Palette className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-sm">Background Blobs</span>
                                    </div>
                                    <button
                                        onClick={() => toggleSetting('showBlobs', !showBlobs)}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-colors relative",
                                            showBlobs ? "bg-primary" : "bg-slate-800"
                                        )}
                                    >
                                        <motion.div
                                            animate={{ x: showBlobs ? 24 : 4 }}
                                            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                                            <Eye className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-sm">Particle Effects</span>
                                    </div>
                                    <button
                                        onClick={() => toggleSetting('showParticles', !showParticles)}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-colors relative",
                                            showParticles ? "bg-primary" : "bg-slate-800"
                                        )}
                                    >
                                        <motion.div
                                            animate={{ x: showParticles ? 24 : 4 }}
                                            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 space-y-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Notifications</h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-sm">Daily Reminders</span>
                                    </div>
                                    <button
                                        onClick={() => toggleSetting('notificationsEnabled', !notificationsEnabled)}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-colors relative",
                                            notificationsEnabled ? "bg-secondary" : "bg-slate-800"
                                        )}
                                    >
                                        <motion.div
                                            animate={{ x: notificationsEnabled ? 24 : 4 }}
                                            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                                        />
                                    </button>
                                </div>
                            </div>

                            <button className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all border border-white/5 text-slate-400">
                                Export Experience Data
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full py-5 bg-red-500/10 hover:bg-red-500/20 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all border border-red-500/20 text-red-400 flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>

                        {/* Current Level Progress Card */}
                        
                    </section>
                </div>
            </div >
        </main >
    );
}

