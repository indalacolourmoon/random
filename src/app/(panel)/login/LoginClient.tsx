"use client";

import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { InputGroup,InputGroupAddon,InputGroupInput } from '@/components/ui/input-group';

function LoadingButton() {
    return (
        <Button
            type="submit"
            className="w-full h-11 bg-[#000066] hover:bg-[#000088] text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
            Login <ShieldCheck className="w-4 h-4" />
        </Button>
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
            <div className="max-w-md w-full">
                <section className="text-center mb-8">
                    <div className="bg-[#000066]/5 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#000066]/10">
                        <Lock className="w-8 h-8 text-[#000066]" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-1">Portal Access</h1>
                    <p className="text-sm text-[#000066] font-medium leading-relaxed">
                        International Journal of Innovative Trends in Science, Engineering and Technology
                    </p>
                </section>

                <div className="bg-card p-8 rounded-xl border border-border/50 shadow-sm overflow-hidden">
                    {error && (
                        <div className="mb-6 p-4 bg-destructive/5 border border-destructive/10 text-destructive rounded-lg text-xs font-semibold flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                            <InputGroup className="h-11 rounded-lg border-border/50 bg-muted/20">
                                <InputGroupAddon align="inline-start" className="pl-3">
                                    <Mail className="w-4 h-4 text-muted-foreground/60" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="editor@ijitest.org"
                                    className="text-xs font-medium"
                                />
                            </InputGroup>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Password</label>
                            <InputGroup className="h-11 rounded-lg border-border/50 bg-muted/20">
                                <InputGroupAddon align="inline-start" className="pl-3">
                                    <Lock className="w-4 h-4 text-muted-foreground/60" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="text-xs font-medium"
                                />
                                <InputGroupAddon align="inline-end" className="pr-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="h-8 w-8 text-muted-foreground/60 hover:text-[#000066] transition-colors hover:bg-transparent"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                </InputGroupAddon>
                            </InputGroup>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Remember session</span>
                            </label>
                            <Link href="/auth/forgot-password" title="Forgot Password" className="text-[10px] font-bold text-[#000066] hover:text-[#000088] tracking-widest uppercase transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        <LoadingButton />
                    </form>
                </div>

                <span className="text-center mt-8 text-[10px] text-muted-foreground font-semibold tracking-widest uppercase opacity-40 block">
                    Authorized Access Only
                </span>
            </div>
        </main>
    );
}