import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    MessageSquare, Settings, Trash2, Plus, X,
    Sparkles, User, Brain, Sliders, ChevronDown
} from 'lucide-react';
import MultiChannelSelector from '../components/MultiChannelSelector';
import { useNotification } from '../context/NotificationContext';

const AIChatSettings = ({ guild }) => {
    const { showNotification } = useNotification();
    const [aiChannels, setAiChannels] = useState([]);
    const [guildChannels, setGuildChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [configModal, setConfigModal] = useState(null);
    const [addModal, setAddModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // ... (personalities same) ...
    const personalities = [
        { id: 'Default AI', name: 'Helpful Assistant', desc: 'Standard polite and helpful AI' },
        { id: 'Sarcastic', name: 'Sarcastic & Witty', desc: 'Responds with humor and attitude' },
        { id: 'Pirate', name: 'Pirate Mode', desc: 'Talks like a 17th-century swashbuckler' },
        { id: 'Professional', name: 'Professional Expert', desc: 'Formal, technical, and precise' },
        { id: 'Friendly', name: 'Casual Friend', desc: 'Warm, informal, and supportive' },
        { id: 'Custom', name: 'Custom Persona', desc: 'Define your own personality' }
    ];

    useEffect(() => {
        if (guild) {
            fetchData();
        }
    }, [guild]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [aiRes, channelsRes] = await Promise.all([
                axios.get(`/api/ai/channels/${guild.id}`),
                axios.get(`/api/channels/${guild.id}`)
            ]);
            setAiChannels(aiRes.data.channels || []);
            setGuildChannels(channelsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getChannelName = (channelId) => {
        const channel = guildChannels.find(c => c.id === channelId);
        return channel ? channel.name : 'Unknown Channel';
    };

    const handleUpdateChannel = async (channelData) => {
        setSaving(true);
        try {
            // Standardize field names for the database
            const payload = {
                guild_id: guild.id,
                channel_id: channelData.channel_id || channelData.channelId,
                personality: channelData.personality || 'Default AI',
                system_prompt: channelData.system_prompt || channelData.systemPrompt || '',
                reply_chance: channelData.reply_chance ?? channelData.replyChance ?? 0.0,
                context_length: channelData.context_length ?? channelData.contextLength ?? 10,
                enabled: channelData.enabled ?? true
            };

            await axios.post('/api/ai/channels/update', payload);
            await fetchData();
            setConfigModal(null);
            showNotification('success', `AI Configuration for #${getChannelName(payload.channel_id)} saved successfully.`, 'Persona Updated');
        } catch (error) {
            console.error('Error updating AI channel:', error);
            showNotification('error', error.response?.data?.error || error.message, 'Save Failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteChannel = async (channelId) => {
        if (!confirm('Are you sure you want to disable AI for this channel?')) return;
        try {
            await axios.delete(`/api/ai/channels/${guild.id}/${channelId}`);
            await fetchData();
            showNotification('success', 'AI has been disabled for the channel.', 'Channel Removed');
        } catch (error) {
            console.error('Error deleting AI channel:', error);
            showNotification('error', 'Could not remove AI from channel.', 'System Error');
        }
    };

    const handleAddChannels = async (selectedIds) => {
        setAddModal(false);
        for (const channelId of selectedIds) {
            await handleUpdateChannel({
                guildId: guild.id,
                channel_id: channelId,
                enabled: true
            });
        }
    };

    if (!guild) return <div className="text-center py-20 text-slate-500">No server selected</div>;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <Sparkles className="text-primary" /> AI Chat Channels
                    </h2>
                    <p className="text-slate-400 mt-2">Manage AI behaviors in specific text channels</p>
                </div>
                <button
                    onClick={() => setAddModal(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={20} /> Add AI Channel
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiChannels.map((channel, index) => (
                    <motion.div
                        key={channel.channel_id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card p-6 group hover:border-primary/30 transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                <MessageSquare size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setConfigModal(channel)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                >
                                    <Settings size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteChannel(channel.channel_id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold mb-1">#{getChannelName(channel.channel_id)}</h3>
                        <p className="text-xs text-slate-500 mb-4">{channel.personality}</p>

                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                <span>Reply Chance</span>
                                <span>{Math.round(channel.reply_chance * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary"
                                    style={{ width: `${channel.reply_chance * 100}%` }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setConfigModal(channel)}
                            className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors"
                        >
                            Configure Persona
                        </button>
                    </motion.div>
                ))}

                {aiChannels.length === 0 && (
                    <div className="col-span-full py-20 glass-card text-center border-dashed">
                        <Brain size={48} className="mx-auto text-slate-700 mb-4" />
                        <h4 className="text-lg font-bold text-slate-300">No AI channels configured</h4>
                        <p className="text-slate-500 text-sm mt-1">Add a channel to start conversational AI interactions</p>
                        <button
                            onClick={() => setAddModal(true)}
                            className="mt-6 text-primary hover:text-primary/80 font-bold text-sm"
                        >
                            + Add your first channel
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {configModal && (
                    <ConfigModal
                        channel={configModal}
                        channelName={getChannelName(configModal.channel_id)}
                        personalities={personalities}
                        onClose={() => setConfigModal(null)}
                        onSave={handleUpdateChannel}
                        saving={saving}
                    />
                )}
                {addModal && (
                    <AddModal
                        guildId={guild.id}
                        onClose={() => setAddModal(false)}
                        onSave={handleAddChannels}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const ConfigModal = ({ channel, channelName, personalities, onClose, onSave, saving }) => {
    const [personality, setPersonality] = useState(channel.personality);
    const [systemPrompt, setSystemPrompt] = useState(channel.system_prompt || '');
    const [replyChance, setReplyChance] = useState(channel.reply_chance);
    const [contextLength, setContextLength] = useState(channel.context_length);
    const [enabled, setEnabled] = useState(channel.enabled);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold">Configure AI #{channelName}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
                </div>

                <div className="space-y-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                            Select Personality
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {personalities.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setPersonality(p.id)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${personality === p.id ? 'border-primary bg-primary/10' : 'border-white/5 hover:border-white/10'}`}
                                >
                                    <div className="text-sm font-bold mb-1">{p.name}</div>
                                    <div className="text-[10px] text-slate-500 leading-relaxed">{p.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {personality === 'Custom' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                Custom System Prompt
                            </label>
                            <textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                placeholder="Describe exactly how the AI should behave..."
                                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-primary/50 focus:outline-none"
                            />
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="flex justify-between mb-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reply Chance</label>
                                <span className="text-primary font-bold">{Math.round(replyChance * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="1" step="0.05"
                                value={replyChance}
                                onChange={(e) => setReplyChance(parseFloat(e.target.value))}
                                className="w-full accent-primary"
                            />
                            <p className="text-[10px] text-slate-500 mt-2">Chance the AI will respond without being mentioned</p>
                        </div>
                        <div>
                            <div className="flex justify-between mb-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Context Length</label>
                                <span className="text-primary font-bold">{contextLength} msgs</span>
                            </div>
                            <input
                                type="range"
                                min="1" max="50" step="1"
                                value={contextLength}
                                onChange={(e) => setContextLength(parseInt(e.target.value))}
                                className="w-full accent-primary"
                            />
                            <p className="text-[10px] text-slate-500 mt-2">How many previous messages the AI remembers</p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/5">
                        <button
                            disabled={saving}
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={saving}
                            onClick={() => onSave({
                                ...channel,
                                personality,
                                system_prompt: systemPrompt,
                                reply_chance: replyChance,
                                context_length: contextLength,
                                enabled
                            })}
                            className="flex-1 py-4 bg-primary hover:bg-primary/80 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                        >
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const AddModal = ({ guildId, onClose, onSave }) => {
    const [selectedChannels, setSelectedChannels] = useState([]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative glass-card p-8 max-w-lg w-full"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Add AI Channels</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
                </div>

                <div className="space-y-6">
                    <MultiChannelSelector
                        guildId={guildId}
                        selectedChannels={selectedChannels}
                        onChange={setSelectedChannels}
                        label="Select Channels"
                    />

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={selectedChannels.length === 0}
                            onClick={() => onSave(selectedChannels)}
                            className="flex-1 py-3 bg-primary hover:bg-primary/80 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add {selectedChannels.length || ''} Channels
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AIChatSettings;
