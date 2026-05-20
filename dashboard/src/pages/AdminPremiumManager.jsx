import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Crown, Shield, Settings, Server, Users,
    Search, X, Check, AlertCircle, Trash2,
    Calendar, Star, Zap, Save, RefreshCw,
    Filter, Layout, Activity, Brain, UserPlus,
    Music, Gift, MessageSquare
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const AdminPremiumManager = () => {
    const { showNotification } = useNotification();
    const [stats, setStats] = useState({ servers: 0, members: 0, premium: 0 });
    const [guilds, setGuilds] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedGuild, setSelectedGuild] = useState(null);
    const [isDev, setIsDev] = useState(false);

    // Filters
    const [filter, setFilter] = useState('all'); // all, premium, normal

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/premium/guilds');
            setGuilds(response.data.guilds);
            setStats(response.data.stats);
            setIsDev(response.data.isAdmin);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
            showNotification('error', 'Could not load server list. Check the console for errors.', 'Connection Error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePremium = async (guildId, updates) => {
        setSaving(true);
        try {
            await axios.post(`/api/admin/premium/update/${guildId}`, updates);
            showNotification('success', 'Premium settings updated successfully.', 'Sync Complete');
            fetchAdminData();
            setSelectedGuild(null);
        } catch (error) {
            showNotification('error', 'Update failed. Please try again.', 'Error');
        } finally {
            setSaving(false);
        }
    };

    const handleRemovePremium = async (guildId) => {
        if (!confirm('Are you sure you want to terminate premium access for this cluster?')) return;
        setSaving(true);
        try {
            await axios.post(`/api/admin/premium/remove/${guildId}`);
            showNotification('success', 'Premium access terminated.', 'Access Revoked');
            fetchAdminData();
            setSelectedGuild(null);
        } catch (error) {
            showNotification('error', 'Termination failed.', 'Error');
        } finally {
            setSaving(false);
        }
    };

    const filteredGuilds = guilds.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.id.includes(search);
        if (filter === 'premium') return matchesSearch && g.premium?.premium_enabled;
        if (filter === 'normal') return matchesSearch && !g.premium?.premium_enabled;
        return matchesSearch;
    });

    if (!isDev && !loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-red-500/10 rounded-[3rem] flex items-center justify-center text-red-500 mb-8 border border-red-500/20">
                    <Shield size={40} />
                </div>
                <h2 className="text-4xl font-black text-white mb-4 italic uppercase tracking-tighter">Admin Access Only</h2>
                <p className="text-slate-500 max-w-sm font-medium">You do not have the required permissions to manage the Global Premium System.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] backdrop-blur-3xl relative overflow-hidden group">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                        <Crown className="text-amber-500" size={36} />
                        Premium Management Center
                    </h2>
                    <p className="text-slate-400 mt-2 font-medium">Manage premium features and status for all servers.</p>
                </div>
                <div className="grid grid-cols-3 gap-6 bg-black/40 p-6 rounded-[2rem] border border-white/5">
                    <div className="text-center px-4 border-r border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Servers</p>
                        <p className="text-2xl font-black text-white">{stats.servers}</p>
                    </div>
                    <div className="text-center px-4 border-r border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Premium</p>
                        <p className="text-2xl font-black text-amber-500">{stats.premium}</p>
                    </div>
                    <div className="text-center px-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Growth</p>
                        <p className="text-2xl font-black text-pink-500">MAX</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by ID or Server Name..."
                        className="w-full bg-white/[0.02] border border-white/5 p-5 pl-16 rounded-2xl text-white font-medium focus:outline-none focus:border-pink-500/30 transition-all shadow-inner"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5">
                    {['all', 'premium', 'normal'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-slate-500 hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <button
                    onClick={fetchAdminData}
                    className={`p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all ${loading ? 'animate-spin' : ''}`}
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Guild Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center">
                        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredGuilds.map((g, i) => (
                    <motion.div
                        key={g.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`glass-card p-1 relative overflow-hidden group/card ${g.premium?.premium_enabled ? 'border-amber-500/20' : ''}`}
                    >
                        <div className="p-7 relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-4">
                                    <img
                                        src={g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                        className="w-14 h-14 rounded-2xl border border-white/10 shadow-lg"
                                        alt=""
                                    />
                                    <div>
                                        <h3 className="text-lg font-bold text-white truncate w-32">{g.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${g.premium?.premium_enabled ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${g.premium?.premium_enabled ? 'text-amber-500' : 'text-slate-600'}`}>
                                                {g.premium?.premium_enabled ? `Tier ${g.premium.premium_tier}` : 'Standard'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {g.premium?.premium_enabled && <Crown className="text-amber-500" size={20} />}
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-500 uppercase tracking-widest text-[9px]">Server ID</span>
                                    <span className="text-slate-300 font-mono">{g.id}</span>
                                </div>
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-500 uppercase tracking-widest text-[9px]">Members</span>
                                    <span className="text-slate-300">{g.memberCount?.toLocaleString()}</span>
                                </div>
                                {g.premium?.premium_enabled && (
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-slate-500 uppercase tracking-widest text-[9px]">Expires</span>
                                        <span className="text-amber-500/80 italic">
                                            {g.premium.premium_expires_at ? new Date(g.premium.premium_expires_at).toLocaleDateString() : 'LIFETIME'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <button
                                    onClick={() => setSelectedGuild(g)}
                                    className="flex-1 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-white/5 active:scale-95"
                                >
                                    Modify Premium
                                </button>
                                {g.premium?.premium_enabled && (
                                    <button
                                        onClick={() => handleRemovePremium(g.id)}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-inner"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Background decoration */}
                        <div className={`absolute -right-10 -bottom-10 w-32 h-32 blur-[60px] opacity-10 -z-0 ${g.premium?.premium_enabled ? 'bg-amber-500' : 'bg-slate-500'}`} />
                    </motion.div>
                ))}
            </div>

            {/* Management Modal */}
            <AnimatePresence>
                {selectedGuild && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
                            onClick={() => setSelectedGuild(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-0 flex items-center justify-center p-6 z-[101] pointer-events-none"
                        >
                            <div
                                className="bg-[#0c0c0e] border border-white/10 p-10 rounded-[3rem] w-full max-w-2xl shadow-2xl pointer-events-auto overflow-hidden relative max-h-[90vh] overflow-y-auto custom-scrollbar"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] -z-10" />

                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500">
                                            <Star size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Premium Settings</h3>
                                            <p className="text-slate-500 font-medium text-sm">Server: {selectedGuild.name}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedGuild(null)} className="p-3 hover:bg-white/5 rounded-2xl transition-all active:scale-90">
                                        <X className="text-slate-500" />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {/* Premium Toggles */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block px-2">Select Premium Tier</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { id: 0, name: 'Normal User', icon: <Users size={20} />, active: !selectedGuild.premium?.premium_enabled },
                                                { id: 1, name: 'Premium Tier 1', icon: <Zap size={20} />, active: selectedGuild.premium?.premium_enabled && selectedGuild.premium.premium_tier === 1 },
                                                { id: 2, name: 'Ultra Premium', icon: <Crown size={20} />, active: selectedGuild.premium?.premium_enabled && selectedGuild.premium.premium_tier === 2 },
                                            ].map(tier => (
                                                <button
                                                    key={tier.id}
                                                    onClick={() => handleUpdatePremium(selectedGuild.id, {
                                                        premium_enabled: tier.id > 0,
                                                        premium_tier: tier.id,
                                                        unlimited_use: tier.id === 2
                                                    })}
                                                    className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${tier.active ? 'border-amber-500 bg-amber-500/5' : 'border-white/5 hover:bg-white/5 shadow-inner'}`}
                                                >
                                                    {tier.active && (
                                                        <div className="absolute top-0 right-0 py-1 px-3 bg-amber-500 text-black text-[8px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
                                                            Active
                                                        </div>
                                                    )}
                                                    <div className={tier.active ? 'text-amber-500' : 'text-slate-500'}>{tier.icon}</div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${tier.active ? 'text-white' : 'text-slate-600'}`}>{tier.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Feature Selection */}
                                    <div>
                                        <div className="flex justify-between items-end mb-4 px-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Server Premium Modules</label>
                                            <span className="text-[9px] font-bold text-amber-500/50 uppercase tracking-widest italic">Tier + Manual Override</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'automod', name: 'AutoMod System', icon: <Shield size={14} />, tiers: [2] },
                                                { id: 'ai', name: 'AI Chat System', icon: <Brain size={14} />, tiers: [2] },
                                                { id: 'welcome', name: 'Welcome System', icon: <UserPlus size={14} />, tiers: [1, 2] },
                                                { id: 'music', name: 'Music System', icon: <Music size={14} />, tiers: [1, 2] },
                                                { id: 'giveaway', name: 'Giveaway System', icon: <Gift size={14} />, tiers: [1, 2] },
                                                { id: 'logs', name: 'Logging System', icon: <Activity size={14} />, tiers: [1, 2] }
                                            ].map(f => {
                                                const guildTier = selectedGuild.premium?.premium_tier || 0;
                                                const isUnlockedByTier = f.tiers.includes(guildTier);
                                                const isManualUnlock = selectedGuild.premium?.features_unlocked?.includes(f.id);
                                                const isActive = isUnlockedByTier || isManualUnlock;

                                                return (
                                                    <button
                                                        key={f.id}
                                                        onClick={() => {
                                                            if (isUnlockedByTier) return; // Can't disable if tier provides it
                                                            const current = selectedGuild.premium?.features_unlocked || [];
                                                            const next = isManualUnlock ? current.filter(x => x !== f.id) : [...current, f.id];
                                                            handleUpdatePremium(selectedGuild.id, { features_unlocked: next });
                                                        }}
                                                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all relative overflow-hidden group/feature ${isActive
                                                            ? 'bg-amber-500/10 border-amber-500/20 text-white'
                                                            : 'bg-white/[0.02] border-white/5 text-slate-600 hover:text-slate-400'
                                                            } ${isUnlockedByTier ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                                                    >
                                                        <div className={isActive ? 'text-amber-500' : 'group-hover/feature:text-slate-400 transition-colors'}>
                                                            {f.icon}
                                                        </div>
                                                        <div className="flex flex-col items-start gap-0.5">
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{f.name}</span>
                                                            {isActive && (
                                                                <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-tighter">
                                                                    {isUnlockedByTier ? 'Unlocked by Tier' : 'Premium Active'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {isActive && <Check size={12} className="ml-auto text-amber-500 relative z-10" />}

                                                        {/* Subtle glow for active features */}
                                                        {isActive && (
                                                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 -translate-x-full group-hover/feature:translate-x-full transition-transform duration-1000" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex items-start gap-4">
                                        <AlertCircle className="text-amber-500 shrink-0" size={20} />
                                        <p className="text-xs text-amber-500/80 font-medium leading-relaxed italic">
                                            Changing premium status updates the server immediately. Standard servers will lose access to premium features.
                                        </p>
                                    </div>

                                    <button
                                        disabled={saving}
                                        onClick={() => setSelectedGuild(null)}
                                        className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {saving ? <RefreshCw className="animate-spin" /> : <Save size={20} />}
                                        Save Premium Settings
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPremiumManager;
