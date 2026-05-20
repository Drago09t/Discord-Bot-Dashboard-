import React from 'react';
import { motion } from 'framer-motion';
import {
    BarChart2,
    TrendingUp,
    Users,
    MessageCircle,
    Hash,
    ArrowUpRight,
    TrendingDown,
} from 'lucide-react';

const ActivityAnalytics = () => {
    const topUsers = [
        { name: 'ZephyrBot', messages: 1240, color: 'bg-primary' },
        { name: 'Astra', messages: 980, color: 'bg-accent-emerald' },
        { name: 'Vortex', messages: 850, color: 'bg-amber-500' },
        { name: 'Luna', messages: 720, color: 'bg-indigo-400' },
        { name: 'Nova', messages: 680, color: 'bg-rose-500' },
    ];

    const topChannels = [
        { name: 'general-chat', count: '12.4k' },
        { name: 'bot-commands', count: '8.2k' },
        { name: 'development', count: '5.1k' },
        { name: 'announcements', count: '2.4k' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl">Strategic Analytics</h2>
                    <p className="text-slate-400 mt-2">Visualize user engagement and channel activity trends.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Activity Chart */}
                <div className="lg:col-span-2 glass-card p-8">
                    <h3 className="flex items-center gap-2 mb-8">
                        <BarChart2 size={20} className="text-primary" />
                        Top Active Contributors
                    </h3>
                    <div className="space-y-8">
                        {topUsers.map((user, i) => (
                            <div key={user.name} className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-slate-300">{user.name}</span>
                                    <span className="text-slate-500">{user.messages} messages</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(user.messages / 1240) * 100}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className={`h-full ${user.color} rounded-full`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Channel Stats */}
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="flex items-center gap-2 mb-6 text-accent-emerald">
                            <Hash size={18} />
                            Hot Channels
                        </h3>
                        <div className="space-y-4">
                            {topChannels.map((channel, i) => (
                                <div key={channel.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-accent-emerald/10 flex items-center justify-center text-accent-emerald">
                                            <Hash size={14} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-300">#{channel.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold">{channel.count}</span>
                                        <ArrowUpRight size={14} className="text-slate-600 group-hover:text-accent-emerald transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-6 bg-gradient-to-br from-amber-500/10 to-transparent">
                        <h3 className="flex items-center gap-2 mb-4">
                            <TrendingUp size={18} className="text-amber-500" />
                            Growth Insight
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Your server saw a <span className="text-amber-500 font-bold">14.2%</span> increase in message volume during peak hours (8 PM - 11 PM) compared to last week.
                        </p>
                    </div>
                </div>
            </div>

            <div className="glass-card p-8">
                <h3 className="flex items-center gap-2 mb-8">
                    <Users size={20} className="text-primary" />
                    Member Retention
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: 'New Members', pulse: 'text-primary' },
                        { label: 'Return Rate', pulse: 'text-accent-emerald' },
                        { label: 'Churn Rate', pulse: 'text-rose-500' },
                    ].map(m => (
                        <div key={m.label} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${m.pulse.replace('text', 'bg')} animate-pulse mb-4 shadow-[0_0_12px_rgba(0,0,0,0.5)]`}></div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{m.label}</p>
                            <h4 className="text-3xl mt-2 tracking-tight">
                                {m.label === 'New Members' ? '241' : m.label === 'Return Rate' ? '68%' : '4.2%'}
                            </h4>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActivityAnalytics;
