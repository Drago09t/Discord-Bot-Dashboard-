import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Gift,
    Plus,
    Clock,
    Users,
    Trash2,
    CheckCircle,
    AlertCircle,
    Calendar,
    Trophy
} from 'lucide-react';

const GiveawayManager = ({ guild }) => {
    const [giveaways, setGiveaways] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [channels, setChannels] = useState([]);
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        prize: '',
        winners_count: 1,
        channel_id: '',
        end_time: '',
        requirements: {
            min_level: 0,
            required_role_id: ''
        }
    });

    useEffect(() => {
        if (guild?.id) {
            fetchGiveaways();
            fetchGuildData();
        }
    }, [guild?.id]);

    const fetchGiveaways = async () => {
        try {
            const res = await axios.get(`/api/giveaways/${guild.id}`);
            setGiveaways(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch giveaways", error);
        }
    };

    const fetchGuildData = async () => {
        try {
            const [channelsRes, rolesRes] = await Promise.all([
                axios.get(`/api/channels/${guild.id}`), // Ensure this endpoint returns text channels suitable for posting
                axios.get(`/api/guild/${guild.id}/roles`)
            ]);
            setChannels(channelsRes.data || []);
            setRoles(rolesRes.data || []);
        } catch (error) {
            console.error("Failed to fetch guild data", error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.channel_id) return alert('Please select a channel to post the giveaway.');
        if (!formData.end_time) return alert('Please select an end time.');

        try {
            // Validate end time is in future
            if (new Date(formData.end_time) <= new Date()) {
                return alert('End time must be in the future.');
            }

            await axios.post(`/api/giveaways/${guild.id}`, {
                ...formData,
                created_by: 'Dashboard Admin' // In real app, use logged in user
            });
            setShowCreate(false);
            fetchGiveaways();
            // Reset form
            setFormData({
                title: '',
                description: '',
                prize: '',
                winners_count: 1,
                channel_id: '',
                end_time: '',
                requirements: { min_level: 0, required_role_id: '' }
            });
            alert('Giveaway created successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to create giveaway');
        }
    };

    const handleEnd = async (id) => {
        if (!window.confirm('Are you sure you want to end this giveaway early?')) return;
        try {
            await axios.delete(`/api/giveaways/${guild.id}/${id}`);
            fetchGiveaways();
            alert('Giveaway ended and winners picked!');
        } catch (error) {
            alert('Failed to end giveaway');
        }
    };

    if (loading) return <div className="p-10 text-white animate-pulse">Loading Giveaways...</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Gift className="text-pink-500" size={32} />
                        Giveaway Manager
                    </h1>
                    <p className="text-slate-400 mt-1">Run engaging giveaways with automated winner selection.</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-pink-500/20"
                >
                    <Plus size={20} />
                    Create Giveaway
                </button>
            </div>

            {/* Create Modal/Form */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-pink-500/10">
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center border-b border-white/10 pb-6">
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Gift className="text-pink-500" />
                                    New Giveaway
                                </h2>
                                <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400">Title</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Monthly Nitro Drop"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-pink-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400">Prize</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. $10 Gift Card"
                                            value={formData.prize}
                                            onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-pink-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400">Description (Optional)</label>
                                    <textarea
                                        placeholder="Use this space to describe the giveaway..."
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-pink-500 outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400">Win Channel</label>
                                        <select
                                            required
                                            value={formData.channel_id}
                                            onChange={(e) => setFormData({ ...formData, channel_id: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 focus:border-pink-500 outline-none [&>option]:bg-slate-900"
                                        >
                                            <option value="">Select Channel...</option>
                                            {channels.map(c => (
                                                <option key={c.id} value={c.id}>#{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400">End Time</label>
                                        <input
                                            required
                                            type="datetime-local"
                                            value={formData.end_time}
                                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-pink-500 outline-none [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                                    <h4 className="font-bold text-white flex items-center gap-2"><CheckCircle size={16} className="text-emerald-400" /> Requirements</h4>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400">Winners Count</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.winners_count}
                                                onChange={(e) => setFormData({ ...formData, winners_count: parseInt(e.target.value) })}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-pink-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400">Min Level</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.requirements.min_level}
                                                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, min_level: parseInt(e.target.value) } })}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-pink-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400">Required Role</label>
                                            <select
                                                value={formData.requirements.required_role_id}
                                                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, required_role_id: e.target.value } })}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white/90 focus:border-pink-500 outline-none [&>option]:bg-slate-900"
                                            >
                                                <option value="">None</option>
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id} style={{ color: r.color ? `#${r.color.toString(16)}` : 'white' }}>
                                                        {r.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-3">
                                    <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-4 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition-all">Cancel</button>
                                    <button type="submit" className="flex-[2] py-4 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/20 hover:scale-[1.02] transition-all">Launch Giveaway</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Giveaways List */}
            <div className="grid gap-6">
                {giveaways.length === 0 ? (
                    <div className="glass-card p-10 text-center space-y-4">
                        <Gift className="mx-auto text-slate-600" size={48} />
                        <h3 className="text-xl font-bold text-white">No Giveaways Yet</h3>
                        <p className="text-slate-400">Create your first giveaway to start rewarding your community!</p>
                    </div>
                ) : (
                    giveaways.map(g => {
                        const isActive = g.status === 'active';
                        const TimeRemaining = () => {
                            const end = new Date(g.end_time);
                            const now = new Date();
                            const diff = end - now;
                            if (diff <= 0) return 'Ended';
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            const days = Math.floor(hours / 24);
                            if (days > 0) return `${days}d ${hours % 24}h left`;
                            return `${hours}h ${mins}m left`;
                        };

                        return (
                            <div key={g.id} className={`glass-card p-6 relative group overflow-hidden ${!isActive ? 'opacity-70 grayscale-[0.8] hover:grayscale-0 transition-all' : ''}`}>
                                <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-xs font-bold ${isActive ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-white'}`}>
                                    {isActive ? 'ACTIVE' : 'ENDED'}
                                </div>

                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${isActive ? 'bg-gradient-to-br from-pink-500 to-rose-600' : 'bg-slate-800'}`}>
                                            🎁
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white">{g.title}</h3>
                                            <p className="text-pink-400 font-bold flex items-center gap-2">
                                                <Trophy size={14} />
                                                Prize: {g.prize}
                                            </p>
                                            <div className="flex gap-4 mt-2 text-xs font-medium text-slate-400">
                                                <span className="flex items-center gap-1"><Users size={12} /> {g.winners_count} Winner(s)</span>
                                                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(g.end_time).toLocaleDateString()}</span>
                                                {g.requirements?.min_level > 0 && (
                                                    <span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 rounded">
                                                        Req: Lvl {g.requirements.min_level}+
                                                    </span>
                                                )}
                                                {g.requirements?.required_role_id && (
                                                    <span className="flex items-center gap-1 bg-purple-500/10 text-purple-400 px-2 rounded">
                                                        Req: Role
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        {isActive ? (
                                            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                                <span className="text-sm font-bold text-white flex items-center gap-2">
                                                    <Clock size={16} className="text-emerald-400 animate-pulse" />
                                                    <TimeRemaining />
                                                </span>
                                                <button
                                                    onClick={() => handleEnd(g.id)}
                                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl text-sm font-bold transition-all border border-red-500/20"
                                                >
                                                    End Now
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-right">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase">Winners</h4>
                                                <div className="flex -space-x-2 mt-1">
                                                    {(g.winners || []).map((w, i) => (
                                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[#0a0a0a] flex items-center justify-center text-xs text-white" title={w}>
                                                            ?
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default GiveawayManager;
