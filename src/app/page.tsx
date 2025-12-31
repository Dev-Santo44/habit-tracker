'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { cn, formatDate, getGreeting } from '@/lib/utils';
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
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import ActivityCanvas from '@/components/ActivityCanvas';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Plus,
  Trophy,
  Flame,
  Clock,
  Trash2,
  X,
  Zap,
  Star,
  Target
} from 'lucide-react';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState(formatDate(new Date()));
  const [loading, setLoading] = useState(false);
  const [localHabits, setLocalHabits] = useState<any[]>([]);
  const [localTasks, setLocalTasks] = useState<any[]>([]);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [showHabitInput, setShowHabitInput] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setLocalHabits(data.habits || []);
      setLocalTasks(data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  }, []);

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

    const habitsRef = collection(db, 'users', user.uid, 'habits');
    const tasksRef = collection(db, 'users', user.uid, 'tasks');

    const unsubscribeHabits = onSnapshot(habitsRef, (snapshot) => {
      setLocalHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeTasks = onSnapshot(tasksRef, (snapshot) => {
      setLocalTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeHabits();
      unsubscribeTasks();
    };
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = formatDate(new Date());
      if (current !== today) {
        setToday(current);
      }
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, [today]);

  const fireConfetti = () => {
    const end = Date.now() + 1 * 1000;
    const colors = ['#8b5cf6', '#f472b6', '#2dd4bf'];
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  const toggleHabit = async (habitId: string) => {
    if (!user) return;
    const habit = localHabits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDates?.includes(today);
    const newCompletedDates = isCompleted
      ? habit.completedDates.filter((d: string) => d !== today)
      : [...(habit.completedDates || []), today];

    await updateDoc(doc(db, 'users', user.uid, 'habits', habitId), {
      completedDates: newCompletedDates
    });

    if (!isCompleted) fireConfetti();
  };

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
        dueDate: today,
        completed: false,
        createdAt: serverTimestamp()
      });
      setNewTaskTitle('');
      setShowTaskInput(false);
    }
  };

  const submitNewHabit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newHabitName.trim() && user) {
      await addDoc(collection(db, 'users', user.uid, 'habits'), {
        name: newHabitName,
        icon: 'target',
        color: '#8b5cf6',
        completedDates: [],
        createdAt: serverTimestamp()
      });
      setNewHabitName('');
      setShowHabitInput(false);
    }
  };

  const totalCompletions = localHabits.reduce((acc, h) => acc + (h.completedDates?.length || 0), 0);
  const totalHabitsCount = localHabits.length;
  const completedTodayCount = localHabits.filter(h => h.completedDates?.includes(today)).length;
  const progressPercentage = totalHabitsCount > 0 ? (completedTodayCount / totalHabitsCount) * 100 : 0;
  const activityLevel = progressPercentage / 100;

  // Filter tasks for today
  const filteredTasks = localTasks.filter(t => t.dueDate === today);

  if (!mounted) return null;

  return (
    <main className="min-h-screen relative bg-background text-foreground p-4 md:p-8 lg:p-12 selection:bg-primary/30">
      <div className="fixed inset-0 bg-gradient-mesh opacity-50 pointer-events-none" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="blob top-[-10%] left-[-10%] bg-primary/20" />
        <div className="blob top-[60%] right-[-5%] bg-secondary/20 animation-delay-2000" style={{ animationDuration: '30s' }} />
        <div className="blob bottom-[-10%] left-[20%] bg-accent/20 animation-delay-5000" style={{ animationDuration: '35s' }} />
      </div>

      <ActivityCanvas activityLevel={activityLevel} />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        <Navigation />

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            {getGreeting()}, <span className="text-gradient animate-pulse">{user?.displayName || 'Voyager'}.</span>
            <p className="text-slate-400 text-xl font-medium">Your tasks for <span className="text-white">{today}</span> await.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {!showHabitInput ? (
              <motion.button
                key="add-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHabitInput(true)}
                disabled={loading}
                className="group flex items-center gap-3 px-8 py-4 bg-linear-to-r from-primary to-secondary text-white rounded-2xl font-bold shadow-2xl shadow-primary/30 transition-all disabled:opacity-50"
              >
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                Initiate Habit
              </motion.button>
            ) : (
              <motion.form
                key="add-form"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                onSubmit={submitNewHabit}
                className="flex items-center gap-2"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Identify new habit..."
                  className="bg-slate-900/80 border border-white/10 rounded-2xl px-6 py-4 outline-hidden focus:ring-2 focus:ring-primary/50 transition-all font-medium min-w-[200px] md:min-w-[300px]"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                />
                <div className="flex gap-1">
                  <button type="submit" disabled={loading} className="p-4 bg-primary rounded-xl text-white shadow-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                  <button type="button" onClick={() => setShowHabitInput(false)} className="p-4 bg-slate-800 rounded-xl text-slate-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-12">
          <section className="xl:col-span-2 space-y-8">
            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-4">
              <Target className="w-8 h-8 text-primary" />
              Habit Forge
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AnimatePresence>
                {localHabits.map((habit, index) => {
                  const isCompleted = habit.completedDates?.includes(today);
                  return (
                    <motion.div
                      key={habit.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "group relative glass p-6 md:p-8 rounded-[2rem] transition-all duration-500",
                        isCompleted ? "ring-2 ring-primary bg-primary/10" : "hover:bg-slate-800/40"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold" style={{ background: `linear-gradient(135deg, ${habit.color}, #000)` }}>
                            {habit.name[0].toUpperCase()}
                          </div>
                          <h4 className="font-black text-lg md:text-xl">{habit.name}</h4>
                        </div>
                        <button
                          onClick={() => toggleHabit(habit.id)}
                          className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                            isCompleted ? "bg-primary text-white shadow-lg shadow-primary/40" : "bg-slate-800 text-slate-500"
                          )}
                        >
                          <CheckCircle2 className={cn("w-6 h-6 transition-transform", isCompleted ? "scale-100" : "scale-0")} />
                          {!isCompleted && <div className="w-4 h-4 rounded-full border-2 border-slate-600" />}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-4">
              <Clock className="w-8 h-8 text-secondary" />
              Daily Routine
            </h2>
            <div className="glass rounded-[2rem] p-6 md:p-8 space-y-6">
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredTasks.map((task) => (
                    <motion.div key={task.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group">
                      <button onClick={() => toggleTask(task.id)} className={cn("w-6 h-6 rounded-lg border-2", task.completed ? "bg-secondary border-secondary" : "border-slate-700")}>
                        {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                      <span className={cn("font-bold text-sm", task.completed ? "text-slate-500 line-through" : "text-slate-200")}>{task.title}</span>
                      <button onClick={() => deleteTask(task.id)} className="ml-auto opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredTasks.length === 0 && !showTaskInput && (
                  <div className="text-center py-8 text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                    Zero cycle objectives
                  </div>
                )}
              </div>
              {showTaskInput ? (
                <form onSubmit={submitNewTask} className="flex gap-2">
                  <input autoFocus className="flex-grow bg-slate-800/50 rounded-xl px-4 py-2 text-sm font-bold outline-hidden" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Objective..." />
                  <button type="submit" className="p-2 bg-secondary rounded-xl text-white"><Plus className="w-4 h-4" /></button>
                </form>
              ) : (
                <button onClick={() => setShowTaskInput(true)} className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 font-bold uppercase text-[10px] tracking-widest">+ Register Objective</button>
              )}
            </div>
          </section>
        </div>

        <section className="pb-12">
          <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden neon-border">
            <div className="absolute top-0 right-0 p-8 opacity-20"><Star className="w-12 h-12 text-primary" /></div>
            <div className="space-y-6">
              <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded-full uppercase">Today's Progress</span>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-3xl font-black">{Math.round(progressPercentage)}% Synchronized</h3>
                  <p className="text-slate-400 font-medium">Your daily orbit is stabilizing.</p>
                </div>
                <Link href="/analysis" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/5">Deep Analysis</Link>
              </div>
              <div className="w-full bg-slate-800/50 h-4 rounded-full p-1">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} className="h-full rounded-full bg-linear-to-r from-primary to-accent shadow-lg shadow-primary/20" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
