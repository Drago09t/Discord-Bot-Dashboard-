import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus,
    UserMinus,
    Eye,
    Save,
    Info,
    ChevronDown,
    Loader2,
    Zap,
    Copy,
    Plus
} from 'lucide-react';
import ChannelSelector from '../components/ChannelSelector';
import { useNotification } from '../context/NotificationContext';



const WelcomeSettings = ({ guild }) => {
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('welcome');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        if (guild) fetchSettings();
    }, [guild]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/settings/${guild.id}`);
            setSettings(response.data.settings);
        } catch (error) {
            console.error('Failed to fetch welcome settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`/api/settings/${guild.id}/update`, settings);
            showNotification('success', 'Your server protocols have been updated across all dimensions.', 'Protocols Saved');
        } catch (error) {
            showNotification('error', 'Failed to synchronize protocols with the neural network.', 'Sync Error');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (!guild) return <div className="flex justify-center p-20 text-slate-500 font-bold uppercase tracking-widest">No Server Context</div>;
    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-20 relative"
        >
            {/* Background Glows */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -z-10" />
            <div className="absolute top-1/2 -right-20 w-96 h-96 bg-accent-emerald/5 blur-[120px] rounded-full -z-10" />

            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-4xl font-black bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">Portal Configuration</h2>
                    <div className="flex items-center gap-2">
                        <p className="text-slate-400 mt-2 font-medium">Manage member entry and exit protocols for {guild.name}.</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Environment: Stable</span>
                    <span className="text-[10px] text-red-400/60 font-mono">GID: {guild.id}</span>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Tabs */}
                    <div className="glass-card p-1.5 flex gap-1 bg-white/2">
                        <button
                            onClick={() => setActiveTab('welcome')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all relative overflow-hidden ${activeTab === 'welcome' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {activeTab === 'welcome' && (
                                <motion.div layoutId="activeTab" className="absolute inset-0 bg-primary shadow-lg shadow-primary/20" />
                            )}
                            <UserPlus size={18} className="relative z-10" />
                            <span className="relative z-10">Welcome Protocol</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('goodbye')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all relative overflow-hidden ${activeTab === 'goodbye' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {activeTab === 'goodbye' && (
                                <motion.div layoutId="activeTab" className="absolute inset-0 bg-rose-500 shadow-lg shadow-rose-500/20" />
                            )}
                            <UserMinus size={18} className="relative z-10" />
                            <span className="relative z-10">Goodbye Protocol</span>
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-8"
                        >
                            {/* Basic Settings */}
                            <div className="glass-card p-8 space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10 rounded-full" />

                                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                    <div>
                                        <h3 className="font-bold text-xl text-white">Transmission Protocol</h3>
                                        <p className="text-xs text-slate-500 mt-1">Configure automated broadcast parameters.</p>
                                    </div>
                                    <button
                                        onClick={() => updateSetting(activeTab === 'welcome' ? 'welcome_enabled' : 'goodbye_enabled', !(activeTab === 'welcome' ? settings.welcome_enabled : settings.goodbye_enabled))}
                                        className={`w-14 h-7 rounded-full relative transition-all duration-300 ${(activeTab === 'welcome' ? settings.welcome_enabled : settings.goodbye_enabled) ? 'bg-primary' : 'bg-white/10'}`}
                                    >
                                        <motion.div
                                            animate={{ x: (activeTab === 'welcome' ? settings.welcome_enabled : settings.goodbye_enabled) ? 28 : 4 }}
                                            className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                                        />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Target Frequency (Channel)</label>
                                        <ChannelSelector
                                            guildId={guild.id}
                                            value={activeTab === 'welcome' ? settings.welcome_channel_id : settings.goodbye_channel_id}
                                            onChange={(id) => updateSetting(activeTab === 'welcome' ? 'welcome_channel_id' : 'goodbye_channel_id', id)}
                                            placeholder={activeTab === 'welcome' ? "Select welcome channel" : "Select goodbye channel"}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Data Payload (Message Template)</label>
                                        <span className="text-[10px] text-slate-600 font-mono">Variable Injection: Enabled</span>
                                    </div>
                                    <textarea
                                        rows={6}
                                        className="glass-input w-full resize-none font-mono text-sm leading-relaxed p-6 focus:ring-1 focus:ring-primary/20"
                                        value={activeTab === 'welcome' ? settings.welcome_message || '' : settings.goodbye_message || ''}
                                        onChange={(e) => updateSetting(activeTab === 'welcome' ? 'welcome_message' : 'goodbye_message', e.target.value)}
                                        placeholder="Enter the transmission content..."
                                    />
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {['{user}', '{server}', '{membercount}', '{user.tag}'].map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => {
                                                    const key = activeTab === 'welcome' ? 'welcome_message' : 'goodbye_message';
                                                    updateSetting(key, (settings[key] || '') + tag);
                                                    showNotification('info', `Injected ${tag} into template.`, 'Variable Active');
                                                }}
                                                className="text-[10px] font-bold bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-primary/5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-primary transition-all active:scale-95 flex items-center gap-1.5 group/tag"
                                            >
                                                {tag}
                                                <Plus size={10} className="opacity-0 group-hover/tag:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Image Card (Only for Welcome) */}
                            {activeTab === 'welcome' && (
                                <div className="glass-card p-8 space-y-8 border-primary/10 bg-primary/2 relative overflow-hidden group">
                                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />

                                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                                                <Zap size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl text-white">Visual Interface Card</h3>
                                                <p className="text-xs text-slate-500 mt-1">Dynamic generation of high-fidelity welcome cards.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => updateSetting('welcome_card_enabled', !settings.welcome_card_enabled)}
                                            className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.welcome_card_enabled ? 'bg-primary' : 'bg-white/10'}`}
                                        >
                                            <motion.div
                                                animate={{ x: settings.welcome_card_enabled ? 28 : 4 }}
                                                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                                            />
                                        </button>
                                    </div>

                                    <motion.div
                                        animate={{ opacity: settings.welcome_card_enabled ? 1 : 0.3, pointerEvents: settings.welcome_card_enabled ? 'auto' : 'none' }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                                    >
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Matrix Texture (Background URL)</label>
                                            <input
                                                type="text"
                                                className="glass-input w-full px-5 py-3"
                                                placeholder="https://..."
                                                value={settings.welcome_background_url || ''}
                                                onChange={(e) => updateSetting('welcome_background_url', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Interface Color (Text Color)</label>
                                            <div className="flex gap-4">
                                                <div className="relative group/color w-14 h-11">
                                                    <input
                                                        type="color"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        value={settings.welcome_text_color || '#ffffff'}
                                                        onChange={(e) => updateSetting('welcome_text_color', e.target.value)}
                                                    />
                                                    <div
                                                        className="w-full h-full rounded-xl border-2 border-white/10 transition-all group-hover/color:border-white/30"
                                                        style={{ backgroundColor: settings.welcome_text_color || '#ffffff' }}
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="glass-input flex-1 uppercase font-mono text-xs tracking-widest"
                                                    value={settings.welcome_text_color || '#ffffff'}
                                                    onChange={(e) => updateSetting('welcome_text_color', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            )}

                            {/* DM Settings (Only for Welcome) */}
                            {activeTab === 'welcome' && (
                                <div className="glass-card p-8 space-y-8 relative overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 border border-white/5">
                                                <UserPlus size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl text-white">Private Uplink (DM)</h3>
                                                <p className="text-xs text-slate-500 mt-1">Direct transmission to newly initialized members.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => updateSetting('welcome_dm_enabled', !settings.welcome_dm_enabled)}
                                            className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.welcome_dm_enabled ? 'bg-primary' : 'bg-white/10'}`}
                                        >
                                            <motion.div
                                                animate={{ x: settings.welcome_dm_enabled ? 28 : 4 }}
                                                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                                            />
                                        </button>
                                    </div>

                                    <motion.div
                                        animate={{ opacity: settings.welcome_dm_enabled ? 1 : 0.3, pointerEvents: settings.welcome_dm_enabled ? 'auto' : 'none' }}
                                        className="space-y-4"
                                    >
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Private Payload Template</label>
                                        <textarea
                                            rows={4}
                                            className="glass-input w-full resize-none font-mono text-sm p-4"
                                            value={settings.welcome_dm_message || ''}
                                            onChange={(e) => updateSetting('welcome_dm_message', e.target.value)}
                                        />
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-primary hover:bg-primary/80 text-white w-full rounded-2xl flex items-center justify-center gap-3 py-5 text-lg font-black tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                            EXECUTE PROTOCOL UPDATE
                        </button>
                    </div>
                </div>

                <div className="space-y-8 sticky top-8 h-fit">
                    <div className="glass-card p-0 border-white/5 overflow-hidden flex flex-col relative">
                        <div className="p-5 border-b border-white/5 bg-white/2 flex items-center justify-between">
                            <h4 className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                                <Eye size={16} />
                                Neural Interface Preview
                            </h4>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                            </div>
                        </div>

                        {/* Immersive Discord Preview */}
                        <div className="bg-[#313338] p-8 space-y-4 font-['gg_sans',_'Noto_Sans',_sans-serif]">
                            <div className="flex items-center gap-2 text-[#949ba4] text-[10px] font-bold tracking-widest border-b border-[#ffffff]/[0.02] pb-4 mb-6">
                                <span className="uppercase">Transmission Signal Detected</span>
                                <div className="flex-1 h-[1px] bg-[#ffffff]/[0.05]" />
                                <span>TODAY at 4:20 PM</span>
                            </div>

                            <div className="flex gap-4 group/msg">
                                <div className="flex-shrink-0 relative">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#5865f2] border-2 border-[#ffffff]/5">
                                        <img src="/bot-avatar.png" alt="Bot" className="w-full h-full object-cover opacity-80" onError={(e) => e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'} />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#23a55a] border-2 border-[#313338]" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold text-white hover:underline cursor-pointer">Bot Manager</span>
                                        <span className="bg-[#5865f2] text-white text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter scale-90">APP</span>
                                        <span className="text-[12px] text-[#949ba4] font-medium ml-1">Today at 4:20 PM</span>
                                    </div>
                                    <div className="text-[#dbdee1] text-[15px] leading-[1.375rem] whitespace-pre-wrap font-medium">
                                        {(activeTab === 'welcome' ? settings.welcome_message : settings.goodbye_message)
                                            ?.replace(/{user}/g, '@NewMember')
                                            ?.replace(/{user\.tag}/g, 'Member#0001')
                                            ?.replace(/{server}/g, guild.name)
                                            ?.replace(/{membercount}/g, '1,234') || 'Awaiting transmission data...'}
                                    </div>

                                    {/* Image Card Preview */}
                                    {activeTab === 'welcome' && settings.welcome_card_enabled && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="mt-3 relative max-w-[500px] aspect-[1024/450] rounded-xl overflow-hidden border border-[#ffffff]/10 shadow-2xl group/card"
                                        >
                                            {settings.welcome_background_url ? (
                                                <img
                                                    src={settings.welcome_background_url}
                                                    alt="Background"
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e2e] to-[#11111b]" />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                                <div
                                                    className="w-20 h-20 rounded-full border-[3px] mb-4 overflow-hidden relative shadow-2xl transition-all duration-500 group-hover/card:rotate-6 group-hover/card:scale-110"
                                                    style={{ borderColor: settings.welcome_text_color || '#ffffff' }}
                                                >
                                                    <div className="absolute inset-0 bg-white/10" />
                                                    <img src="https://cdn.discordapp.com/embed/avatars/2.png" alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <p className="text-[12px] font-black mb-1 tracking-[0.3em] uppercase drop-shadow-lg" style={{ color: settings.welcome_text_color || '#ffffff' }}>WELCOME</p>
                                                <p className="text-[24px] font-[900] tracking-tighter drop-shadow-2xl text-center leading-none" style={{ color: settings.welcome_text_color || '#ffffff' }}>NEW MEMBER</p>
                                                <p className="text-[10px] opacity-80 mt-3 font-black uppercase tracking-widest drop-shadow-lg" style={{ color: settings.welcome_text_color || '#ffffff' }}>Member #1,234</p>
                                            </div>

                                            {/* Gloss Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 bg-primary/2 border-primary/10 relative overflow-hidden">
                        <div className="absolute -top-10 -left-10 w-20 h-20 bg-primary/10 blur-2xl rounded-full" />
                        <h4 className="flex items-center gap-3 mb-6 text-primary font-black text-xs uppercase tracking-[0.2em]">
                            <Info size={16} />
                            Code Injections
                        </h4>
                        <div className="space-y-4">
                            {[
                                { t: '{user}', d: 'Ping Member' },
                                { t: '{user.tag}', d: 'Identity Handle' },
                                { t: '{server}', d: 'Matrix Node' },
                                { t: '{membercount}', d: 'Neural Population' }
                            ].map(p => (
                                <button
                                    key={p.t}
                                    onClick={() => {
                                        navigator.clipboard.writeText(p.t);
                                        showNotification('success', `Copied ${p.t} to neural link.`, 'Matrix Synced');
                                    }}
                                    className="w-full flex justify-between items-center bg-white/2 p-3 rounded-xl border border-white/5 group hover:border-primary/20 hover:bg-primary/5 transition-all active:scale-[0.98]"
                                >
                                    <code className="text-primary font-black text-xs group-hover:scale-110 transition-transform">{p.t}</code>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-primary/70 transition-colors">{p.d}</span>
                                        <Copy size={12} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


export default WelcomeSettings;
