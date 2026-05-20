import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, Server } from 'lucide-react';


const getDiscordAssetUrl = (type, id, hash, size = 64) => {
    if (!hash) return null;
    const isAnimated = hash.startsWith('a_');
    const extension = isAnimated ? 'gif' : 'png';
    return `https://images.discordapp.net/${type}/${id}/${hash}.${extension}?size=${size}`;
};

const ServerSelector = ({ guilds, selectedGuild, onSelect }) => {

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredGuilds = guilds.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 px-4 glass-card flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors min-w-[200px]"
            >
                {selectedGuild?.icon ? (
                    <img
                        src={getDiscordAssetUrl('icons', selectedGuild.id, selectedGuild.icon)}
                        className="w-6 h-6 rounded-lg"
                        alt=""
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                {(!selectedGuild?.icon || true) && (
                    <div
                        className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center text-[10px] font-bold text-primary"
                        style={{ display: selectedGuild?.icon ? 'none' : 'flex' }}
                    >
                        {selectedGuild?.name?.charAt(0) || <Server size={14} />}
                    </div>
                )}

                <span className="text-sm font-semibold truncate flex-1 text-left">
                    {selectedGuild?.name || 'Select Server'}
                </span>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
                            className="absolute top-12 left-0 w-72 glass-card p-2 z-50 overflow-hidden shadow-2xl border-white/20"
                        >
                            <div className="p-2 mb-2 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input
                                    type="text"
                                    placeholder="Filter servers..."
                                    className="w-full bg-black/40 border border-white/5 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-primary/50"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="max-h-64 overflow-y-auto space-y-1 px-1">
                                {filteredGuilds.length === 0 ? (
                                    <p className="text-center py-4 text-xs text-slate-500 font-medium">No servers found</p>
                                ) : (
                                    filteredGuilds.map((guild) => (
                                        <button
                                            key={guild.id}
                                            onClick={() => {
                                                onSelect(guild);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left group ${selectedGuild?.id === guild.id ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                                        >
                                            {guild.icon ? (
                                                <div className="relative w-8 h-8">
                                                    <img
                                                        src={getDiscordAssetUrl('icons', guild.id, guild.icon, 128)}
                                                        className="w-8 h-8 rounded-lg"
                                                        alt=""
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                    <div
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${selectedGuild?.id === guild.id ? 'bg-primary/20' : 'bg-white/5'}`}
                                                        style={{ display: 'none' }}
                                                    >
                                                        {guild.name.charAt(0)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${selectedGuild?.id === guild.id ? 'bg-primary/20' : 'bg-white/5'}`}>
                                                    {guild.name.charAt(0)}
                                                </div>
                                            )}

                                            <span className="text-xs font-semibold flex-1 truncate">{guild.name}</span>
                                            {selectedGuild?.id === guild.id && <Check size={14} />}
                                        </button>
                                    ))
                                )}
                            </div>

                            <div className="mt-2 pt-2 border-t border-white/5 p-2">
                                <button className="w-full text-[10px] font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest text-center">
                                    + Add New Server
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ServerSelector;
