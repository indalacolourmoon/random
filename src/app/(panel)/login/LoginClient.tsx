"use client";

import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';

function LoadingButton() {
    return (
        <button
            type="submit"
            className="w-full bg-primary text-white py-4 rounded-xl font-black text-xs sm:text-sm tracking-widest uppercase shadow-lg shadow-primary/20 hover:shadow-xl hover:bg-primary/95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
            Proceed to Dashboard
            <ShieldCheck className="w-5 h-5" />
        </button>
    );
}

export default function LoginClient() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setError(null);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password");
        } else {
            // Fetch session to determine role-based redirection
            const session = await getSession();
            const role = (session?.user as any)?.role;

            if (role) {
                window.location.href = `/${role}`;
            } else {
                window.location.href = '/login';
            }
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <section className="text-center mb-10">
                    <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary/10">
                        <Lock className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className=" font-black text-gray-900 mb-2 uppercase tracking-wider leading-none">Portal Access</h1>
                    <p className="text-gray-500 font-medium text-xs sm:text-sm tracking-wide m-0">International Journal of Innovative Trends in Science, Engineering and Technology</p>
                </section>

                <div className="bg-white p-10 rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                            {error}
                        </div>
                    )}
                    <form action={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-primary/40 tracking-widest uppercase mb-3 ml-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-gray-900 font-bold"
                                    placeholder="editor@ijitest.org"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-primary/40 tracking-widest uppercase mb-3 ml-2">Secure Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-12 pr-12 py-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-gray-900 font-bold"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="w-5 h-5 rounded-md border-2 border-gray-200 group-hover:border-primary transition-colors flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-primary rounded-sm opacity-0 group-hover:opacity-10"></div>
                                </div>
                                <span className="text-xs font-black text-gray-400 tracking-widest uppercase">Remember session</span>
                            </label>
                            <Link href="/auth/forgot-password" className="text-xs font-black text-primary hover:text-secondary tracking-widest uppercase cursor-pointer transition-colors">Forgot Credentials?</Link>
                        </div>

                        <LoadingButton />
                    </form>
                </div>

                <span className="text-center mt-10 text-[10px] sm:text-xs text-gray-400 font-black tracking-[0.2em] uppercase leading-relaxed block max-w-[280px] mx-auto opacity-40">
                    Authorized personnel only. All activities are monitored.<br />
                    System Node: v1.0.4-IJITEST
                </span>
            </motion.div>
        </main>
    );
}
