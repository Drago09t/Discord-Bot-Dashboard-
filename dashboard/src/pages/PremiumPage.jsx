import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Zap, Check, Star, Crown, Shield,
    ZapIcon, Sparkles, Rocket, ArrowRight,
    Lock, Heart, Globe, MessageSquare
} from 'lucide-react';

const PremiumPage = () => {
    return (
        <div className="min-h-screen bg-[#030014] text-white selection:bg-pink-500/30 overflow-x-hidden font-inter">
            {/* Premium Grain Overlay */}
            <div className="premium-grain" />

            {/* Background elements - Restored Full Boldness */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/20 blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-700/20 blur-[150px]" />
            </div>

            <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-[#030014]/60 backdrop-blur-3xl">
                <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                            <Zap className="text-white fill-white" size={24} />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Vortex</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link to="/features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
                        <Link to="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Home</Link>
                        <Link to="/dashboard" className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all">Dashboard</Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-48 pb-32 px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                        <Crown size={12} className="fill-pink-500" />
                        Exclusive Protocol
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter line-height-1">
                        Unleash the <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-500">Ultimate Power</span>
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        Upgrade to Vortex Premium and transform your Discord community with elite features, superior performance, and priority AI processing.
                    </p>
                </motion.div>

                {/* Pricing Tiers */}
                <div className="max-w-7xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Free Tier */}
                    <PricingCard
                        name="Free"
                        price="$0"
                        description="Professional basics for growing communities."
                        features={['Basic Moderation', 'Standard AI (Gemini Flash)', 'Standard Leveling', '1 Ticket Panel']}
                        button="Current Plan"
                        isCurrent
                    />
                    {/* Premium Pro */}
                    <PricingCard
                        name="Premium Pro"
                        price="$4.99"
                        period="/month"
                        description="The full Vortex experience for power users."
                        features={['Advanced AI (Ultra Mode)', 'Priority Queue Music', 'Custom Level Cards', 'Unlimited Ticket Panels', 'Anti-Raid Shield+', '24/7 Voice Support']}
                        button="Upgrade to Pro"
                        highlighted
                    />
                    {/* Server License */}
                    <PricingCard
                        name="Enterprise"
                        price="$19.99"
                        period="/month"
                        description="Full scale protocol for massive networks."
                        features={['Whitelabel Dashboard', 'Dedicated Bot Instance', 'API Access', 'Custom AI Fine-tuning', 'Priority Admin Support', 'Advanced Logging (Long-term)']}
                        button="Contact Sales"
                    />
                </div>

                {/* Benefit Grid */}
                <div className="max-w-6xl mx-auto mt-48 text-left">
                    <h2 className="text-4xl font-bold mb-20 text-center">Why go Premium?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {[
                            { title: 'Zero Latency', desc: 'Hosted on enterprise-grade hardware with dedicated shards for premium servers.', icon: <ZapIcon className="text-pink-500" /> },
                            { title: 'Elite AI Engine', desc: 'Access the most powerful Gemini models with longer context and smarter responses.', icon: <Sparkles className="text-violet-500" /> },
                            { title: 'Full Branding', desc: 'Customize your rank cards, ticket embeds, and welcome messages without limits.', icon: <Heart className="text-red-500" /> },
                            { title: 'Global Sync', desc: 'Synchronize your settings across multiple servers instantly through our cloud bridge.', icon: <Globe className="text-blue-500" /> },
                            { title: 'Advanced Safety', desc: 'Our most aggressive anti-raid and link filtering protocols powered by machine learning.', icon: <Lock className="text-indigo-500" /> },
                            { title: 'VIP Support', desc: 'Get direct access to our staff through a private priority support channel.', icon: <MessageSquare className="text-amber-500" /> },
                        ].map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="space-y-4 group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-white/[0.06]">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-xl font-bold">{benefit.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm font-medium">{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <div className="mt-48 max-w-5xl mx-auto">
                    <div className="rounded-[3rem] bg-gradient-to-br from-pink-600/10 to-violet-700/10 border border-white/5 p-16 md:p-24 relative overflow-hidden text-center backdrop-blur-3xl group">
                        <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-pink-600/20 blur-[100px] transition-opacity opacity-50 group-hover:opacity-100" />
                        <h2 className="text-4xl md:text-6xl font-black mb-8">Join the Elite 1%</h2>
                        <p className="text-slate-400 mb-12 max-w-xl mx-auto text-lg font-medium">Elevate your Discord experience today. Satisfaction guaranteed or your credits back.</p>
                        <button className="px-10 py-5 bg-white text-black rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl shadow-white/10 flex items-center gap-3 mx-auto">
                            Start Premium <ArrowRight size={24} />
                        </button>
                    </div>
                </div>
            </main>

            <footer className="py-20 border-t border-white/5 bg-[#030014]">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                        <Zap size={20} className="text-pink-600 fill-pink-600" />
                        <span className="font-bold text-white tracking-tight">Vortex Premium</span>
                    </div>
                    <div className="flex gap-12 text-xs font-black uppercase tracking-[0.2em] text-slate-600">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <Link to="/features" className="hover:text-white transition-colors">Features</Link>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Policy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const PricingCard = ({ name, price, period = "", description, features, button, highlighted = false, isCurrent = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`p-10 rounded-[2.5rem] border flex flex-col items-start text-left transition-all duration-500 relative overflow-hidden backdrop-blur-3xl group ${highlighted
            ? 'bg-white/[0.04] border-pink-500/30 ring-1 ring-pink-500/20 shadow-2xl shadow-pink-500/10 scale-105 z-10'
            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.03] hover:border-white/10'
            }`}
    >
        {highlighted && (
            <div className="absolute top-6 right-6 px-3 py-1 bg-gradient-to-r from-pink-600 to-violet-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-pink-500/30">
                Most Popular
            </div>
        )}
        <h3 className={`text-xl font-bold mb-2 uppercase tracking-widest ${highlighted ? 'text-pink-500' : 'text-slate-400'}`}>{name}</h3>
        <div className="flex items-end gap-1 mb-4">
            <span className="text-5xl font-black text-white leading-none">{price}</span>
            <span className="text-slate-500 font-bold mb-1">{period}</span>
        </div>
        <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed">{description}</p>

        <div className="w-full space-y-4 mb-12 flex-1">
            {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${highlighted ? 'bg-pink-500/20 text-pink-500' : 'bg-white/5 text-slate-600'}`}>
                        <Check size={12} strokeWidth={4} />
                    </div>
                    <span className="text-sm font-bold text-slate-300">{f}</span>
                </div>
            ))}
        </div>

        <button className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isCurrent
            ? 'bg-white/[0.03] text-slate-500 border border-white/10 cursor-default'
            : highlighted
                ? 'bg-white text-black hover:scale-105 hover:bg-slate-200'
                : 'bg-white/[0.03] text-white border border-white/10 hover:bg-white/[0.08] hover:scale-105'
            }`}>
            {button}
            {!isCurrent && <ArrowRight size={18} />}
        </button>
    </motion.div>
);

export default PremiumPage;
