import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Youtube, Radio, Bell, Hash, MessageSquare,
    Trash2, Plus, AlertCircle, Save, ExternalLink,
    Clock, CheckCircle2, X
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const SocialSettings = ({ guild }) => {
    const { showNotification } = useNotification();
    const [notifications, setNotifications] = useState([]);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        platform: 'youtube',
        channelId: '',
        channelName: '',
        notificationChannelId: '',
        message: '{author} is now live on {platform}! {url}'
    });

    useEffect(() => {
        if (guild) {
            fetchData();
        }
    }, [guild]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [notifRes, chanRes] = await Promise.all([
                axios.get(`/api/social/${guild.id}`),
                axios.get(`/api/guild/${guild.id}/channels`)
            ]);
            setNotifications(notifRes.data.notifications);
            setChannels(chanRes.data.filter(c => c.type === 0 || c.type === 5)); // Text or News channels
        } catch (error) {
            console.error('Error fetching social data:', error);
            showNotification('error', 'Failed to load social configurations.', 'Sync Error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post('/api/social/add', {
                ...formData,
                guildId: guild.id
            });
            showNotification('success', 'Social alert established successfully.', 'Neural Link Active');
            setAddModalOpen(false);
            fetchData();
            setFormData({
                platform: 'youtube',
                channelId: '',
                channelName: '',
                notificationChannelId: '',
                message: '{author} is now live on {platform}! {url}'
            });
        } catch (error) {
            showNotification('error', 'Failed to establish social link.', 'Link Failure');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/social/remove/${id}`);
            setNotifications(notifications.filter(n => n.id !== id));
            showNotification('success', 'Social link terminated.', 'Link Severed');
        } catch (error) {
            showNotification('error', 'Failed to terminate link.', 'Error');
        }
    };

    const toggleStatus = async (notify) => {
        try {
            const newStatus = !notify.enabled;
            await axios.post(`/api/social/update/${notify.id}`, { enabled: newStatus });
            setNotifications(notifications.map(n => n.id === notify.id ? { ...n, enabled: newStatus } : n));
            showNotification('success', `Alert ${newStatus ? 'activated' : 'deactivated'}.`, 'Status Updated');
        } catch (error) {
            showNotification('error', 'Failed to update status.', 'Error');
        }
    };

    if (!guild) return <div className="text-slate-500 text-center py-20">No server selected</div>;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <Bell className="text-pink-500" size={32} />
                        Social Alerts
                    </h2>
                    <p className="text-slate-400 mt-2 font-medium">Auto-notifications for YouTube & Twitch creators</p>
                </div>
                <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 to-violet-700 text-white rounded-[1.5rem] font-bold hover:scale-105 transition-all shadow-xl shadow-pink-500/20 active:scale-95"
                >
                    <Plus size={20} />
                    Create New Alert
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="glass-card p-20 text-center flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-slate-600">
                        <Bell size={40} />
                    </div>
                    <div className="max-w-xs">
                        <h3 className="text-xl font-bold text-white">No active links</h3>
                        <p className="text-slate-500 mt-2 text-sm">Add your first YouTube or Twitch channel to start receiving automated live alerts.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {notifications.map((notify, index) => (
                        <motion.div
                            key={notify.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`glass-card p-8 border-l-4 ${notify.platform === 'youtube' ? 'border-l-red-500' : 'border-l-purple-500'} relative overflow-hidden`}
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${notify.platform === 'youtube' ? 'bg-red-500/10 text-red-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                        {notify.platform === 'youtube' ? <Youtube size={28} /> : <Radio size={28} />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            {notify.channel_name || notify.channel_id}
                                            {notify.enabled && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1.5 text-slate-500 text-sm font-medium">
                                            <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg uppercase text-[10px] tracking-widest border border-white/5">
                                                {notify.platform}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Hash size={14} />
                                                {channels.find(c => c.id === notify.notification_channel_id)?.name || 'Unknown Channel'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleStatus(notify)}
                                        className={`p-3 rounded-xl transition-all ${notify.enabled ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-500'}`}
                                    >
                                        <CheckCircle2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(notify.id)}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-black/40 rounded-2xl border border-white/5">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Message Template</p>
                                <p className="text-sm text-slate-300 italic font-medium leading-relaxed">
                                    {notify.message}
                                </p>
                            </div>

                            {/* Background decoration */}
                            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] -z-0 opacity-20 ${notify.platform === 'youtube' ? 'bg-red-500' : 'bg-purple-500'}`} />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Placeholder info */}
            <div className="glass-card p-10 bg-gradient-to-br from-indigo-950/20 to-transparent border-indigo-500/10">
                <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-6">
                    <AlertCircle className="text-indigo-400" />
                    How placeholders work
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { key: '{author}', desc: 'Channel name' },
                        { key: '{url}', desc: 'Link to stream/video' },
                        { key: '{platform}', desc: 'YouTube or Twitch' },
                        { key: '{title}', desc: 'Video/Stream title' },
                    ].map(p => (
                        <div key={p.key} className="bg-black/40 p-4 rounded-2xl border border-white/5">
                            <code className="text-pink-500 font-bold block mb-1">{p.key}</code>
                            <span className="text-xs text-slate-500 font-medium">{p.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                            onClick={() => setAddModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none"
                        >
                            <div
                                className="bg-[#0c0c0e] border border-white/10 p-10 rounded-[3rem] w-full max-w-xl shadow-2xl pointer-events-auto overflow-hidden relative"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-3xl font-black text-white">New Social Link</h3>
                                    <button onClick={() => setAddModalOpen(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors">
                                        <X className="text-slate-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleAdd} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, platform: 'youtube' })}
                                            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${formData.platform === 'youtube' ? 'border-red-500 bg-red-500/5' : 'border-white/5 hover:bg-white/5'}`}
                                        >
                                            <Youtube className={formData.platform === 'youtube' ? 'text-red-500' : 'text-slate-500'} size={32} />
                                            <span className={`text-sm font-black uppercase tracking-widest ${formData.platform === 'youtube' ? 'text-white' : 'text-slate-500'}`}>YouTube</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, platform: 'twitch' })}
                                            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${formData.platform === 'twitch' ? 'border-purple-500 bg-purple-500/5' : 'border-white/5 hover:bg-white/5'}`}
                                        >
                                            <Radio className={formData.platform === 'twitch' ? 'text-purple-500' : 'text-slate-500'} size={32} />
                                            <span className={`text-sm font-black uppercase tracking-widest ${formData.platform === 'twitch' ? 'text-white' : 'text-slate-500'}`}>Twitch</span>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block px-2">Channel ID / Username</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder={formData.platform === 'youtube' ? "UCxxxxxxxx..." : "username"}
                                                className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl text-white focus:outline-none focus:border-pink-500/50 transition-all font-medium"
                                                value={formData.channelId}
                                                onChange={e => setFormData({ ...formData, channelId: e.target.value })}
                                            />
                                            {formData.platform === 'youtube' && (
                                                <p className="text-[10px] text-slate-600 mt-2 px-2 italic">Use the "Channel ID" found in YouTube Advanced Settings.</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block px-2">Display Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. MrBeast"
                                                className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl text-white focus:outline-none focus:border-pink-500/50 transition-all font-medium"
                                                value={formData.channelName}
                                                onChange={e => setFormData({ ...formData, channelName: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block px-2">Notification Channel</label>
                                            <select
                                                required
                                                className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl text-white focus:outline-none focus:border-pink-500/50 transition-all font-medium appearance-none"
                                                value={formData.notificationChannelId}
                                                onChange={e => setFormData({ ...formData, notificationChannelId: e.target.value })}
                                            >
                                                <option value="" className="bg-[#0c0c0e]">Select a channel...</option>
                                                {channels.map(c => (
                                                    <option key={c.id} value={c.id} className="bg-[#0c0c0e]">#{c.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block px-2">Alert Message</label>
                                            <textarea
                                                className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl text-white focus:outline-none focus:border-pink-500/50 transition-all font-medium min-h-[100px]"
                                                value={formData.message}
                                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all active:scale-[0.98] shadow-2xl shadow-white/5 flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
                                    >
                                        {saving ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Save size={20} />}
                                        Initialize Link
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SocialSettings;
