"use client";

import { getPasswordSetupInfo, setupPassword } from '@/actions/users';
import { ShieldCheck, Lock, Mail, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function SetupContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const ctx = searchParams.get('ctx'); // 'reset' or null (setup)

    const [info, setInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        async function load() {
            const data = await getPasswordSetupInfo(token!);
            setInfo(data);
            setLoading(false);
        }
        load();
    }, [token]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus('loading');

        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        const confirm = formData.get('confirmPassword') as string;

        if (password !== confirm) {
            setErrorMessage("Passwords do not match");
            setStatus('error');
            return;
        }

        const result = await setupPassword(formData);
        if (result.success) {
            setStatus('success');
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } else {
            setErrorMessage(result.error || "Failed to setup password");
            setStatus('error');
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-[2rem]"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    if (!token || !info) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-xl border border-gray-100">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <ShieldCheck className="w-10 h-10 text-red-500" />
                </div>
                <h1 className=" font-serif font-black text-gray-900 mb-4">Invalid or Expired Link</h1>
                <p className="text-gray-500 mb-8 font-medium">This invitation link is either incorrect or has expired. Please contact the administrator for a new one.</p>
                <Link href="/" className="bg-primary text-white block py-4 rounded-2xl font-black shadow-lg shadow-primary/20 cursor-pointer">
                    Back to Home
                </Link>
            </div>
        </div>
    );

    if (status === 'success') return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-xl border border-gray-100">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h1 className=" font-serif font-black text-gray-900 mb-4">{ctx === 'reset' ? 'Password Reset!' : 'Account Ready!'}</h1>
                <p className="text-gray-500 mb-10 font-medium">
                    {ctx === 'reset'
                        ? 'Your password has been reset successfully. You can now log in with your new credentials.'
                        : 'Your password has been set successfully. You are now being redirected to the login portal.'}
                </p>
                <Link href="/login" className="flex items-center justify-center gap-2 text-primary font-black  tracking-widest text-sm hover:gap-4 transition-all cursor-pointer">
                    Go to Login <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-xl w-full">
                <div className="text-center mb-12">
                    <div className="bg-primary w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/30 mx-auto mb-8">
                        <span className="text-white font-black text-2xl">IJ</span>
                    </div>
                    <h1 className=" font-serif font-black text-gray-900 mb-4">
                        {ctx === 'reset' ? 'Reset Your Password' : 'Complete Your Setup'}
                    </h1>
                    <p className="text-gray-500 font-medium">Welcome to the IJITEST editorial hub, {info.full_name}.</p>
                </div>

                <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-gray-200/50 border border-gray-100">
                    <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black  tracking-widest text-gray-400">Account Identity</p>
                            <p className="font-bold text-gray-900">{info.email}</p>
                        </div>
                        <div className="ml-auto px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black  tracking-widest">
                            {info.role}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="hidden" name="token" value={token!} />
                        <div className="space-y-2">
                            <label htmlFor="password" title="password" className="text-sm font-bold text-gray-500 pl-2">Create Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" aria-hidden="true" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white pl-14 pr-6 py-5 rounded-[1.5rem] outline-none transition-all font-bold"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" title="confirmPassword" className="text-sm font-bold text-gray-500 pl-2">Confirm Password</label>
                            <div className="relative">
                                <CheckCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" aria-hidden="true" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white pl-14 pr-6 py-5 rounded-[1.5rem] outline-none transition-all font-bold"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5" />
                                {errorMessage}
                            </div>
                        )}

                        <button
                            disabled={status === 'loading'}
                            className="w-full bg-primary text-white py-6 rounded-[1.5rem] font-black text-lg shadow-[0_20px_40px_-15px_rgba(109,2,2,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(109,2,2,0.4)] hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {status === 'loading'
                                ? (ctx === 'reset' ? 'Resetting Password...' : 'Securing Account...')
                                : (ctx === 'reset' ? 'Update & Login' : 'Finish Setup & Join')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function SetupPassword() {
    return (
        <Suspense fallback={null}>
            <SetupContent />
        </Suspense>
    );
}
