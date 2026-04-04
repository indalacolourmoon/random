"use client";

import { requestPasswordReset } from '@/actions/users';
import { Mail, ArrowRight, ShieldCheck, MailCheck } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ForgotPassword() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus('loading');
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await requestPasswordReset(formData);

        if (result.success) {
            setStatus('success');
        } else {
            setError(result.error || "Something went wrong");
            setStatus('error');
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-10">
                    <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary/10">
                        <ShieldCheck className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className=" font-serif font-black text-gray-900 mb-2">Password Recovery</h1>
                    <p className="text-gray-500 font-medium ">Enter your email to receive a reset link</p>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {status === 'success' ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MailCheck className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className=" font-serif font-black text-gray-900 mb-3">Check Your Email</h3>
                                <p className="text-slate-600 font-medium mb-8">We've sent a secure password reset link to your email address if it's registered with us.</p>
                                <Link
                                    href="/login"
                                    className="bg-primary text-white block py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Return to Login
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-700  tracking-widest mb-3 pl-1">Registred Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                            <input
                                                name="email"
                                                type="email"
                                                required
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-slate-900 font-bold"
                                                placeholder="e.g. editor@ijitest.org"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full bg-primary text-white py-5 rounded-3xl font-black text-xs  tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-2xl hover:bg-primary/95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {status === 'loading' ? 'Processing...' : 'Send Recovery Link'}
                                        <ArrowRight className="w-5 h-5" />
                                    </button>

                                    <div className="text-center">
                                        <Link href="/login" className="text-[10px] font-black  text-gray-400 tracking-widest hover:text-primary transition-colors cursor-pointer">
                                            Wait, I remember it!
                                        </Link>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
