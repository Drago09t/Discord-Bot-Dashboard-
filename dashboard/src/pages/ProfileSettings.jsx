import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save,
    User,
    Palette,
    Image as ImageIcon,
    Loader2,
    MessageSquare,
    Trophy,
    Zap,
    Twitter,
    Youtube,
    Globe,
    Link as LinkIcon,
    Flame,
    ExternalLink,
    ChevronRight,
    Layout
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const ProfileSettings = () => {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [profile, setProfile] = useState({
        bio: '',
        background_url: '',
        theme_color: '#6366f1',
        twitter_url: '',
        twitch_url: '',
        youtube_url: '',
        website_url: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/profile');
            setUser(response.data.user);
            setProfile(response.data.profile);
            setStats(response.data.stats);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            showNotification('error', 'Failed to synchronize user data with the cloud.', 'Sync Error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post('/api/profile/update', profile);
            showNotification('success', 'Your global identity has been updated across the network.', 'Identity Synced');
        } catch (error) {
            showNotification('error', 'Failed to broadcast profile updates.', 'Update Error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

    const socialLinks = [
        { id: 'twitter_url', label: 'Twitter / X', icon: <Twitter size={18} />, color: 'hover:text-[#1DA1F2]', placeholder: 'https://twitter.com/username' },
        { id: 'youtube_url', label: 'YouTube', icon: <Youtube size={18} />, color: 'hover:text-[#FF0000]', placeholder: 'https://youtube.com/@channel' },
        { id: 'twitch_url', label: 'Twitch', icon: <Flame size={18} />, color: 'hover:text-[#9146FF]', placeholder: 'https://twitch.tv/username' },
        { id: 'website_url', label: 'Personal Website', icon: <Globe size={18} />, color: 'hover:text-primary', placeholder: 'https://example.com' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-20 relative"
        >
            {/* Background Atmosphere */}
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -z-10" />
            <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-accent-purple/5 blur-[120px] rounded-full -z-10" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-4xl font-black bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent italic tracking-tight">Identity Nexus</h2>
                    <p className="text-slate-400 mt-2 font-medium">Refine your digital presence across all connected dimensions.</p>
                </div>
                <div className="glass-card px-4 py-2 border-primary/20 bg-primary/5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Universal Profile Linked</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Identification Section */}
                    <div className="glass-card p-10 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-white">Neural Identification</h3>
                                    <p className="text-xs text-slate-500 mt-1">Update your primary bio and personality matrix.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Bio Projection</label>
                                <span className="text-[10px] font-mono text-slate-600">{profile.bio?.length || 0} / 200</span>
                            </div>
                            <textarea
                                rows={4}
                                className="glass-input w-full resize-none p-6 font-medium text-slate-200 leading-relaxed focus:ring-1 focus:ring-primary/20"
                                placeholder="Broadcast your status to the network..."
                                value={profile.bio || ''}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                maxLength={200}
                            />
                        </div>
                    </div>

                    {/* Social Hub Section */}
                    <div className="glass-card p-10 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-accent-emerald/50" />

                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-accent-emerald/10 rounded-2xl text-accent-emerald border border-accent-emerald/20 group-hover:scale-110 transition-transform duration-500">
                                <LinkIcon size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-white">Social Uplinks</h3>
                                <p className="text-xs text-slate-500 mt-1">Connect your various digital platforms.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {socialLinks.map((link) => (
                                <div key={link.id} className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        {link.icon} {link.label}
                                    </label>
                                    <input
                                        type="text"
                                        className="glass-input w-full px-5 py-3 text-sm focus:border-accent-emerald/30"
                                        placeholder={link.placeholder}
                                        value={profile[link.id] || ''}
                                        onChange={(e) => setProfile({ ...profile, [link.id]: e.target.value })}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual Aesthetics Section */}
                    <div className="glass-card p-10 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-accent-purple/50" />

                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-accent-purple/10 rounded-2xl text-accent-purple border border-accent-purple/20 group-hover:scale-110 transition-transform duration-500">
                                <Palette size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-white">Universal Aesthetics</h3>
                                <p className="text-xs text-slate-500 mt-1">Customize the visual rendering of your identity.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                    <ImageIcon size={14} /> Neural Texture (Background URL)
                                </label>
                                <input
                                    type="text"
                                    className="glass-input w-full px-5 py-3 text-sm"
                                    placeholder="https://..."
                                    value={profile.background_url || ''}
                                    onChange={(e) => setProfile({ ...profile, background_url: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Aura Intensity (Theme Color)</label>
                                <div className="flex gap-4">
                                    <div className="relative w-14 h-12">
                                        <input
                                            type="color"
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                            value={profile.theme_color || '#6366f1'}
                                            onChange={(e) => setProfile({ ...profile, theme_color: e.target.value })}
                                        />
                                        <div
                                            className="w-full h-full rounded-xl border-2 border-white/5 shadow-inner"
                                            style={{ backgroundColor: profile.theme_color || '#6366f1' }}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        className="glass-input flex-1 px-5 py-3 uppercase font-mono text-xs tracking-[0.2em]"
                                        value={profile.theme_color || '#6366f1'}
                                        onChange={(e) => setProfile({ ...profile, theme_color: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/80 group text-white w-full rounded-2xl flex items-center justify-center gap-4 py-5 text-lg font-black tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={24} /> : <Save className="group-hover:rotate-12 transition-transform" size={24} />}
                        SYNCHRONIZE UNIVERSAL PROFILE
                    </button>
                </div>

                {/* Preview & Stats Column */}
                <div className="space-y-8 sticky top-8 h-fit">
                    {/* Identity Card Preview */}
                    <div className="glass-card p-0 border-white/5 overflow-hidden flex flex-col relative group/card">
                        <div className="h-32 relative overflow-hidden">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover/card:scale-110"
                                style={{
                                    backgroundImage: profile.background_url ? `url(${profile.background_url})` : 'none',
                                    backgroundColor: profile.background_url ? 'transparent' : '#1e1e2e'
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80" />
                        </div>

                        <div className="px-8 pb-8 -mt-12 relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-3xl p-1 mb-4 shadow-2xl rotate-3 group-hover/card:rotate-0 transition-transform duration-500" style={{ background: profile.theme_color || '#6366f1' }}>
                                <div className="w-full h-full rounded-[1.4rem] overflow-hidden bg-black/40">
                                    <img
                                        src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.png`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png' }}
                                    />
                                </div>
                                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-[#0F111A] bg-emerald-500" />
                            </div>

                            <h3 className="text-2xl font-black text-white tracking-tight">{user?.global_name || user?.username}</h3>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1 mb-6">@{user?.username}</span>

                            <div className="w-full h-[1px] bg-white/5 mb-6" />

                            <p className="text-slate-300 text-sm italic font-medium leading-relaxed text-center mb-8 px-4 opacity-80">
                                {profile.bio || "Searching for digital purpose..."}
                            </p>

                            {/* Dynamic Social Grid */}
                            <div className="flex gap-4 mb-8">
                                {socialLinks.filter(l => profile[l.id]).map(link => (
                                    <a
                                        key={link.id}
                                        href={profile[link.id]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 ${link.color} transition-all hover:scale-110 active:scale-90`}
                                    >
                                        {link.icon}
                                    </a>
                                ))}
                                {socialLinks.filter(l => profile[l.id]).length === 0 && (
                                    <div className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase tracking-widest opacity-40 italic">
                                        <Layout size={14} /> No Linked Platforms
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="bg-white/2 p-4 rounded-2xl border border-white/5 group/stat hover:border-primary/30 transition-all text-center">
                                    <MessageSquare size={16} className="text-slate-500 mb-2 mx-auto group-hover/stat:text-primary transition-colors" />
                                    <span className="block text-xl font-black text-white">{stats?.totalMessages?.toLocaleString() || '0'}</span>
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Universal MSGs</span>
                                </div>
                                <div className="bg-white/2 p-4 rounded-2xl border border-white/5 group/stat hover:border-accent-purple/30 transition-all text-center">
                                    <Trophy size={16} className="text-slate-500 mb-2 mx-auto group-hover/stat:text-accent-purple transition-colors" />
                                    <span className="block text-xl font-black text-white">{stats?.serverCount || '0'}</span>
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Active Nodes</span>
                                </div>
                            </div>
                        </div>

                        {/* Card Gloss */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none" />
                    </div>

                    {/* Meta Stats Section */}
                    <div className="glass-card p-8 bg-black/40 border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                            <Zap size={64} className="text-primary" />
                        </div>

                        <h4 className="flex items-center gap-3 mb-6 text-primary font-black text-xs uppercase tracking-[0.2em] italic">
                            <Layout size={16} /> Global Metrics
                        </h4>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-white/2 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <Flame size={14} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Apex Level</span>
                                </div>
                                <span className="text-lg font-black text-white italic">LVL {stats?.maxLevel || 0}</span>
                            </div>

                            <div className="flex justify-between items-center p-3 rounded-xl bg-white/2 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center text-accent-purple border border-accent-purple/20">
                                        <Trophy size={14} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregate XP</span>
                                </div>
                                <span className="text-lg font-black text-white font-mono">{stats?.totalXP?.toLocaleString() || '0'}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic text-center">
                                "Across all nodes of the FlexiX matrix, your legacy is calculated and persisted in real-time."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileSettings;
