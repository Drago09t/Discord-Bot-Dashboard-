import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Server, Zap, Activity, PieChart, ArrowUp, ArrowDown } from 'lucide-react';

const AdminAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalServers: 0,
        totalMembers: 0,
        premiumAdoption: 0,
        topCommands: [],
        growthRate: 0
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get('/api/admin/premium/guilds');
            // Reusing the same endpoint for stats initially
            const logStats = await axios.get('/api/admin/logs/commands');

            setStats({
                totalServers: response.data.stats.servers,
                totalMembers: response.data.stats.members,
                premiumAdoption: (response.data.stats.premium / response.data.stats.servers * 100).toFixed(1),
                topCommands: Array.isArray(logStats.data.stats) ? logStats.data.stats : [],
                growthRate: '+12.5%' // Simulated placeholder
            });
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                    Pulse Analytics
                    <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse mt-1" />
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Global bot performance, growth metrics, and usage dynamics.</p>
            </motion.div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Network Scale', value: stats.totalServers, icon: <Server />, color: 'blue', trend: '+5' },
                    { label: 'Citizen Base', value: stats.totalMembers.toLocaleString(), icon: <Users />, color: 'emerald', trend: '+1.2k' },
                    { label: 'Advancement Rate', value: `${stats.premiumAdoption}%`, icon: <CrownIcon />, color: 'amber', trend: '+2%' },
                    { label: 'System Growth', value: stats.growthRate, icon: <TrendingUp />, color: 'pink', trend: 'Steady' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/[0.02] border border-white/5 p-8 rounded-[3.5rem] relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 p-8 text-${stat.color}-500/20 group-hover:scale-125 transition-transform duration-500`}>
                            {stat.icon}
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</span>
                            <div className="flex items-baseline gap-3 mt-1">
                                <h3 className="text-3xl font-black text-white tracking-tighter italic">{stat.value}</h3>
                                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{stat.trend}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Usage Distribution */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-10">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                            <Zap size={24} className="text-amber-500" />
                            Efficiency Overview
                        </h3>
                        <div className="flex gap-2">
                            <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">7 Days</div>
                            <div className="px-3 py-1 bg-amber-500 rounded-lg text-[10px] font-black text-black uppercase tracking-widest shadow-xl shadow-amber-500/20">30 Days</div>
                        </div>
                    </div>

                    <div className="h-[350px] flex items-end justify-between gap-4 px-4">
                        {[40, 65, 45, 90, 55, 75, 85, 30, 45, 60, 80, 70].map((h, i) => (
                            <div key={i} className="flex-1 group relative">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className="bg-gradient-to-t from-amber-500/20 to-amber-500/80 rounded-t-xl group-hover:to-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/5"
                                />
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] font-black px-2 py-1 rounded-lg pointer-events-none">
                                    {h}%
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 px-1 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                        <span>Jan 1</span>
                        <span>Jan 15</span>
                        <span>Jan 30</span>
                    </div>
                </motion.div>

                {/* Popular Modules */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-10 flex flex-col">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3 mb-10">
                        <Activity size={24} className="text-pink-500" />
                        Top Operations
                    </h3>

                    <div className="flex-1 space-y-6">
                        {stats.topCommands.map(([name, count], i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span className="text-white">{name}</span>
                                    <span>{count.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(count / stats.topCommands[0][1] * 100)}%` }}
                                        className="h-full bg-gradient-to-r from-pink-500 to-violet-500"
                                    />
                                </div>
                            </div>
                        ))}
                        {stats.topCommands.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                                <PieChart size={48} className="mb-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Awaiting interaction data</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const CrownIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>
);

export default AdminAnalytics;
