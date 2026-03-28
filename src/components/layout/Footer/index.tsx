import Link from 'next/link';
import { Mail, Phone, MapPin, ShieldCheck, Globe, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer({ settings }: { settings?: Record<string, string> }) {
    const publisher = settings?.publisher_name || "Felix Academic Publications";
    const copyrightYear = new Date().getFullYear();

    const socialLinks = [
        { icon: Facebook, href: process.env.NEXT_PUBLIC_FACEBOOK_URL || '#', label: 'Facebook' },
        { icon: Twitter, href: process.env.NEXT_PUBLIC_TWITTER_URL || '#', label: 'Twitter' },
        { icon: Instagram, href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '#', label: 'Instagram' },
    ];

    return (
        <footer className="bg-slate-950 text-white pt-10 pb-5 font-sans relative overflow-hidden">
            {/* Background decorative glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent opacity-30" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-1000" />
            <div className="absolute top-1/4 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-secondary/10 transition-colors duration-1000" />

            <div className="container-responsive">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-6">

                    <div className="lg:col-span-1 space-y-8">
                        <div>
                            <h1 className="mb-4 text-white m-0 font-black">IJITEST</h1>
                            <p className="text-slate-400 font-medium m-0">
                                International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) is a peer-reviewed scholarly journal dedicated to elite research dissemination.
                            </p>
                        </div>

                        
                    </div>

                    {/* Journal Portals */}
                    <div className="lg:col-span-2">
                        <h3 className="text-white mb-10 border-b border-white/10 pb-4 inline-block m-0 text-[10px] 2xl:text-[14px] font-black tracking-[0.3em] uppercase">Journal Portals</h3>
                        <ul className="grid grid-cols-2 gap-x-12 gap-y-4 text-xs font-bold text-slate-400 list-none p-0">
                            <li><Link href="/about" className="hover:text-secondary transition-colors cursor-pointer">About Journal</Link></li>
                            <li><Link href="/editorial-board" className="hover:text-secondary transition-colors cursor-pointer">Editorial Board</Link></li>
                            <li><Link href="/guidelines" className="hover:text-secondary transition-colors cursor-pointer">Author Guidelines</Link></li>
                            <li><Link href="/peer-review" className="hover:text-secondary transition-colors cursor-pointer">Peer Review</Link></li>
                            <li><Link href="/ethics" className="hover:text-secondary transition-colors cursor-pointer">Publication Ethics</Link></li>
                            <li><Link href="/archives" className="hover:text-secondary transition-colors cursor-pointer">Digital Archives</Link></li>
                            <li><Link href="/indexing" className="hover:text-secondary transition-colors cursor-pointer">Indexing Hub</Link></li>
                            <li><Link href="/privacy" className="hover:text-secondary transition-colors cursor-pointer">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-secondary transition-colors cursor-pointer">Terms of Use</Link></li>
                            <li><Link href="/track" className="hover:text-secondary transition-colors cursor-pointer">Track Application</Link></li>
                            <li><Link href="/contact" className="hover:text-secondary transition-colors cursor-pointer">Contact Office</Link></li>
                            <li><Link href="/login" className="hover:text-secondary transition-colors cursor-pointer">Login</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Support */}
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-white mb-10 border-b border-white/10 pb-4 inline-block m-0 text-[10px] 2xl:text-[14px] font-black tracking-[0.3em] uppercase">Support HQ</h3>
                            <div className="space-y-6 2xl:space-y-12">
                                <div className="flex gap-4 group/support">
                                    <div className="w-10 h-10 2xl:w-16 2xl:h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/support:scale-110 group-hover/support:bg-white/10 transition-all duration-500 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/support:animate-shine pointer-events-none" />
                                        <ShieldCheck className="w-4 h-4 2xl:w-8 2xl:h-8 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 mb-1 m-0">COPE Compliant</p>
                                        <p className="text-sm text-white tracking-wider m-0">Institutional Standards</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 group/support">
                                    <div className="w-10 h-10 2xl:w-16 2xl:h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/support:scale-110 group-hover/support:bg-white/10 transition-all duration-500 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/support:animate-shine pointer-events-none" />
                                        <Phone className="w-4 h-4 2xl:w-8 2xl:h-8 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 mb-1 m-0">Direct Line</p>
                                        <p className="text-sm text-white tracking-wider m-0">+91 8919643590</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 group/support">
                                    <div className="w-10 h-10 2xl:w-16 2xl:h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/support:scale-110 group-hover/support:bg-white/10 transition-all duration-500 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/support:animate-shine pointer-events-none" />
                                        <MapPin className="w-4 h-4 2xl:w-8 2xl:h-8 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 mb-1 m-0">Office Location</p>
                                        <p className="text-sm font-medium text-slate-400 m-0">
                                            Felix Academic Publications, Madhurawada, Visakhapatnam, AP, India
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center lg:items-start gap-2">
                        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 m-0">
                            &copy; {copyrightYear} <span className="text-white">{publisher}</span>
                        </p>
                        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-600 m-0">All Rights Reserved</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 mr-4">
                            {socialLinks.map((social, i) => (
                                <Link
                                    key={i}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="w-10 h-10 2xl:w-16 2xl:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                                >
                                    <social.icon className="w-4 h-4 2xl:w-8 2xl:h-8" />
                                </Link>
                            ))}
                        </div>


                    </div>
                </div>
            </div>
        </footer>
    );
}
