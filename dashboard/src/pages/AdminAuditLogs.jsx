import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History,
    UserPlus,
    LogOut,
    Terminal,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    Shield,
    Calendar,
    Hash,
    User,
    Server,
    Zap,
    AlertCircle,
    Activity,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const AdminAuditLogs = () => {
    const [loading, setLoading] = useState(true);
    const [guildLogs, setGuildLogs] = useState([]);
    const [commandLogs, setCommandLogs] = useState([]);
    const [commandStats, setCommandStats] = useState([]);
    const [activeTab, setActiveTab] = useState('guilds');
    const [searchQuery, setSearchQuery] = useState('');
    const [isDev, setIsDev] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const [guildRes, commandRes] = await Promise.all([
                axios.get('/api/admin/logs/guilds'),
                axios.get('/api/admin/logs/commands')
            ]);
            setGuildLogs(guildRes.data.logs);
            setCommandLogs(commandRes.data.logs);
            setCommandStats(commandRes.data.stats);
            setIsDev(true); // Assuming admin if they can reach here, backend checks too
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = (activeTab === 'guilds' ? guildLogs : commandLogs).filter(log => {
        const query = searchQuery.toLowerCase();
        return (
            (log.guild_name?.toLowerCase().includes(query)) ||
            (log.guild_id?.toLowerCase().includes(query)) ||
            (log.user_id?.toLowerCase().includes(query)) ||
            (log.command_name?.toLowerCase().includes(query)) ||
            (log.action?.toLowerCase().includes(query))
        );
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-start"
                >
                    <div>
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                            Audit Logs
                            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse mt-1" />
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">Monitor real-time system activity and bot interactions.</p>
                    </div>
                </motion.div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Growth Events', value: guildLogs.length, icon: <Server size={18} />, color: 'blue' },
                    { label: 'Total Operations', value: commandLogs.length, icon: <Terminal size={18} />, color: 'amber' },
                    { label: 'Top Command', value: commandStats[0]?.[0] || 'None', icon: <Zap size={18} />, color: 'pink' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] flex items-center gap-6 group hover:bg-white/[0.04] transition-all"
                    >
                        <div className={`w-14 h-14 rounded-3xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500 transform group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-white mt-0.5">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Card */}
            <motion.div
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden"
            >
                {/* Custom Tabs */}
                <div className="flex border-b border-white/5">
                    <button
                        onClick={() => setActiveTab('guilds')}
                        className={`flex-1 py-6 font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 ${activeTab === 'guilds' ? 'text-amber-500 bg-amber-500/5' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                        <Server size={14} />
                        Network Transitions
                    </button>
                    <button
                        onClick={() => setActiveTab('commands')}
                        className={`flex-1 py-6 font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 ${activeTab === 'commands' ? 'text-amber-500 bg-amber-500/5' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                        <Terminal size={14} />
                        Command Pipeline
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-6 flex flex-col md:flex-row gap-4 border-b border-white/5">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by ID, User, or Action..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.04] transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-white/[0.02] border-b border-white/5">
                    <div className="col-span-1 text-[10px] font-black text-slate-600 uppercase tracking-widest">Type</div>
                    <div className="col-span-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">Subject</div>
                    <div className="col-span-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">Action</div>
                    <div className="col-span-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">Context Info</div>
                    <div className="col-span-3 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">Timestamp</div>
                </div>

                {/* Table Body */}
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((log, idx) => (
                            <div key={log.id || idx} className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                                <div className="col-span-1">
                                    {activeTab === 'guilds' ? (
                                        log.action === 'join' ? <ArrowUpRight className="text-emerald-500" size={18} /> : <ArrowDownLeft className="text-red-500" size={18} />
                                    ) : (
                                        <Hash className="text-blue-500" size={18} />
                                    )}
                                </div>
                                <div className="col-span-3">
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold truncate">{activeTab === 'guilds' ? log.guild_name : log.command_name}</span>
                                        <span className="text-[10px] text-slate-600 font-mono tracking-tighter truncate mt-0.5">{activeTab === 'guilds' ? log.guild_id : `cmd_${log.id?.substring(0, 8)}`}</span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${activeTab === 'guilds'
                                            ? log.action === 'join' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                            : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {activeTab === 'guilds' ? log.action : log.command_type}
                                    </span>
                                </div>
                                <div className="col-span-3">
                                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                                        {activeTab === 'guilds' ? (
                                            <>
                                                <User size={12} className="text-slate-700" />
                                                <span>{log.member_count?.toLocaleString()} Members</span>
                                            </>
                                        ) : (
                                            <>
                                                <User size={12} className="text-slate-700" />
                                                <span className="truncate">{log.user_id}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="col-span-3 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-slate-400 text-sm font-medium">{new Date(log.created_at).toLocaleDateString()}</span>
                                        <span className="text-slate-700 text-[10px] font-bold">{new Date(log.created_at).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-600 opacity-50">
                            <Activity size={48} className="mb-4" />
                            <p className="font-black uppercase tracking-[0.2em] text-[10px]">No interactions recorded</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Pagination Placeholder */}
            <div className="flex justify-center items-center gap-4">
                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                    <ChevronLeft size={18} />
                </button>
                <span className="text-[10px] font-black text-slate-700 tracking-widest">Page 1 of 1</span>
                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default AdminAuditLogs;
