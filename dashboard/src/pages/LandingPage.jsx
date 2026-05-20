import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';
import Credits from '../components/Credits';
import {
    Shield, Zap, MessageSquare, Music, Trophy,
    ChevronRight, Star, Server, Users, Bot,
    ArrowRight, CheckCircle2, BarChart3, Command,
    Globe, Lock, Sparkles, Rocket, Activity,
    Layers, ZapIcon, Heart, Mail, Github, Twitter
} from 'lucide-react';

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    return (
        <div className="min-h-screen bg-[#030014] text-white selection:bg-pink-500/30 overflow-x-hidden font-inter">
            {/* Premium Grain Overlay */}
            <div className="premium-grain" />

            {/* Background Orbs - Restored Full Boldness */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/20 blur-[120px]" />
                <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[130px]" />
            </div>

            <Navbar />

            <main className="relative z-10">
                <Hero sectionOpacity={heroOpacity} sectionScale={heroScale} />
                <LogoCloud />
                <Features />
                <Roadmap />
                <Stats />
                <CTA />
            </main>

            <Footer />
        </div>
    );
};

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed w-full z-50 top-0 left-0 transition-all duration-300 border-b ${scrolled ? 'bg-[#030014]/80 backdrop-blur-3xl border-white/5 py-4' : 'bg-transparent border-transparent py-6'
            }`}>
            <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                        <Zap className="text-white fill-white" size={24} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Vortex</span>
                </Link>

                <div className="hidden lg:flex items-center gap-10">
                    <Link to="/features" className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">Features</Link>
                    <Link to="/premium" className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">Premium</Link>
                    <Link to="/dashboard" className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">Dashboard</Link>
                    <a href="https://vortex-docs.com" className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">Docs</a>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/auth/login" className="hidden sm:block text-sm font-bold text-slate-400 hover:text-white px-4 transition-colors">Login</Link>
                    <a
                        href="https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot"
                        target="_blank"
                        className="btn-premium !py-2.5 !px-6 !text-xs !rounded-xl"
                    >
                        Add to Server
                    </a>
                </div>
            </div>
        </nav>
    );
};

const Hero = ({ sectionOpacity, sectionScale }) => {
    return (
        <motion.section
            style={{ opacity: sectionOpacity, scale: sectionScale }}
            className="pt-48 pb-32 px-8 relative overflow-hidden"
        >
            <div className="max-w-7xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 mb-10"
                >
                    <Sparkles size={12} className="fill-pink-500" />
                    Vortex protocol active
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-6xl md:text-[8rem] font-black leading-[0.9] tracking-tighter mb-10"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                        Universal <br />
                        Moderation
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-12"
                >
                    The most powerful Discord bot engine ever built. AI safety, professional tickets, and global analytics in a single unified protocol.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button className="w-full sm:w-auto px-10 py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2">
                        Invite Vortex <ArrowRight size={18} />
                    </button>
                    <Link to="/premium" className="w-full sm:w-auto px-10 py-5 bg-white/[0.03] border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2">
                        View Premium <ZapIcon size={18} />
                    </Link>
                </motion.div>

                {/* Dashboard Image with 3D Tilt */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, type: 'spring', damping: 20 }}
                    className="mt-32 max-w-6xl mx-auto group perspective-1000"
                >
                    <div className="relative rounded-[2.5rem] border border-white/10 bg-white/[0.01] p-2 overflow-hidden transition-transform duration-700 group-hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 via-transparent to-violet-700/20 opacity-50" />
                        <img
                            src="/vortex_dashboard.png"
                            alt="Vortex Premium 3D Dashboard Mockup"
                            className="w-full rounded-[2rem] border border-white/10 relative z-10"
                        />
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
};

const LogoCloud = () => (
    <section className="py-20 border-y border-white/5 overflow-hidden group">
        <div className="max-w-7xl mx-auto px-8">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 mb-12">Trusted by 5,000+ communities</p>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-30 group-hover:opacity-50 transition-opacity grayscale group-hover:grayscale-0 transition-all duration-700">
                <div className="flex items-center gap-2"> <Server size={24} /> <span className="font-bold text-xl">Cloudways</span> </div>
                <div className="flex items-center gap-2"> <Zap size={24} /> <span className="font-bold text-xl">StreamerBot</span> </div>
                <div className="flex items-center gap-2"> <Users size={24} /> <span className="font-bold text-xl">GuildMaster</span> </div>
                <div className="flex items-center gap-2"> <Rocket size={24} /> <span className="font-bold text-xl">OrbitInc</span> </div>
                <div className="flex items-center gap-2"> <Shield size={24} /> <span className="font-bold text-xl">SafeNet</span> </div>
            </div>
        </div>
    </section>
);

const Features = () => {
    const featureItems = [
        { title: 'AI Sentry', desc: 'Predictive moderation that catches raids before they happen.', icon: <Sparkles size={20} />, col: 'md:col-span-2' },
        { title: 'Voice 24/7', desc: 'High-fidelity music stream with zero-latency buffers.', icon: <Music size={20} />, col: '' },
        { title: 'Unified Data', desc: 'Real-time sync across your entire server network.', icon: <Globe size={20} />, col: '' },
        { title: 'Elite Tickets', desc: 'Professional support suite with HTML transcripts.', icon: <MessageSquare size={20} />, col: 'md:col-span-2' },
    ];

    return (
        <section id="features" className="py-48 px-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between gap-12 mb-24">
                <div className="max-w-xl">
                    <h2 className="text-5xl font-bold tracking-tight mb-6">Designed for <br /> <span className="text-slate-600">Enterprise Scale.</span></h2>
                    <p className="text-slate-500 font-medium leading-relaxed">Vortex is the only bot built on a reactive cloud mesh, ensuring your moderation is always active even during heavy Discord outages.</p>
                </div>
                <Link to="/features" className="text-pink-500 font-bold hover:underline underline-offset-8">Explore full protocol stack →</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featureItems.map((f, i) => (
                    <div key={i} className={`glass-card glass-card-hover p-10 group ${f.col}`}>
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-pink-500 group-hover:scale-110 transition-all mb-8">
                            {f.icon}
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

const Roadmap = () => {
    const steps = [
        { q: 'Q1 2024', status: 'Completed', name: 'Vortex Protocol 2.0', desc: 'Rebuilt the core engine with Node 20 and Discord.js v14.' },
        { q: 'Q2 2024', status: 'In Progress', name: 'Gemini 2.0 Integration', desc: 'Implementing multimodal AI analysis for images and voice.' },
        { q: 'Q3 2024', status: 'Planned', name: 'Global Command Mesh', desc: 'Execute commands across 100+ servers with a single input.' },
        { q: 'Q4 2024', status: 'Future', name: 'Vortex Mobile App', desc: 'Direct dashboard control from iOS and Android devices.' },
    ];

    return (
        <section className="py-48 px-8 bg-white/[0.01] border-y border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24">
                    <h2 className="text-5xl font-bold mb-6 tracking-tight">System Roadmap</h2>
                    <p className="text-slate-500 font-medium">Tracking our journey toward a fully autonomous Discord bot.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
                    <div className="hidden md:block absolute top-[22px] left-0 right-0 h-px bg-white/5 z-0" />
                    {steps.map((s, i) => (
                        <div key={i} className="relative z-10 group">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-8 border-4 border-[#030014] transition-all ${s.status === 'Completed' ? 'bg-pink-600 text-white' : s.status === 'In Progress' ? 'bg-amber-500 text-black' : 'bg-[#0a0a0c] text-slate-700'
                                }`}>
                                {s.status === 'Completed' ? <CheckCircle2 size={18} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">{s.q}</div>
                            <h4 className="text-lg font-bold mb-3 group-hover:text-pink-500 transition-colors">{s.name}</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Stats = () => (
    <section id="stats" className="py-32 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
                { label: 'Active Servers', value: '4.8k', icon: <Server size={24} /> },
                { label: 'Users Protected', value: '1.2M', icon: <Users size={24} /> },
                { label: 'Bot Latency', value: '15ms', icon: <Activity size={24} /> },
                { label: 'Uptime (30d)', value: '100%', icon: <Zap size={24} /> }
            ].map((stat, i) => (
                <div key={i} className="text-center flex flex-col items-center group">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center text-slate-600 group-hover:text-pink-500 transition-colors mb-6">
                        {stat.icon}
                    </div>
                    <div className="text-5xl font-black mb-2 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">{stat.value}</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</div>
                </div>
            ))}
        </div>
    </section>
);

const CTA = () => (
    <section className="py-48 px-8">
        <div className="max-w-6xl mx-auto rounded-[3.5rem] bg-gradient-to-br from-pink-600 to-violet-700 p-2 shadow-2xl shadow-pink-500/10 scale-95 hover:scale-100 transition-all duration-700 overflow-hidden group">
            <div className="bg-[#030014] rounded-[3.3rem] p-16 md:p-32 text-center relative overflow-hidden">
                <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-pink-600/10 blur-[150px] animate-float" />
                <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter relative z-10">
                    Ready for the <br /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">Vortex Protocol?</span>
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                    <button className="w-full sm:w-auto px-12 py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-105 transition-all">
                        Invite Bot
                    </button>
                    <Link to="/premium" className="w-full sm:w-auto px-12 py-5 bg-white/[0.03] border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-white/[0.08] transition-all">
                        Upgrade Pro
                    </Link>
                </div>
            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="py-24 border-t border-white/5 bg-[#030014]">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-16 mb-20 text-center md:text-left">
            <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-600 to-violet-700 rounded-lg flex items-center justify-center">
                        <Zap className="text-white fill-white" size={16} />
                    </div>
                    <span className="text-lg font-bold tracking-tight">Vortex</span>
                </div>
                <p className="text-slate-500 font-medium max-w-sm leading-relaxed mx-auto md:mx-0">
                    The next-generation bot infrastructure. Built for efficiency, designed for safety, and powered by advanced artificial intelligence.
                </p>
                <div className="flex items-center gap-6 mt-10 justify-center md:justify-start">
                    <a href="#" className="p-3 bg-white/[0.03] rounded-xl text-slate-500 hover:text-white transition-all"><Twitter size={20} /></a>
                    <a href="#" className="p-3 bg-white/[0.03] rounded-xl text-slate-500 hover:text-white transition-all"><Github size={20} /></a>
                    <a href="#" className="p-3 bg-white/[0.03] rounded-xl text-slate-500 hover:text-white transition-all"><Mail size={20} /></a>
                </div>
            </div>

            <div>
                <h4 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.3em]">Protocol</h4>
                <ul className="space-y-4 text-sm font-medium text-slate-500">
                    <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                    <li><Link to="/premium" className="hover:text-white transition-colors">Elite Access</Link></li>
                    <li><Link to="/dashboard" className="hover:text-white transition-colors">Consoles</Link></li>
                    <li><a href="#" className="hover:text-white transition-colors">Bot Status</a></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.3em]">Resources</h4>
                <ul className="space-y-4 text-sm font-medium text-slate-500">
                    <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Support Guild</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">API Keys</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Legal Info</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 pt-10 border-t border-white/[0.02] flex flex-col md:flex-row items-center justify-between gap-6 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
            <p>© 2026 Vortex Protocol Group. All systems operational.</p>
            <div className="flex items-center gap-2">
                <Credits />
            </div>
            <div className="flex gap-8">
                All Systems Optimal
            </div>
        </div>
    </footer>
);

export default LandingPage;
