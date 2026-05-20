import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layers,
    Plus,
    Trash2,
    Image as ImageIcon,
    Type,
    Link as LinkIcon,
    Palette,
    Save,
    Send,
    PlusCircle,
    MessageSquare,
    Globe,
    User,
    ChevronDown,
    ChevronUp,
    Zap
} from 'lucide-react';

const EmbedBuilder = ({ guild }) => {
    const [embed, setEmbed] = useState({
        author: { name: '', icon_url: '', url: '' },
        title: '',
        url: '',
        description: '',
        color: '#ff007f',
        fields: [],
        image: '',
        thumbnail: '',
        footer: { text: '', icon_url: '' },
        timestamp: false,
    });

    const [buttons, setButtons] = useState([]);
    const [activeTab, setActiveTab] = useState('content');
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState('');
    const [templates, setTemplates] = useState([]);
    const [templateName, setTemplateName] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    React.useEffect(() => {
        if (guild?.id) {
            fetchChannels();
            fetchTemplates();
        }
    }, [guild?.id]);

    const fetchChannels = async () => {
        try {
            const res = await axios.get(`/api/channels/${guild.id}`);
            setChannels(res.data);
            if (res.data.length > 0) setSelectedChannel(res.data[0].id);
        } catch (err) {
            console.error('Failed to fetch channels');
        }
    };

    const fetchTemplates = async () => {
        try {
            const res = await axios.get(`/api/embeds/${guild.id}/templates`);
            setTemplates(res.data.templates);
        } catch (err) {
            console.error('Failed to fetch templates');
        }
    };

    const handleSave = async () => {
        if (!templateName) return alert('Please enter a template name');
        setSaving(true);
        try {
            await axios.post(`/api/embeds/${guild.id}/templates`, {
                name: templateName,
                content: embed,
                buttons
            });
            fetchTemplates();
            setTemplateName('');
            alert('Template saved successfully!');
        } catch (err) {
            console.error('Save error:', err.response?.data || err.message);
            alert(`Failed to save template: ${err.response?.data?.error || err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleSend = async () => {
        if (!selectedChannel) return alert('Please select a channel');
        setLoading(true);
        try {
            await axios.post(`/api/embeds/${guild.id}/send`, {
                channelId: selectedChannel,
                embed,
                buttons
            });
            alert('Embed sent successfully!');
        } catch (err) {
            console.error('Send error:', err.response?.data || err.message);
            alert(`Failed to send embed: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const loadTemplate = (tpl) => {
        setEmbed(tpl.content);
        setButtons(tpl.buttons || []);
    };

    const addField = () => {
        if (embed.fields.length >= 25) return;
        setEmbed({ ...embed, fields: [...embed.fields, { name: '', value: '', inline: false }] });
    };

    const updateField = (index, key, value) => {
        const newFields = [...embed.fields];
        newFields[index][key] = value;
        setEmbed({ ...embed, fields: newFields });
    };

    const removeField = (index) => {
        setEmbed({ ...embed, fields: embed.fields.filter((_, i) => i !== index) });
    };

    const addButton = () => {
        if (buttons.length >= 5) return;
        setButtons([...buttons, { label: 'New Button', style: 'PRIMARY', custom_id: `btn_${Date.now()}`, url: '', emoji: '', responseText: 'Button Clicked!' }]);
    };

    const updateButton = (index, key, value) => {
        const newButtons = [...buttons];
        newButtons[index][key] = value;
        setButtons(newButtons);
    };

    const removeButton = (index) => {
        setButtons(buttons.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Visual Embed Builder</h2>
                    <p className="text-slate-400 mt-2">Design high-impact Discord embeds with live real-time preview.</p>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative group">
                        <select
                            value={selectedChannel}
                            onChange={(e) => setSelectedChannel(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold appearance-none pr-10 outline-none focus:border-pink-500/50"
                        >
                            {channels.map(c => (
                                <option key={c.id} value={c.id} className="bg-[#0a0a0c]">#{c.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className={`btn-premium px-8 py-2.5 !rounded-xl !text-xs !font-bold flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
                        {loading ? 'Sending...' : 'Send Now'}
                    </button>
                </div>
            </div>

            {/* Templates Quick Load */}
            {templates.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {templates.map(tpl => (
                        <button
                            key={tpl.id}
                            onClick={() => loadTemplate(tpl)}
                            className="flex-shrink-0 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-pink-500/10 hover:border-pink-500/30 transition-all flex items-center gap-2"
                        >
                            <Plus size={12} className="text-pink-500" />
                            {tpl.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Editor Panel */}
                <div className="space-y-6">
                    <div className="glass-card overflow-hidden">
                        <div className="flex border-b border-white/5">
                            {[
                                { id: 'content', label: 'Basic Info', icon: <Type size={16} /> },
                                { id: 'fields', label: 'Fields', icon: <Layers size={16} /> },
                                { id: 'images', label: 'Media', icon: <ImageIcon size={16} /> },
                                { id: 'buttons', label: 'Buttons', icon: <PlusCircle size={16} /> },
                                { id: 'footer', label: 'Footer', icon: <Globe size={16} /> },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-4 px-2 flex flex-col items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-pink-500' : 'text-slate-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-8 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                            <div className="flex gap-4 items-end mb-6">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Template Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Welcome Message"
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-sm focus:border-pink-500/50 outline-none"
                                    />
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="h-12 px-6 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                                >
                                    {saving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'content' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accent Color</label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="color"
                                                        value={embed.color}
                                                        onChange={(e) => setEmbed({ ...embed, color: e.target.value })}
                                                        className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 cursor-pointer p-1"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={embed.color}
                                                        onChange={(e) => setEmbed({ ...embed, color: e.target.value })}
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-mono"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Author Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Vortex System"
                                                    value={embed.author.name}
                                                    onChange={(e) => setEmbed({ ...embed, author: { ...embed.author, name: e.target.value } })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-sm focus:border-pink-500/50 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Title</label>
                                            <input
                                                type="text"
                                                placeholder="Embed Title"
                                                value={embed.title}
                                                onChange={(e) => setEmbed({ ...embed, title: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-sm focus:border-pink-500/50 outline-none font-bold"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                                            <textarea
                                                placeholder="Main content of the embed..."
                                                rows={5}
                                                value={embed.description}
                                                onChange={(e) => setEmbed({ ...embed, description: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-pink-500/50 outline-none resize-none"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'fields' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-xs text-slate-500">{embed.fields.length} / 25 Fields Used</p>
                                            <button
                                                onClick={addField}
                                                className="text-[10px] font-black text-pink-500 uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
                                            >
                                                <Plus size={14} /> Add New Field
                                            </button>
                                        </div>

                                        {embed.fields.map((field, i) => (
                                            <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative group">
                                                <button
                                                    onClick={() => removeField(i)}
                                                    className="absolute top-4 right-4 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Field Name</label>
                                                        <input
                                                            type="text"
                                                            value={field.name}
                                                            onChange={(e) => updateField(i, 'name', e.target.value)}
                                                            className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Inline</label>
                                                        <button
                                                            onClick={() => updateField(i, 'inline', !field.inline)}
                                                            className={`w-full py-2 px-3 rounded-lg border text-[10px] font-bold transition-all ${field.inline ? 'bg-pink-500/10 border-pink-500/30 text-pink-500' : 'bg-black/20 border-white/5 text-slate-500'
                                                                }`}
                                                        >
                                                            {field.inline ? 'TRUE' : 'FALSE'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Field Value</label>
                                                    <textarea
                                                        value={field.value}
                                                        onChange={(e) => updateField(i, 'value', e.target.value)}
                                                        className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-xs outline-none resize-none"
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                {activeTab === 'buttons' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-xs text-slate-500">{buttons.length} / 5 Buttons Used</p>
                                            <button
                                                onClick={addButton}
                                                className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
                                            >
                                                <PlusCircle size={14} /> Create Button
                                            </button>
                                        </div>

                                        {buttons.map((btn, i) => (
                                            <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Button #{i + 1}</h4>
                                                    <button onClick={() => removeButton(i)} className="text-slate-700 hover:text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Label</label>
                                                        <input
                                                            type="text"
                                                            value={btn.label}
                                                            onChange={(e) => updateButton(i, 'label', e.target.value)}
                                                            className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Style</label>
                                                        <select
                                                            value={btn.style}
                                                            onChange={(e) => updateButton(i, 'style', e.target.value)}
                                                            className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs outline-none"
                                                        >
                                                            <option value="PRIMARY">Blurple (Primary)</option>
                                                            <option value="SECONDARY">Grey (Secondary)</option>
                                                            <option value="SUCCESS">Green (Success)</option>
                                                            <option value="DANGER">Red (Danger)</option>
                                                            <option value="LINK">Link</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {btn.style === 'LINK' ? (
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">URL</label>
                                                            <input
                                                                type="text"
                                                                value={btn.url}
                                                                onChange={(e) => updateButton(i, 'url', e.target.value)}
                                                                className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs outline-none"
                                                                placeholder="https://..."
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Emoji (Optional)</label>
                                                            <input
                                                                type="text"
                                                                value={btn.emoji}
                                                                onChange={(e) => updateButton(i, 'emoji', e.target.value)}
                                                                className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs outline-none"
                                                                placeholder="e.g. ⭐"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Response Text (Sent when clicked)</label>
                                                        <input
                                                            type="text"
                                                            disabled={btn.style === 'LINK'}
                                                            value={btn.style === 'LINK' ? 'Links cannot have responses' : btn.responseText}
                                                            onChange={(e) => updateButton(i, 'responseText', e.target.value)}
                                                            className={`w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs outline-none font-medium ${btn.style === 'LINK' ? 'opacity-50 text-slate-500' : 'text-pink-500'}`}
                                                            placeholder="Vortex will reply with this..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                {activeTab === 'images' && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Thumbnail URL</label>
                                            <input
                                                type="text"
                                                placeholder="https://..."
                                                value={embed.thumbnail}
                                                onChange={(e) => setEmbed({ ...embed, thumbnail: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-sm outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Large Image URL</label>
                                            <input
                                                type="text"
                                                placeholder="https://..."
                                                value={embed.image}
                                                onChange={(e) => setEmbed({ ...embed, image: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-sm outline-none"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'footer' && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Footer Text</label>
                                            <input
                                                type="text"
                                                placeholder="Small text at the bottom..."
                                                value={embed.footer.text}
                                                onChange={(e) => setEmbed({ ...embed, footer: { ...embed.footer, text: e.target.value } })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-sm outline-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4 py-4 px-6 bg-white/[0.02] border border-white/5 rounded-[1.5rem]">
                                            <input
                                                type="checkbox"
                                                checked={embed.timestamp}
                                                onChange={(e) => setEmbed({ ...embed, timestamp: e.target.checked })}
                                                className="w-5 h-5 accent-pink-500"
                                            />
                                            <div>
                                                <p className="text-sm font-bold">Include Timestamp</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-0.5">Show "Today at 05:40"</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="sticky top-10 space-y-6">
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        <MessageSquare size={14} className="text-pink-500" />
                        Live Discord Preview
                    </div>

                    <div className="bg-[#313338] rounded-xl p-4 shadow-2xl border border-black/20">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-violet-700 flex items-center justify-center flex-shrink-0">
                                <Zap size={20} fill="white" className="text-white" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-bold text-sm">Vortex</span>
                                    <span className="bg-[#5865F2] text-[10px] font-medium text-white px-1.5 py-0.5 rounded uppercase">Bot</span>
                                    <span className="text-[#949BA4] text-xs">Today at 05:40</span>
                                </div>

                                {/* Discord Embed Mockup */}
                                <div className="flex">
                                    <div
                                        className="w-[4px] rounded-l"
                                        style={{ backgroundColor: embed.color }}
                                    />
                                    <div className="bg-[#2B2D31] flex-1 p-3 rounded-r max-w-[432px]">
                                        <div className="flex justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                {embed.author.name && (
                                                    <div className="flex items-center gap-2">
                                                        {embed.author.icon_url && <img src={embed.author.icon_url} className="w-6 h-6 rounded-full" />}
                                                        <span className="text-white text-xs font-semibold">{embed.author.name}</span>
                                                    </div>
                                                )}
                                                {embed.title && (
                                                    <h3 className="text-white font-bold text-sm hover:underline cursor-pointer">{embed.title}</h3>
                                                )}
                                                {embed.description && (
                                                    <p className="text-[#DBDEE1] text-sm whitespace-pre-wrap">{embed.description}</p>
                                                )}

                                                <div className="grid grid-cols-2 gap-4">
                                                    {embed.fields.map((f, i) => (
                                                        <div key={i} className={f.inline ? 'col-span-1' : 'col-span-2'}>
                                                            <div className="text-white text-xs font-bold mb-0.5">{f.name || '\u200b'}</div>
                                                            <div className="text-[#DBDEE1] text-sm">{f.value || '\u200b'}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {embed.thumbnail && (
                                                <img src={embed.thumbnail} className="w-20 h-20 rounded object-cover flex-shrink-0 mt-2" />
                                            )}
                                        </div>

                                        {embed.image && (
                                            <img src={embed.image} className="w-full h-auto rounded mt-3 object-contain" />
                                        )}

                                        {(embed.footer.text || embed.timestamp) && (
                                            <div className="flex items-center gap-2 mt-3 text-[11px] text-[#B5BAC1]">
                                                {embed.footer.icon_url && <img src={embed.footer.icon_url} className="w-5 h-5 rounded-full" />}
                                                <span>{embed.footer.text} {embed.timestamp && ' • 05:40'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Buttons Preview */}
                                {buttons.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {buttons.map((btn, i) => {
                                            const colors = {
                                                PRIMARY: 'bg-[#5865F2] hover:bg-[#4752C4]',
                                                SECONDARY: 'bg-[#4E5058] hover:bg-[#6D6F78]',
                                                SUCCESS: 'bg-[#248046] hover:bg-[#1A6334]',
                                                DANGER: 'bg-[#DA373C] hover:bg-[#A12829]',
                                                LINK: 'bg-[#4E5058] hover:bg-[#6D6F78]'
                                            };
                                            return (
                                                <button
                                                    key={i}
                                                    className={`${colors[btn.style]} text-white text-xs font-medium px-4 py-1.5 rounded transition-all flex items-center gap-2`}
                                                >
                                                    {btn.label}
                                                    {btn.style === 'LINK' && <LinkIcon size={12} />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 bg-gradient-to-br from-pink-500/10 to-transparent">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-500 flex-shrink-0">
                                <Palette size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider">Designer Tip</h4>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                    Use high-quality imagery (1280x720) for the large image slot to make your announcement stand out. Discord automatically handles responsive scaling.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmbedBuilder;
