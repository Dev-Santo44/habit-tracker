'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useUserStats } from '@/hooks/useUserStats';
import { useRouter } from 'next/navigation';
import ActivityCanvas from '@/components/ActivityCanvas';
import Navigation from '@/components/Navigation';
import {
    TrendingUp,
    Zap,
    Star
} from 'lucide-react';

export default function AnalysisPage() {
    const [mounted, setMounted] = useState(false);

    // Use the central hook for data
    const {
        habits,
        tasks,
        consistency,
        totalHabitsCompleted,
        totalTasksCompleted,
        loading: statsLoading
    } = useUserStats();

    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !authLoading && !user) {
            router.push('/auth');
        }
    }, [mounted, authLoading, user, router]);

    // Derived metrics for chart
    const getDayCompletions = () => {
        const counts: Record<string, number> = {};

        // Count habit completions
        habits.forEach(h => {
            h.completedDates?.forEach((d: string) => {
                const dayName = new Date(d).toLocaleDateString('en-US', { weekday: 'long' });
                counts[dayName] = (counts[dayName] || 0) + 1;
            });
        });

        // Count task completions? 
        // Tasks have a 'dueDate' but we don't strictly track *when* they were checked off in this simple model, 
        // usually we assume they are completed on their due date or today. 
        // For now, let's stick to habit trends for the "Weekly Distribution" to match the description "habit completion frequency".

        return counts;
    };

    const dayCounts = getDayCompletions();
    const sortedDays = Object.entries(dayCounts).sort((a, b) => b[1] - a[1]);
    const peakDay = sortedDays[0]?.[0] || 'TBD';

    const lifetimeTranscendences = totalHabitsCompleted + totalTasksCompleted;

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    if (!mounted || authLoading || statsLoading) return null;

    return (
        <main className="min-h-screen relative bg-background text-foreground p-4 md:p-8 lg:p-12 selection:bg-primary/30">
            <div className="fixed inset-0 bg-gradient-mesh opacity-50 pointer-events-none" />
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="blob top-[-10%] left-[-10%] bg-primary/20" />
                <div className="blob top-[60%] right-[-5%] bg-secondary/20" style={{ animationDuration: '30s' }} />
                <div className="blob bottom-[-10%] left-[20%] bg-accent/20" style={{ animationDuration: '35s' }} />
            </div>

            <ActivityCanvas activityLevel={consistency / 100} />

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                <Navigation />

                <header className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight">Your <span className="text-gradient">Potential,</span> visualized.</h1>
                    <p className="text-slate-400 text-xl font-medium max-w-2xl">A deep dive into your behavior patterns and long-term consistency.</p>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Peak Activity Card */}
                    <motion.div whileHover={{ scale: 1.02 }} className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all" />
                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                                <Star className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Peak Performance Day</span>
                                <h3 className="text-3xl font-black text-accent">{peakDay}s</h3>
                            </div>
                            <p className="text-slate-400 text-sm font-medium">You are most synchronized with your objectives on {peakDay}s.</p>
                        </div>
                    </motion.div>

                    {/* Consistency Card */}
                    <motion.div whileHover={{ scale: 1.02 }} className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Consistency Index</span>
                                <h3 className="text-3xl font-black text-primary">{consistency}%</h3>
                            </div>
                            <p className="text-slate-400 text-sm font-medium">Global habit completion rate calculated across all active objectives.</p>
                        </div>
                    </motion.div>

                    {/* Total Completions */}
                    <motion.div whileHover={{ scale: 1.02 }} className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all" />
                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Lifetime Transcendences</span>
                                <h3 className="text-3xl font-black text-secondary">{lifetimeTranscendences}</h3>
                            </div>
                            <p className="text-slate-400 text-sm font-medium">The sum of every positive action (Habits + Tasks) taken since initialization.</p>
                        </div>
                    </motion.div>
                </section>

                <section className="glass p-8 md:p-12 rounded-[3rem] border-white/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                        <div>
                            <h2 className="text-3xl font-black mb-2">Weekly Distribution</h2>
                            <p className="text-slate-400 font-medium">Historical breakdown of your habit completion frequency.</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold uppercase tracking-widest text-slate-500">Live Telemetry</span>
                        </div>
                    </div>

                    <div className="aspect-16/9 md:aspect-auto md:h-64 flex items-end justify-between gap-2 md:gap-4 px-2">
                        {daysOfWeek.map((day) => {
                            const count = dayCounts[day] || 0;
                            const maxCount = sortedDays[0]?.[1] || 1;
                            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                            return (
                                <div key={day} className="flex-grow flex flex-col items-center gap-4 group">
                                    <div className="w-full relative flex items-end justify-center h-full">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            className={cn(
                                                "w-full max-w-[40px] rounded-t-xl transition-all duration-700",
                                                day === peakDay ? "bg-linear-to-t from-accent to-secondary shadow-[0_0_30px_rgba(45,212,191,0.3)]" : "bg-white/10 group-hover:bg-white/20"
                                            )}
                                        />
                                        {count > 0 && (
                                            <div className="absolute -top-8 text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {count}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-slate-600 group-hover:text-slate-400 transition-colors">
                                        {day.substring(0, 3)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </main>
    );
}
