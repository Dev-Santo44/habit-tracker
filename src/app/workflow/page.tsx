'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
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
    writeBatch,
    serverTimestamp
} from 'firebase/firestore';
import ActivityCanvas from '@/components/ActivityCanvas';
import Navigation from '@/components/Navigation';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Trash2,
    CheckCircle2,
    Clock,
    Zap,
    MoreVertical,
    Layout,
    Circle,
    PlayCircle,
    PauseCircle
} from 'lucide-react';

const COLUMNS = {
    NOT_STARTED: { id: 'NOT_STARTED', title: 'Not Started', icon: Circle, color: 'text-slate-400', bg: 'bg-slate-400/10' },
    IN_PROGRESS: { id: 'IN_PROGRESS', title: 'In Progress', icon: PlayCircle, color: 'text-primary', bg: 'bg-primary/10' },
    PENDING: { id: 'PENDING', title: 'Pending', icon: PauseCircle, color: 'text-accent', bg: 'bg-accent/10' },
    COMPLETED: { id: 'COMPLETED', title: 'Completed', icon: CheckCircle2, color: 'text-secondary', bg: 'bg-secondary/10' },
};

export default function WorkflowPage() {
    const [mounted, setMounted] = useState(false);
    const [workflowTasks, setWorkflowTasks] = useState<any[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [addingTo, setAddingTo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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

        const workflowRef = collection(db, 'users', user.uid, 'workflowTasks');
        const unsubscribe = onSnapshot(workflowRef, (snapshot) => {
            setWorkflowTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, [user]);

    const moveTask = async (taskId: string, newStatus: string) => {
        if (!user) return;
        await updateDoc(doc(db, 'users', user.uid, 'workflowTasks', taskId), {
            status: newStatus
        });
    };

    const deleteTask = async (taskId: string) => {
        if (!user) return;
        await deleteDoc(doc(db, 'users', user.uid, 'workflowTasks', taskId));
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) return;
        const { draggableId, destination } = result;
        const newStatus = destination.droppableId;

        // Optimistic UI update
        const updatedTasks = workflowTasks.map(t =>
            t.id === draggableId ? { ...t, status: newStatus } : t
        );
        setWorkflowTasks(updatedTasks);

        moveTask(draggableId, newStatus);
    };

    const submitNewTask = async (status: string) => {
        if (newTaskTitle.trim() && user) {
            const titles = newTaskTitle.split('\n').map(t => t.trim()).filter(t => t !== '');

            if (titles.length > 1) {
                const batch = writeBatch(db);
                titles.forEach(title => {
                    const newDocRef = doc(collection(db, 'users', user.uid, 'workflowTasks'));
                    batch.set(newDocRef, {
                        title,
                        status,
                        createdAt: new Date().toISOString() // Using string for consistency with existing UI
                    });
                });
                await batch.commit();
            } else if (titles.length === 1) {
                await addDoc(collection(db, 'users', user.uid, 'workflowTasks'), {
                    title: titles[0],
                    status,
                    createdAt: new Date().toISOString()
                });
            }

            setNewTaskTitle('');
            setAddingTo(null);
        }
    };

    if (!mounted) return null;

    return (
        <main className="min-h-screen relative bg-background text-foreground p-4 md:p-8 lg:p-12 selection:bg-primary/30">
            <div className="fixed inset-0 bg-gradient-mesh opacity-50 pointer-events-none" />
            <ActivityCanvas activityLevel={0.6} />

            <div className="max-w-7xl mx-auto space-y-12 relative z-10 h-full flex flex-col">
                <Navigation />

                <header className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight">Mission <span className="text-gradient">Control.</span></h1>
                    <p className="text-slate-400 text-xl font-medium">Manage complex multi-stage objectives through the flow.</p>
                </header>

                <section className="flex-grow overflow-x-auto pb-8">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="flex gap-6 min-w-max md:min-w-full">
                            {Object.values(COLUMNS).map((column) => (
                                <div key={column.id} className="w-80 flex flex-col gap-6">
                                    <div className={cn("flex items-center justify-between p-4 rounded-2xl glass border-white/5", column.bg)}>
                                        <div className="flex items-center gap-3">
                                            <column.icon className={cn("w-5 h-5", column.color)} />
                                            <h3 className="font-black text-sm uppercase tracking-widest">{column.title}</h3>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-md">
                                            {workflowTasks.filter(t => t.status === column.id).length}
                                        </span>
                                    </div>

                                    <Droppable droppableId={column.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={cn(
                                                    "flex-grow min-h-[400px] rounded-3xl transition-all duration-300 flex flex-col gap-4",
                                                    snapshot.isDraggingOver ? "bg-white/5" : "bg-transparent"
                                                )}
                                            >
                                                {workflowTasks
                                                    .filter(t => t.status === column.id)
                                                    .map((task, index) => (
                                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={cn(
                                                                        "glass p-6 rounded-2xl border-white/10 group relative transition-all",
                                                                        snapshot.isDragging ? "shadow-2xl shadow-primary/20 scale-105 z-50 border-primary/50" : "hover:bg-white/5"
                                                                    )}
                                                                >
                                                                    <div className="flex items-start justify-between gap-4">
                                                                        <p className="font-bold text-sm leading-relaxed">{task.title}</p>
                                                                        <button
                                                                            onClick={() => deleteTask(task.id)}
                                                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all shrink-0"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                    <div className="mt-4 flex items-center justify-between">
                                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                                            <Clock className="w-3 h-3" />
                                                                            {new Date(task.createdAt).toLocaleDateString()}
                                                                        </div>
                                                                        <div className="p-1 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <Layout className="w-3 h-3 text-slate-600" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                {provided.placeholder}

                                                {addingTo === column.id ? (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                                        <textarea
                                                            autoFocus
                                                            placeholder="What's the mission? (Enter multiple lines for bulk add)"
                                                            className="w-full h-32 bg-slate-900 shadow-inner rounded-2xl p-4 text-sm font-bold resize-none outline-hidden ring-1 ring-white/10 focus:ring-primary/50"
                                                            value={newTaskTitle}
                                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    submitNewTask(column.id);
                                                                }
                                                            }}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => submitNewTask(column.id)}
                                                                className="flex-grow py-2 bg-primary text-white font-bold rounded-xl text-xs uppercase"
                                                            >
                                                                Deploy
                                                            </button>
                                                            <button
                                                                onClick={() => setAddingTo(null)}
                                                                className="px-4 py-2 bg-slate-800 text-slate-400 font-bold rounded-xl text-xs uppercase"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <button
                                                        onClick={() => setAddingTo(column.id)}
                                                        className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-800 text-slate-600 font-bold uppercase text-[10px] tracking-widest hover:border-slate-700 hover:text-slate-500 transition-all"
                                                    >
                                                        + Inject Objective
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}
                        </div>
                    </DragDropContext>
                </section>
            </div>
        </main>
    );
}
