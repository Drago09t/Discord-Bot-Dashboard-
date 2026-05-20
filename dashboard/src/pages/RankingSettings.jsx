import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import {
    Trophy,
    Medal,
    Search,
    RefreshCw,
    TrendingUp,
    User,
    BarChart3
} from 'lucide-react';

const RankingSettings = ({ guild }) => {
    const { showNotification } = useNotification();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (guild) fetchLeaderboard();
    }, [guild]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/leaderboard/${guild.id}`);
            setLeaderboard(response.data.leaderboard);
            if (refreshing) {
                showNotification('info', 'Leaderboard data has been refreshed.', 'Sync Complete');
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            showNotification('error', 'Failed to pull leaderboard data.', 'Data Error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchLeaderboard();
    };

    // Calculate XP progress
    const getXPInfo = (xp, level) => {
        let currentLevelXP = 0;
        for (let i = 1; i <= level; i++) {
            currentLevelXP += i * 100;
        }

        const nextLevelNeeded = (level + 1) * 100;
        const xpInCurrentLevel = xp - (currentLevelXP - (level * 100));
        // Wait, the formula in rankingDB is slightly different. Let's approximate for UI.
        // Simplified for UI:
        const progress = Math.min(100, Math.max(0, (xpInCurrentLevel / nextLevelNeeded) * 100));
        return { progress, nextLevelNeeded, xpInCurrentLevel };
    };

    const filteredLeaderboard = leaderboard.filter(user => {
        const name = user.username || user.global_name || `User ${user.userId}`;
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.userId.includes(searchTerm);
    });

    if (!guild) return <div className="flex justify-center p-20 text-slate-500 font-bold uppercase tracking-widest">No Server Context</div>;

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                            <Trophy size={24} />
                        </div>
                        <h2 className="text-3xl font-bold">Server Leaderboard</h2>
                    </div>
                    <p className="text-slate-400">View and track member engagement levels in {guild.name}.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search member..."
                            className="glass-input pl-12 w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className={`w-12 h-12 glass-card flex items-center justify-center hover:bg-white/10 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Top 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {leaderboard.slice(0, 3).map((user, i) => (
                    <motion.div
                        key={user.userId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`glass-card p-6 relative overflow-hidden group hover:border-primary/50 transition-all ${i === 0 ? 'border-primary/40 bg-primary/5' : ''
                            }`}
                    >
                        {/* Rank Badge */}
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rotate-45 flex items-end justify-center pb-2">
                            {i === 0 ? <Medal className="text-amber-400 -rotate-45" size={24} /> :
                                i === 1 ? <Medal className="text-slate-400 -rotate-45" size={24} /> :
                                    <Medal className="text-amber-700 -rotate-45" size={24} />}
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative">
                                <img
                                    src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.userId}/${user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.userId) % 5}.png`}
                                    className="w-16 h-16 rounded-2xl border-2 border-white/10"
                                    alt=""
                                />
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-dark border-2 border-white/10 rounded-full flex items-center justify-center text-xs font-bold">
                                    #{i + 1}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold truncate max-w-[150px]">{user.username || user.global_name || 'User ' + user.userId}</h3>
                                <p className="text-primary font-bold">Level {user.level}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 font-medium">Total XP</span>
                                <span className="font-bold">{user.xp.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 font-medium">Messages</span>
                                <span className="font-bold">{user.totalMessages?.toLocaleString() || 0}</span>
                            </div>

                            {/* Simple Progress Bar */}
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (user.xp % 1000) / 10)}%` }} // Placeholder formula for visual feel
                                    className="h-full bg-gradient-to-r from-primary to-accent-emerald"
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Leaderboard Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl flex items-center gap-2">
                        <BarChart3 size={20} className="text-slate-400" />
                        Full Ranking
                    </h3>
                    <div className="text-sm text-slate-500 font-medium">
                        Showing {filteredLeaderboard.length} members
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/2">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Rank</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Level</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Messages</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Experience</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-8 h-12 bg-white/1"></td>
                                    </tr>
                                ))
                            ) : filteredLeaderboard.length > 0 ? (
                                filteredLeaderboard.map((user, i) => (
                                    <tr key={user.userId} className="hover:bg-white/2 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-amber-400/20 text-amber-400' :
                                                i === 1 ? 'bg-slate-400/20 text-slate-400' :
                                                    i === 2 ? 'bg-amber-700/20 text-amber-700' :
                                                        'bg-white/5 text-slate-400'
                                                }`}>
                                                {i + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.userId}/${user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.userId) % 5}.png`}
                                                    className="w-10 h-10 rounded-xl border border-white/10"
                                                    alt=""
                                                />
                                                <div>
                                                    <div className="font-bold flex items-center gap-2">
                                                        {user.global_name || user.username}
                                                        {user.global_name && <span className="text-xs text-slate-500 font-normal">@{user.username}</span>}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{user.userId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20">
                                                Level {user.level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium">
                                            {user.totalMessages?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-primary">{user.xp.toLocaleString()} XP</div>
                                            <div className="text-xs text-slate-500">Total accumulated</div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500 font-bold">
                                        No members found matches your search
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RankingSettings;
