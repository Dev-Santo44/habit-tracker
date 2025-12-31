'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import ActivityCanvas from '@/components/ActivityCanvas';
import Navigation from '@/components/Navigation';
import { useRouter } from 'next/navigation';
import {
    Calendar as CalendarIcon,
    Plus,
    Trash2,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Zap
} from 'lucide-react';

export default function SchedulePage() {
    const [mounted, setMounted] = useState(false);
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
    const [localTasks, setLocalTasks] = useState<any[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');

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

    useEffect(() => {
        if (!user) return;

        const tasksRef = collection(db, 'users', user.uid, 'tasks');
        const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
            setLocalTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, [user]);

    const toggleTask = async (taskId: string) => {
        if (!user) return;
        const task = localTasks.find(t => t.id === taskId);
        if (!task) return;

        await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), {
            completed: !task.completed
        });
    };

    const deleteTask = async (taskId: string) => {
        if (!user) return;
        await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId));
    };

    const submitNewTask = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (newTaskTitle.trim() && user) {
            await addDoc(collection(db, 'users', user.uid, 'tasks'), {
                title: newTaskTitle,
                category: 'routine',
                dueDate: selectedDate,
                completed: false,
                createdAt: serverTimestamp()
            });
            setNewTaskTitle('');
        }
    };

    const changeDate = (days: number) => {
        const current = new Date(selectedDate);
        current.setDate(current.getDate() + days);
        setSelectedDate(formatDate(current));
    };

    const filteredTasks = localTasks.filter(t => t.dueDate === selectedDate);

    if (!mounted) return null;

    return (
        <main className="min-h-screen relative bg-background text-foreground p-4 md:p-8 lg:p-12 selection:bg-primary/30">
            <div className="fixed inset-0 bg-gradient-mesh opacity-50 pointer-events-none" />
            <ActivityCanvas activityLevel={0.5} />

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                <Navigation />

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight">Mission <span className="text-gradient">Planner.</span></h1>
                        <p className="text-slate-400 text-xl font-medium">Schedule your transcendence by the cycle.</p>
                    </div>

                    <div className="flex items-center gap-4 glass p-4 rounded-3xl border-white/5 shadow-2xl">
                        <button onClick={() => changeDate(-1)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors">
                            <ChevronLeft className="w-6 h-6 text-slate-400" />
                        </button>
                        <div className="flex flex-col items-center min-w-[150px]">
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">{selectedDate === formatDate(new Date()) ? 'Today' : 'Planned Date'}</span>
                            <span className="text-xl font-black">{selectedDate}</span>
                        </div>
                        <button onClick={() => changeDate(1)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors">
                            <ChevronRight className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-12">
                    <section className="xl:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-4">
                                <Clock className="w-8 h-8 text-secondary" />
                                Cycle Objectives
                            </h2>
                            <span className="px-4 py-2 glass border-white/5 rounded-full text-xs font-bold text-slate-400">
                                {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <AnimatePresence mode="popLayout">
                                {filteredTasks.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="glass p-12 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 space-y-4"
                                    >
                                        <Zap className="w-16 h-16 opacity-10" />
                                        <p className="font-bold uppercase tracking-[0.2em] text-sm">No Objectives Synchronized</p>
                                    </motion.div>
                                ) : (
                                    filteredTasks.map((task) => (
                                        <motion.div
                                            key={task.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="group flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                                        >
                                            <button
                                                onClick={() => toggleTask(task.id)}
                                                className={cn(
                                                    "w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all",
                                                    task.completed ? "bg-secondary border-secondary text-white shadow-lg" : "border-slate-700 hover:border-secondary"
                                                )}
                                            >
                                                {task.completed && <CheckCircle2 className="w-6 h-6" />}
                                            </button>
                                            <div className="flex-grow">
                                                <p className={cn(
                                                    "text-lg font-bold transition-all",
                                                    task.completed ? "text-slate-500 line-through" : "text-white"
                                                )}>
                                                    {task.title}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="opacity-0 group-hover:opacity-100 p-3 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-4">
                            <Plus className="w-8 h-8 text-primary" />
                            New Intent
                        </h2>
                        <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
                            <p className="text-slate-400 font-medium">Define a new objective for this specific synchronization cycle.</p>
                            <form onSubmit={submitNewTask} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Enter objective..."
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 outline-hidden focus:ring-2 focus:ring-primary/50 transition-all font-bold placeholder:text-slate-700"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!newTaskTitle.trim()}
                                    className="w-full py-5 bg-linear-to-r from-primary to-secondary rounded-2xl text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/30 disabled:opacity-50 transition-all"
                                >
                                    Sync Objective
                                </button>
                            </form>

                            <div className="pt-8 border-t border-white/5">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    <CalendarIcon className="w-4 h-4 text-primary" />
                                    Target: {selectedDate}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
