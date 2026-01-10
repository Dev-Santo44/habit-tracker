'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import {
    Menu,
    X,
    Zap,
    TrendingUp,
    Home,
    User,
    ChevronRight,
    Calendar,
    Layout,
    LogOut,
    LogIn
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Workflow', href: '/workflow', icon: Layout },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
    { name: 'Trends', href: '/analysis', icon: TrendingUp },
    { name: 'Profile', href: '/profile', icon: User },
];

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { user } = useAuth();
    const router = useRouter();



    return (
        <nav className="relative z-50">
            {/* Desktop & Mobile Header */}
            <div className="glass px-6 py-4 rounded-2xl shadow-2xl border-white/5 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight uppercase hidden sm:block">
                        Quantified<span className="text-gradient">Self</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-all hover:text-white flex items-center gap-2 relative",
                                pathname === item.href ? "text-white" : "text-slate-400"
                            )}
                        >
                            <item.icon className={cn("w-4 h-4", pathname === item.href ? "text-primary" : "opacity-50")} />
                            {item.name}
                            {pathname === item.href && (
                                <motion.div layoutId="activeNav" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                            )}
                        </Link>
                    ))}


                    {!user && (
                        <Link
                            href="/auth"
                            className="text-sm font-medium text-primary hover:text-white transition-all flex items-center gap-2"
                        >
                            <LogIn className="w-4 h-4" />
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-slate-950/90 border-l border-white/5 p-8 z-50 md:hidden flex flex-col gap-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-black uppercase tracking-widest text-gradient">Menu</span>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl transition-all",
                                            pathname === item.href
                                                ? "bg-primary/20 border border-primary/20 text-white"
                                                : "bg-white/5 border border-transparent text-slate-400 hover:bg-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                                pathname === item.href ? "bg-primary text-white" : "bg-slate-800 text-slate-500"
                                            )}>
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold">{item.name}</span>
                                        </div>
                                        <ChevronRight className={cn("w-5 h-5 opacity-30", pathname === item.href && "text-primary opacity-100")} />
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-auto space-y-4">
                                {user && (
                                    <div className="w-full"></div>
                                )}

                                <div className="p-6 rounded-[2rem] bg-linear-to-br from-primary/10 to-transparent border border-white/5">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Pro Member</p>
                                    <p className="text-sm text-slate-300 mb-4">You have reached 85% of your weekly goals!</p>
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="w-[85%] h-full bg-primary" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
