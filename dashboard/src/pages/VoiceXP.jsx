import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Mic,
    Trophy,
    Save,
    Settings,
    Award,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';

const VoiceXP = ({ guild }) => {
    const [settings, setSettings] = useState({
        enabled: false,
        xp_per_minute: 1.0,
        level_multiplier: 100.0,
        reward_roles: []
    });
    const [leaderboard, setLeaderboard] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (guild?.id) {
            fetchData();
        }
    }, [guild?.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [settingsRes, lbRes, rolesRes] = await Promise.all([
                axios.get(`/api/voice-xp/settings/${guild.id}`),
                axios.get(`/api/voice-xp/leaderboard/${guild.id}`),
                axios.get(`/api/guild/${guild.id}/roles`)
            ]);
            setSettings(settingsRes.data);
            setLeaderboard(lbRes.data);
            setRoles(rolesRes.data);
        } catch (error) {
            console.error("Failed to fetch Voice XP data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`/api/voice-xp/settings/${guild.id}`, settings);
            alert('Voice XP settings saved!');
        } catch (error) {
            alert('Failed to save settings: ' + (error.response?.data?.error || error.message));
        } finally {
            setSaving(false);
        }
    };

    const addRewardRole = () => {
        setSettings({
            ...settings,
            reward_roles: [...(settings.reward_roles || []), { level: 1, role_id: '' }]
        });
    };

    const updateRewardRole = (index, field, value) => {
        const newRoles = [...(settings.reward_roles || [])];
        newRoles[index] = { ...newRoles[index], [field]: value };
        setSettings({ ...settings, reward_roles: newRoles });
    };

    const removeRewardRole = (index) => {
        const newRoles = settings.reward_roles.filter((_, i) => i !== index);
        setSettings({ ...settings, reward_roles: newRoles });
    };

    if (loading) return <div className="p-10 text-white">Loading Voice XP System...</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Mic className="text-purple-500" size={32} />
                        Voice XP & Rewards
                    </h1>
                    <p className="text-slate-400 mt-1">Reward members for being active in voice channels.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50"
                >
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Settings className="text-purple-400" size={24} />
                            <h2 className="text-xl font-bold text-white">System Configuration</h2>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <div>
                                <h3 className="font-bold text-white">Enable Voice Tracking</h3>
                                <p className="text-xs text-slate-400">Track voice activity and award XP automatically.</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                                className={`w-12 h-7 rounded-full transition-all ${settings.enabled ? 'bg-purple-500' : 'bg-slate-700'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-1 ml-1 ${settings.enabled ? 'translate-x-5' : ''}`} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase">XP per Minute</label>
                                <div className="relative">
                                    <Zap className="absolute left-3 top-2.5 text-yellow-500" size={16} />
                                    <input
                                        type="number"
                                        value={settings.xp_per_minute}
                                        onChange={(e) => setSettings({ ...settings, xp_per_minute: parseFloat(e.target.value) })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:border-purple-500 outline-none"
                                        step="0.1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase">Level Multiplier</label>
                                <div className="relative">
                                    <TrendingUp className="absolute left-3 top-2.5 text-blue-500" size={16} />
                                    <input
                                        type="number"
                                        value={settings.level_multiplier}
                                        onChange={(e) => setSettings({ ...settings, level_multiplier: parseFloat(e.target.value) })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500">XP required for Level N = N * Multiplier</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <Award className="text-yellow-400" size={24} />
                                <h2 className="text-xl font-bold text-white">Role Rewards</h2>
                            </div>
                            <button
                                onClick={addRewardRole}
                                className="text-xs bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-500/20 transition-colors"
                            >
                                + Add Reward
                            </button>
                        </div>

                        {(settings.reward_roles || []).length === 0 ? (
                            <p className="text-center py-6 text-slate-500 italic">No rewards configured. Add one to incentivize users!</p>
                        ) : (
                            <div className="space-y-3">
                                {settings.reward_roles.map((reward, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-400">Level</span>
                                            <input
                                                type="number"
                                                value={reward.level}
                                                onChange={(e) => updateRewardRole(i, 'level', parseInt(e.target.value))}
                                                className="w-16 bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-center"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <select
                                                value={reward.role_id}
                                                onChange={(e) => updateRewardRole(i, 'role_id', e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white text-sm"
                                            >
                                                <option value="">Select Role</option>
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id} style={{ color: r.color ? `#${r.color.toString(16)}` : 'white' }}>
                                                        {r.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <button onClick={() => removeRewardRole(i)} className="text-red-400 hover:text-red-300 p-2">
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Leaderboard Preview */}
                <div className="glass-card p-0 overflow-hidden">
                    <div className="p-6 bg-gradient-to-br from-purple-600/20 to-blue-600/10 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <Trophy className="text-yellow-400" size={24} />
                            <h2 className="text-xl font-bold text-white">Voice Leaderboard</h2>
                        </div>
                    </div>
                    <div className="p-4 max-h-[500px] overflow-y-auto space-y-2">
                        {leaderboard.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">No voice activity recorded yet.</div>
                        ) : (
                            leaderboard.map((user, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-slate-300 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-slate-400'}`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-white truncate text-sm">User ID: {user.user_id}</p>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 rounded">Lvl {user.level}</span>
                                            <span className="text-[10px] text-slate-500">{user.total_minutes} mins</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-xs text-yellow-500 font-bold">{Math.floor(user.total_xp).toLocaleString()} XP</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceXP;
