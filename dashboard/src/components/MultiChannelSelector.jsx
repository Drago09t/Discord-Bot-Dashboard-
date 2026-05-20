import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, Hash } from 'lucide-react';
import axios from 'axios';

const MultiChannelSelector = ({ guildId, selectedChannels = [], onChange, label = "Select Channels" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (guildId && isOpen && channels.length === 0) {
            fetchChannels();
        }
    }, [guildId, isOpen]);

    const fetchChannels = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/channels/${guildId}`);
            setChannels(response.data);
        } catch (error) {
            console.error('Error fetching channels:', error);
            setChannels([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredChannels = channels.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleChannel = (channelId) => {
        const newSelection = selectedChannels.includes(channelId)
            ? selectedChannels.filter(id => id !== channelId)
            : [...selectedChannels, channelId];
        onChange(newSelection);
    };

    const getSelectedCount = () => {
        return selectedChannels.length;
    };

    return (
        <div className="relative">
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                {label}
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-12 px-4 glass-card flex items-center justify-between hover:bg-white/10 transition-colors"
            >
                <span className="text-sm font-medium">
                    {getSelectedCount() > 0
                        ? `${getSelectedCount()} channel${getSelectedCount() > 1 ? 's' : ''} selected`
                        : 'Select channels...'}
                </span>
                <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        ></div>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full mt-2 left-0 w-full glass-card p-2 z-50 overflow-hidden shadow-2xl border-white/20 max-h-80"
                        >
                            <div className="p-2 mb-2 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search channels..."
                                    className="w-full bg-black/40 border border-white/5 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-primary/50"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>

                            <div className="max-h-56 overflow-y-auto space-y-1 px-1">
                                {loading ? (
                                    <p className="text-center py-4 text-xs text-slate-500">Loading channels...</p>
                                ) : filteredChannels.length === 0 ? (
                                    <p className="text-center py-4 text-xs text-slate-500 font-medium">No channels found</p>
                                ) : (
                                    filteredChannels.map((channel) => {
                                        const isSelected = selectedChannels.includes(channel.id);
                                        return (
                                            <button
                                                key={channel.id}
                                                type="button"
                                                onClick={() => toggleChannel(channel.id)}
                                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left group ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                                            >
                                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-slate-600'}`}>
                                                    {isSelected && <Check size={12} className="text-white" />}
                                                </div>

                                                <Hash size={14} className={isSelected ? 'text-primary' : 'text-slate-500'} />
                                                <span className="text-xs font-semibold flex-1 truncate">{channel.name}</span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MultiChannelSelector;
