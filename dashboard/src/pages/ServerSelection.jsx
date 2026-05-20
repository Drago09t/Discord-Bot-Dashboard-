import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, LogOut, Zap, Server, ChevronRight } from 'lucide-react';
import Credits from '../components/Credits';

const getDiscordAssetUrl = (type, id, hash, size = 128) => {
    if (!hash) return null;
    const isAnimated = hash.startsWith('a_');
    const extension = isAnimated ? 'gif' : 'png';
    return `https://images.discordapp.net/${type}/${id}/${hash}.${extension}?size=${size}`;
};

const ServerSelection = ({ guilds, onSelect, user }) => {
    const [search, setSearch] = useState('');

    const filteredGuilds = guilds.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-dark flex flex-col items-center p-8 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
            </div>

            {/* Header */}
            <header className="w-full max-w-5xl flex items-center justify-between mb-12 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <Zap className="text-white fill-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Dashboard Access</h1>
                        <p className="text-slate-400 text-sm">Welcome back, {user?.username}</p>
                    </div>
                </div>
                <a href="/auth/logout" className="glass-card px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                    <LogOut size={18} />
                    <span>Logout</span>
                </a>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-5xl z-10 flex-1 flex flex-col">
                <div className="text-center mb-10 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                        Select a Server
                    </h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Choose a server to configure settings, manage members, and view analytics.
                    </p>
                </div>

                {/* Search */}
                <div className="w-full max-w-md mx-auto mb-10 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search your servers..."
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {filteredGuilds.map((guild, index) => (
                        <motion.button
                            key={guild.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onSelect(guild)}
                            className="glass-card p-6 text-left group hover:scale-[1.02] hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="flex items-start justify-between mb-6 relative">
                                {guild.icon ? (
                                    <div className="w-16 h-16 rounded-2xl p-1 bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                                        <img
                                            src={getDiscordAssetUrl('icons', guild.id, guild.icon)}
                                            className="w-full h-full rounded-xl object-cover"
                                            alt={guild.name}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xl font-bold text-white border border-white/10">
                                        {guild.name.charAt(0)}
                                    </div>
                                )}
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition-all transform -rotate-45 group-hover:rotate-0">
                                    <ChevronRight size={18} />
                                </div>
                            </div>

                            <div className="relative">
                                <h3 className="text-xl font-bold text-white mb-1 truncate group-hover:text-primary transition-colors">{guild.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Active Dashboard
                                </div>
                            </div>
                        </motion.button>
                    ))}

                    {filteredGuilds.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <Server size={48} className="mx-auto text-slate-600 mb-4" />
                            <p className="text-slate-500 font-medium">No servers found matching "{search}"</p>
                        </div>
                    )}
                </div>
            </main>
            <footer className="w-full max-w-5xl border-t border-white/[0.05] mt-auto pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 z-10">
                <p>© 2026 Vortex Protocol. All rights reserved.</p>
                <Credits />
                <p>Systems Active</p>
            </footer>
        </div>
    );
};

export default ServerSelection;
