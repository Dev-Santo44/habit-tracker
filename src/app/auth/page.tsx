'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Rocket, Mail, Lock, User, ArrowRight } from 'lucide-react';
import ActivityCanvas from '@/components/ActivityCanvas';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!auth) {
                setError("Authentication service is unavailable.");
                return;
            }
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
            }
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen relative bg-background text-foreground flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gradient-mesh opacity-50 pointer-events-none" />
            <ActivityCanvas activityLevel={0.4} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass p-8 md:p-12 rounded-[2.5rem] border-white/10 shadow-2xl space-y-8">
                    <header className="text-center space-y-2">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Rocket className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">
                            {isLogin ? 'Welcome Back.' : 'Join the Mission.'}
                        </h1>
                        <p className="text-slate-400 font-medium">
                            {isLogin ? 'Login to continue your journey.' : 'Register to start tracking your flow.'}
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode='wait'>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2"
                                >
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            required={!isLogin}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                            placeholder="Commander Name"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    placeholder="your@command.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Access Code</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-400 text-xs font-bold text-center px-4">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 group transition-all disabled:opacity-50 mt-4 shadow-lg shadow-primary/20"
                        >
                            {loading ? 'Initializing...' : (isLogin ? 'Enter' : 'Authorize')}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <footer className="text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
                        >
                            {isLogin ? "New recruit? Create an account" : "Already registered? Login here"}
                        </button>
                    </footer>
                </div>
            </motion.div>
        </main>
    );
}
