import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, Hash } from 'lucide-react';
import axios from 'axios';

const ChannelSelector = ({ guildId, value, onChange, placeholder = "Select Channel" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log(`[ChannelSelector] Open: ${isOpen}, GuildId: ${guildId}, Channels: ${channels.length}`);
        if (isOpen && guildId && channels.length === 0) {
            console.log(`[ChannelSelector] Fetching channels for guild: ${guildId}`);
            fetchChannels();
        } else if (isOpen && !guildId) {
            console.warn('[ChannelSelector] Cannot fetch channels: No Guild ID provided');
        }
    }, [isOpen, guildId]);


    const fetchChannels = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/channels/${guildId}`);
            setChannels(response.data);
        } catch (error) {
            console.error('Failed to fetch channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectedChannel = channels.find(c => c.id === value);
    const filteredChannels = channels.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-12 px-4 glass-input flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                disabled={!guildId}
            >
                <Hash size={18} className="text-primary" />
                <div className="flex-1 text-left flex flex-col">
                    <span className={`text-sm truncate ${!selectedChannel ? 'text-slate-500' : 'text-white font-medium'}`}>
                        {selectedChannel ? `#${selectedChannel.name}` : placeholder}
                    </span>
                    <span className="text-[10px] text-slate-600">GID: {guildId || 'MISSING'}</span>
                </div>
                <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>


            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.98 }}
                            className="absolute top-full left-0 right-0 mt-2 glass-card p-2 z-50 shadow-2xl border-white/10"
                        >
                            <div className="p-2 mb-2 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search channels..."
                                    className="w-full bg-black/40 border border-white/5 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-primary/50"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : filteredChannels.length === 0 ? (
                                    <p className="text-center py-4 text-xs text-slate-500">No channels found</p>
                                ) : (
                                    filteredChannels.map((channel) => (
                                        <button
                                            key={channel.id}
                                            type="button"
                                            onClick={() => {
                                                onChange(channel.id);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left ${value === channel.id ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                                        >
                                            <Hash size={14} className={value === channel.id ? 'text-primary' : 'text-slate-500'} />
                                            <span className="text-xs font-medium flex-1 truncate">{channel.name}</span>
                                            {value === channel.id && <Check size={14} />}
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChannelSelector;
