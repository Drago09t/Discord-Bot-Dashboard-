import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Users, MessageCircle, Shield, Zap, TrendingUp,
    Clock, ArrowUpRight, ChevronRight, Activity,
    Gem, BarChart3, ArrowDownRight, Layout,
    Music, Sparkles, Brain, UserPlus, Gift,
    Settings, ExternalLink, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = ({ guild }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (guild) fetchData();
    }, [guild]);

    const fetchData = async () => {
        if (!refreshing) setLoading(true);
        try {
            const [statsRes, settingsRes] = await Promise.all([
                axios.get(`/api/stats/${guild.id}`),
                axios.get(`/api/settings/${guild.id}`)
            ]);
            setStats(statsRes.data);
            setSettings(settingsRes.data.settings);
        } catch (error) {
            console.error('Failed to fetch home data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (!guild) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-white/[0.03] border border-white/5 rounded-[3rem] flex items-center justify-center text-slate-700 mb-8 shadow-2xl">
                    <Layout size={40} />
                </div>
                <h3 className="text-4xl font-black text-white mb-4 tracking-tight">System Offline</h3>
                <p className="text-slate-500 max-w-sm text-lg font-medium">Please select a command center from the tactical overview to initialize neural links.</p>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Members',
            value: guild?.memberCount?.toLocaleString() || 'N/A',
            change: '+2.4%',
            icon: <Users size={20} />,
            color: 'text-blue-400',
            glow: 'bg-blue-500/20'
        },
        {
            label: 'Activity Score',
            value: stats?.topUsers?.reduce((acc, u) => acc + u.message_count, 0).toLocaleString() || '0',
            change: '+12.5%',
            icon: <TrendingUp size={20} />,
            color: 'text-pink-400',
            glow: 'bg-pink-500/20'
        },
        {
            label: 'System Uptime',
            value: '99.9%',
            change: 'Stable',
            icon: <Zap size={20} />,
            color: 'text-amber-400',
            glow: 'bg-amber-500/20'
        },
        {
            label: 'API Latency',
            value: '2ms',
            change: 'Optimal',
            icon: <Activity size={20} />,
            color: 'text-emerald-400',
            glow: 'bg-emerald-500/20'
        },
    ];

    const quickActions = [
        { name: 'AI Configuration', icon: <Sparkles size={18} />, path: '/dashboard/ai-chat', color: 'from-purple-500/20 to-pink-500/20' },
        { name: 'Server Security', icon: <Shield size={18} />, path: '/dashboard/automod', color: 'from-blue-500/20 to-cyan-500/20' },
        { name: 'Music Control', icon: <Music size={18} />, path: '/dashboard/music', color: 'from-orange-500/20 to-red-500/20' },
        { name: 'Engagement Logs', icon: <MessageCircle size={18} />, path: '/dashboard/logging', color: 'from-emerald-500/20 to-teal-500/20' },
    ];

    const modules = [
        { name: 'Auto Moderator', status: settings?.automod_enabled, icon: <Shield size={14} /> },
        { name: 'Welcome System', status: settings?.welcome_enabled, icon: <UserPlus size={14} /> },
        { name: 'Music Engine', status: true, icon: <Music size={14} /> },
        { name: 'XP & Leveling', status: true, icon: <Gem size={14} /> },
    ];

    return (
        <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
            {/* Command Header */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] backdrop-blur-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/10 blur-[120px] -z-10 group-hover:bg-pink-500/15 transition-all duration-700" />

                <div className="flex items-center gap-8">
                    <div className="relative">
                        <img
                            src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=256` : 'https://cdn.discordapp.com/embed/avatars/0.png'}
                            className="w-32 h-32 rounded-[2.5rem] shadow-2xl border-4 border-white/5 relative z-10"
                            alt=""
                        />
                        <div className="absolute -inset-4 bg-pink-500/20 blur-2xl rounded-full animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-emerald-500/20">System Online</span>
                            <span className="text-slate-500 text-xs font-medium">Cluster: NA-EAST-1</span>
                        </div>
                        <h1 className="text-6xl font-black text-white tracking-tighter leading-none mb-4">
                            {guild.name}
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed">
                            Welcome to the central command interface. Monitoring all telemetry and social interactions in real-time.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleRefresh}
                        className={`p-4 rounded-2xl bg-white/5 border border-white/10 text-white transition-all hover:bg-white/10 ${refreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button className="px-8 py-4 bg-white text-black rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-white/5 active:scale-95">
                        <Settings size={20} />
                        Global Config
                    </button>
                </div>
            </header>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, i) => (
                    <motion.button
                        key={action.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => navigate(action.path)}
                        className={`p-6 rounded-3xl bg-gradient-to-br ${action.color} border border-white/10 flex items-center justify-between group hover:scale-[1.02] transition-all text-left relative overflow-hidden`}
                    >
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                                {action.icon}
                            </div>
                            <span className="text-sm font-black text-white uppercase tracking-widest">{action.name}</span>
                        </div>
                        <ChevronRight className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" size={24} />

                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-all" />
                    </motion.button>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Statistics & Analytics */}
                <div className="xl:col-span-2 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {statCards.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className="glass-card p-10 group relative overflow-hidden"
                            >
                                <div className={`absolute -right-10 -top-10 w-40 h-40 ${stat.glow} blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                                <div className="flex justify-between items-start mb-10">
                                    <div className={`w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center ${stat.color} transition-transform duration-500 group-hover:scale-110 shadow-lg`}>
                                        {stat.icon}
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 border border-white/5 text-[10px] font-black uppercase tracking-widest ${stat.change === 'Stable' || stat.change === 'Optimal' || stat.change.includes('+') ? 'text-emerald-500' : 'text-pink-500'}`}>
                                        {stat.change.includes('+') ? <ArrowUpRight size={14} /> : null}
                                        {stat.change}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-slate-600 text-xs font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                    <h3 className="text-5xl font-black text-white tracking-tight">{stat.value}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Engagement Chart */}
                    <div className="glass-card p-10 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-12 relative z-10">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold text-white tracking-tight">Deployment Telemetry</h3>
                                <p className="text-slate-500 font-medium text-sm">Real-time interaction matrix across the cluster</p>
                            </div>
                            <div className="flex gap-3">
                                {['24H', '7D', '30D'].map(t => (
                                    <button key={t} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${t === '24H' ? 'bg-white text-black border-white shadow-xl shadow-white/5' : 'bg-white/[0.03] border-white/5 text-slate-500 hover:text-white'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-64 flex items-end gap-3 px-2 relative z-10">
                            {[45, 75, 55, 90, 65, 110, 85, 130, 95, 120, 70, 105, 55, 85, 60, 95, 50, 80, 65, 110].map((v, i) => (
                                <div key={i} className="flex-1 min-w-[12px] group relative h-full flex items-end">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(v / 140) * 100}%` }}
                                        transition={{ delay: i * 0.03, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                        className="w-full bg-gradient-to-t from-pink-600/10 to-pink-500 rounded-full group-hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all"
                                    />
                                    <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-bold text-pink-500">
                                        {v}u
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Area glow */}
                        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-pink-500/5 to-transparent -z-0" />
                    </div>
                </div>

                {/* Sidebar Metrics */}
                <div className="space-y-10">
                    {/* Top Entities */}
                    <div className="glass-card p-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5">
                                <Gem size={20} />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Top Contributors</h4>
                        </div>

                        <div className="space-y-6">
                            {stats?.topUsers?.slice(0, 5).map((user, i) => (
                                <div key={user.user_id} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-white/[0.03] transition-all cursor-default border border-transparent hover:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-white/10 flex items-center justify-center text-slate-500 font-bold group-hover:border-white/20 transition-all">
                                                {user.user_tag?.[0]?.toUpperCase() || '#'}
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-lg flex items-center justify-center text-[10px] font-black text-white border-2 border-[#0c0c0e]">
                                                {i + 1}
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-white truncate w-32">{user.user_tag || user.user_id.substring(0, 12)}</div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{user.message_count.toLocaleString()} Signals</div>
                                        </div>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-white transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <ExternalLink size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Infrastructure Modules */}
                    <div className="glass-card p-10 bg-gradient-to-b from-white/[0.02] to-transparent">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <Activity size={20} />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Cluster Modules</h4>
                        </div>

                        <div className="space-y-4">
                            {modules.map(module => (
                                <div key={module.name} className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 group hover:bg-black/40 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-lg bg-white/5 border border-white/5 text-slate-500 group-hover:text-white transition-colors`}>
                                            {module.icon}
                                        </div>
                                        <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">{module.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${module.status ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${module.status ? 'text-emerald-500' : 'text-slate-600'}`}>
                                            {module.status ? 'Active' : 'Standby'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Support Card */}
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-pink-600 to-violet-700 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-xl font-black mb-2 flex items-center gap-2">
                                <Zap fill="currentColor" size={24} />
                                Need Assistance?
                            </h4>
                            <p className="text-white/70 text-sm font-medium leading-relaxed mb-6">
                                Access our global support documentation or contact the tactical response team.
                            </p>
                            <button className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-2xl">
                                Support Portal
                            </button>
                        </div>
                        <Sparkles className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 group-hover:scale-125 transition-transform duration-1000" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
