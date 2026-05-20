import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Zap, Shield, MessageSquare, Music, Trophy,
    ZapIcon, Sparkles, Rocket, ArrowRight,
    Lock, Heart, Globe, Search, Command,
    Settings, Users, BarChart3, Bot, Gavel,
    UserPlus, Activity, Headphones, Layers,
    ChevronRight
} from 'lucide-react';

const FeaturesPage = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        {
            title: "Moderation & Safety",
            icon: <Shield size={24} className="text-red-400" />,
            features: [
                { name: "Auto-Mod Elite", desc: "ML-powered spam and toxic content detection that learns your server's vibe.", status: "Live" },
                { name: "Anti-Raid System", desc: "Instant server lockdown during suspicious join floods or mass pings.", status: "Live" },
                { name: "Logging Protocol", desc: "Detailed audit logs for every action, from message edits to role changes.", status: "Alpha" },
                { name: "Warning System", desc: "Hierarchical system with automated punishments (Mute, Kick, Ban).", status: "Live" }
            ]
        },
        {
            title: "Artificial Intelligence",
            icon: <Sparkles size={24} className="text-violet-400" />,
            features: [
                { name: "AI Integration", desc: "Context-aware chat powered by advanced neural language models.", status: "Live" },
                { name: "AI Moderation", desc: "Smart analysis of image content and nuanced verbal harassment.", status: "Premium" },
                { name: "Custom Personalities", desc: "Give your bot a unique voice, from a helpful assistant to a witty companion.", status: "Premium" },
                { name: "Auto-Reply System", desc: "AI-generated answers for common community questions in real-time.", status: "Beta" }
            ]
        },
        {
            title: "Community & Fun",
            icon: <Trophy size={24} className="text-yellow-400" />,
            features: [
                { name: "Hyper-Leveling", desc: "Beautiful rank cards and XP system with custom multipliers.", status: "Live" },
                { name: "Support Tickets", desc: "Professional ticketing system with transcripts and private threads.", status: "Live" },
                { name: "Econ System", desc: "Virtual currency, shop, and server-wide items to drive engagement.", status: "Beta" },
                { name: "Minigames", desc: "Integrated games like Blackjack, Roulette, and Wordle.", status: "Upcoming" }
            ]
        }
    ];

    const filteredCategories = categories.map(cat => ({
        ...cat,
        features: cat.features.filter(f =>
            f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.desc.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.features.length > 0);

    return (
        <div className="min-h-screen bg-[#030014] text-white selection:bg-pink-500/30 overflow-x-hidden font-inter">
            {/* Premium Grain Overlay */}
            <div className="premium-grain" />

            {/* Background - Restored Boldness */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[180px]" />
            </div>

            <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-[#030014]/60 backdrop-blur-3xl">
                <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/10">
                            <Zap className="text-white fill-white" size={24} />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Vortex</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link to="/premium" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Premium</Link>
                        <Link to="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Home</Link>
                        <Link to="/dashboard" className="btn-premium px-6 py-2.5 !rounded-xl !text-xs">Go to Console</Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-48 pb-32 px-8">
                <div className="max-w-7xl mx-auto text-center mb-24">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl font-black mb-8 tracking-tighter"
                    >
                        Feature <span className="text-slate-600">Documentation</span>
                    </motion.h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium mb-12">
                        Explore every protocol and system module integrated into the Vortex engine.
                    </p>

                    <div className="relative max-w-xl mx-auto group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-pink-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find a feature..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 bg-white/[0.02] border border-white/5 rounded-[1.5rem] pl-16 pr-6 text-white text-lg focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500/20 transition-all placeholder:text-slate-700"
                        />
                    </div>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 gap-24">
                    <AnimatePresence>
                        {filteredCategories.map((cat, idx) => (
                            <motion.section
                                key={cat.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="flex items-center gap-4 mb-12">
                                    <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5">
                                        {cat.icon}
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-tight">{cat.title}</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {cat.features.map((feature, fIdx) => (
                                        <div
                                            key={feature.name}
                                            className="glass-card glass-card-hover p-8 group relative"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <h3 className="text-xl font-bold group-hover:text-pink-500 transition-colors uppercase tracking-tight">{feature.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${feature.status === 'Premium' ? 'bg-pink-500 text-white' : 'bg-white/10 text-slate-400'
                                                    }`}>
                                                    {feature.status}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-sm font-medium leading-relaxed">{feature.desc}</p>

                                            <div className="mt-8 pt-8 border-t border-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 flex items-center gap-2">
                                                    Read Whitepaper <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        ))}
                    </AnimatePresence>

                    {filteredCategories.length === 0 && (
                        <div className="py-32 text-center">
                            <h3 className="text-2xl font-bold text-slate-600">No matching protocols found.</h3>
                            <button onClick={() => setSearchQuery('')} className="mt-4 text-pink-500 font-bold hover:underline">Clear search</button>
                        </div>
                    )}
                </div>

                {/* Integration Info */}
                <div className="max-w-5xl mx-auto mt-48 rounded-[3rem] bg-white/[0.015] border border-white/5 p-20 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-pink-500 font-black text-[10px] uppercase tracking-[0.2em] mb-6">
                            <Layers size={14} />
                            Core Architecture
                        </div>
                        <h2 className="text-4xl font-bold mb-6">Developer Ready API </h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Integrate Vortex features directly into your own applications with our powerful Webhook and REST API systems. Available exclusively for Enterprise licensees.
                        </p>
                        <Link to="/premium" className="inline-flex items-center gap-3 mt-10 text-white font-bold hover:gap-5 transition-all">
                            View Enterprise Plans <ArrowRight size={20} />
                        </Link>
                    </div>
                    <div className="w-full md:w-80 h-80 bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/10 blur-[50px]" />
                        <div className="space-y-4 relative z-10">
                            <div className="w-full h-3 bg-white/5 rounded" />
                            <div className="w-[80%] h-3 bg-white/5 rounded" />
                            <div className="w-[60%] h-3 bg-white/5 rounded" />
                        </div>
                        <div className="p-4 bg-pink-500/10 rounded-xl border border-pink-500/20 text-pink-500 font-mono text-[10px] relative z-10">
                            GET /api/v1/system/status
                            <br />
                            {"{ status: 'optimal' }"}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-20 bg-[#030014] border-t border-white/5 mt-32">
                <div className="max-w-7xl mx-auto px-8 text-center">
                    <p className="text-slate-600 text-sm font-medium">© 2025 Vortex Protocol. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default FeaturesPage;
