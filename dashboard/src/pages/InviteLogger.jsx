import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    UserPlus,
    MessageSquare,
    Hash,
    Save,
    AlertCircle,
    Settings,
    Bell,
    LogOut,
    PlusCircle,
    Info,
    BarChart3
} from 'lucide-react';

const InviteLogger = ({ guild }) => {
    const [settings, setSettings] = useState({
        enabled: true,
        logs_channel_id: '',
        count_channel_id: '',
        join_message: '{user} joined using invite code {code} from {inviter}. Total invites: {total}',
        leave_message: '{user} left. They were invited by {inviter}.',
    });
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (guild?.id) {
            fetchSettings();
            fetchChannels();
        }
    }, [guild?.id]);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`/api/invites/settings/${guild.id}`);
            if (res.data) setSettings(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch settings');
            setLoading(false);
        }
    };

    const fetchChannels = async () => {
        try {
            const res = await axios.get(`/api/guild/${guild.id}/channels`);
            setChannels(res.data.filter(c => c.type === 0 || c.type === 2)); // Text and Voice
        } catch (err) {
            console.error('Failed to fetch channels');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`/api/invites/settings/${guild.id}`, settings);
            alert('Settings saved successfully!');
        } catch (err) {
            console.error('Failed to save settings:', err);
            const errMsg = err.response?.data?.error || err.message;
            alert('Failed to save settings: ' + errMsg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading settings...</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <UserPlus className="text-blue-500" size={32} />
                        Invite Logger Setup
                    </h1>
                    <p className="text-slate-400 mt-1">Track who invited who and manage invite logs.</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                >
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Log Channels */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 space-y-6"
                    >
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Settings className="text-blue-400" size={24} />
                            <h2 className="text-xl font-bold text-white">Channel Configuration</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Bell size={14} className="text-blue-400" />
                                    Invite Logs Channel
                                </label>
                                <select
                                    value={settings.logs_channel_id || ''}
                                    onChange={(e) => setSettings({ ...settings, logs_channel_id: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 h-14 text-sm outline-none focus:border-blue-500/50 transition-all text-white appearance-none"
                                >
                                    <option value="">Disabled / Select a channel</option>
                                    {channels.filter(c => c.type === 0).map(c => (
                                        <option key={c.id} value={c.id}># {c.name}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-500 px-2 italic">Messages will be sent here when someone joins or leaves.</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <BarChart3 size={14} className="text-indigo-400" />
                                    Total Server Invites
                                </label>
                                <select
                                    value={settings.count_channel_id || ''}
                                    onChange={(e) => setSettings({ ...settings, count_channel_id: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 h-14 text-sm outline-none focus:border-indigo-500/50 transition-all text-white appearance-none"
                                >
                                    <option value="">Disabled / Select VC</option>
                                    {channels.filter(c => c.type === 2).map(c => (
                                        <option key={c.id} value={c.id}>🔊 {c.name}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-500 px-2 italic">Shows total uses of all invites.</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <UserPlus size={14} className="text-pink-400" />
                                    Inviter Status (Voice)
                                </label>
                                <select
                                    value={settings.status_channel_id || ''}
                                    onChange={(e) => setSettings({ ...settings, status_channel_id: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 h-14 text-sm outline-none focus:border-pink-500/50 transition-all text-white appearance-none"
                                >
                                    <option value="">Disabled / Select VC</option>
                                    {channels.filter(c => c.type === 2).map(c => (
                                        <option key={c.id} value={c.id}>🔊 {c.name}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-500 px-2 italic">Renames a voice channel to "@User has X invites".</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Hash size={14} className="text-emerald-400" />
                                    Inviter Status (Text)
                                </label>
                                <select
                                    value={settings.status_text_channel_id || ''}
                                    onChange={(e) => setSettings({ ...settings, status_text_channel_id: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 h-14 text-sm outline-none focus:border-emerald-500/50 transition-all text-white appearance-none"
                                >
                                    <option value="">Disabled / Select Channel</option>
                                    {channels.filter(c => c.type === 0).map(c => (
                                        <option key={c.id} value={c.id}># {c.name}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-500 px-2 italic">Sends "@user has X total invites now" to this channel.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Join/Leave Messages */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 space-y-6"
                    >
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <MessageSquare className="text-pink-400" size={24} />
                            <h2 className="text-xl font-bold text-white">Event Messages</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Join Message</label>
                                    <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold">JOIN</span>
                                </div>
                                <textarea
                                    value={settings.join_message || ''}
                                    onChange={(e) => setSettings({ ...settings, join_message: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[100px] text-sm outline-none focus:border-pink-500/50 transition-all text-white resize-none font-medium leading-relaxed"
                                    placeholder="Welcome {user}..."
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Leave Message</label>
                                    <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-[10px] font-bold">LEAVE</span>
                                </div>
                                <textarea
                                    value={settings.leave_message || ''}
                                    onChange={(e) => setSettings({ ...settings, leave_message: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[100px] text-sm outline-none focus:border-pink-500/50 transition-all text-white resize-none font-medium leading-relaxed"
                                    placeholder="{user} left..."
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Information Panel */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-[2rem] p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
                                <PlusCircle size={24} />
                            </div>
                            <h3 className="text-lg font-black text-white">Variables</h3>
                        </div>

                        <div className="space-y-4">
                            {[
                                { tag: '{user}', desc: 'The person who joined/left' },
                                { tag: '{inviter}', desc: 'The person who created the invite' },
                                { tag: '{code}', desc: 'The invite code used' },
                                { tag: '{total}', desc: 'Total regular invites of inviter' },
                                { tag: '{server}', desc: 'The server name' }
                            ].map((v, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-blue-500/30 transition-all">
                                    <code className="text-blue-400 text-xs font-black tracking-tighter">{v.tag}</code>
                                    <span className="text-[10px] text-slate-400 font-medium">{v.desc}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8">
                        <div className="flex items-center gap-3 mb-4 text-yellow-500">
                            <Info size={20} />
                            <h4 className="font-bold">Tips</h4>
                        </div>
                        <ul className="space-y-3 text-xs text-slate-400 leading-relaxed list-disc pl-4 italic">
                            <li>Invite codes created before the bot joined will still be tracked.</li>
                            <li>Leave messages will identify the original inviter.</li>
                            <li>The invite count channel automatically renames itself to show total server invites.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteLogger;
