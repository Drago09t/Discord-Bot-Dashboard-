import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import {
    Play, Pause, SkipForward, Square, Volume2, Search,
    Music, Disc, Mic2, Settings2, Repeat, Shuffle,
    ListMusic, BarChart3, Radio, Heart, Share2, Plus,
    ChevronRight, ExternalLink, Clock, Layers
} from 'lucide-react';

const MusicPlayer = ({ guild }) => {
    const { showNotification } = useNotification();
    const [state, setState] = useState({
        active: false,
        current: null,
        paused: false,
        volume: 100,
        loop: 'off',
        filter: 'none',
        position: 0
    });
    const [queue, setQueue] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [lyrics, setLyrics] = useState(null);
    const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'filters', 'lyrics'
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Polling interval
    useEffect(() => {
        if (!guild) return;

        const fetchChannels = async () => {
            try {
                const res = await axios.get(`/api/channels/${guild.id}`);
                const voiceChans = res.data.filter(c => c.type === 2);
                setChannels(voiceChans);
                if (voiceChans.length > 0 && !selectedChannel) {
                    setSelectedChannel(voiceChans[0].id);
                }
            } catch (e) {
                console.error('Failed to fetch channels:', e);
            }
        };
        fetchChannels();

        const interval = setInterval(fetchState, 1000);
        return () => clearInterval(interval);
    }, [guild]);

    const fetchState = async () => {
        if (!guild) return;
        try {
            const res = await axios.get(`/api/music/state/${guild.id}`);
            setState(res.data);
            if (res.data.active) {
                const qRes = await axios.get(`/api/music/queue/${guild.id}`);
                setQueue(qRes.data.queue);
            }
        } catch (e) { }
    };

    const handlePlay = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            const channelId = selectedChannel || prompt("Enter Voice Channel ID:");
            if (!channelId) return;

            await axios.post(`/api/music/play/${guild.id}`, {
                query: searchQuery,
                voiceChannelId: channelId
            });
            setSearchQuery('');
            showNotification('success', 'Added to queue', 'Music');
            fetchState();
        } catch (error) {
            showNotification('error', 'Failed to play track', 'Music Error');
        } finally {
            setIsSearching(false);
        }
    };

    const handleControl = async (action, value = null) => {
        try {
            if (action === 'filter') {
                await axios.post(`/api/music/filter/${guild.id}`, { filter: value });
            } else {
                await axios.post(`/api/music/control/${guild.id}`, { action, value });
            }

            // Optimistic update for UI feel
            if (action === 'pause') setState(p => ({ ...p, paused: true }));
            if (action === 'resume') setState(p => ({ ...p, paused: false }));
            if (action === 'volume') setState(p => ({ ...p, volume: value }));
            if (action === 'loop') setState(p => ({ ...p, loop: value }));
            if (action === 'filter') setState(p => ({ ...p, filter: value }));

            fetchState();
        } catch (error) {
            console.error(error);
        }
    };

    const handleSeek = async (e) => {
        if (!state.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percent = x / width;
        const newPos = Math.floor(percent * state.current.duration);

        setState(prev => ({ ...prev, position: newPos }));
        try {
            await axios.post(`/api/music/control/${guild.id}`, { action: 'seek', value: newPos });
        } catch (e) { }
    };

    const fetchLyrics = async () => {
        if (!state.current) return;
        try {
            setActiveTab('lyrics');
            setLyrics(null);
            const res = await axios.get(`/api/music/lyrics`, { params: { title: state.current.title } });
            setLyrics(res.data);
        } catch (e) {
            setLyrics({ lyrics: 'No lyrics found.' });
        }
    };

    if (!guild) return (
        <div className="min-h-[600px] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
            >
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Music size={40} className="text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold text-white">Select a Server</h2>
                <p className="text-slate-400 max-w-xs mx-auto">Please select a server from the sidebar to access the music dashboard.</p>
            </motion.div>
        </div>
    );

    const bgImage = state.current?.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop';

    const formatTime = (ms) => {
        if (!ms) return "0:00";
        const sec = Math.floor(ms / 1000);
        const min = Math.floor(sec / 60);
        const rem = sec % 60;
        return `${min}:${rem < 10 ? '0' : ''}${rem}`;
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 animate-fadeIn">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            {/* Header Content */}
            <div className="flex flex-col md:flex-row gap-4 items-center relative z-10">
                <div className="flex-1 w-full relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative flex items-center bg-dark-lighter border border-white/5 rounded-2xl p-1 pr-3">
                        <div className="flex-1 flex items-center px-4">
                            <Search className="text-slate-500 mr-3" size={20} />
                            <input
                                type="text"
                                className="w-full bg-transparent border-none py-3 text-white placeholder:text-slate-500 focus:outline-none"
                                placeholder="Search on YouTube or paste URL..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handlePlay()}
                            />
                        </div>
                        <select
                            value={selectedChannel}
                            onChange={(e) => setSelectedChannel(e.target.value)}
                            className="bg-white/5 border-none rounded-xl px-4 py-2 text-sm text-slate-300 focus:ring-0 mr-2"
                        >
                            <option value="">Select Voice</option>
                            {channels.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handlePlay}
                            disabled={isSearching}
                            className={`px-6 py-2 bg-primary rounded-xl font-bold text-sm text-white hover:bg-primary/90 transition-all ${isSearching ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSearching ? 'Adding...' : 'Search'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

                {/* Left Panel: The Player (7 columns) */}
                <div className="lg:col-span-12 xl:col-span-8 space-y-6">
                    <div className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden p-8 flex flex-col md:flex-row gap-10 items-center bg-gradient-to-br from-white/[0.03] to-transparent">

                        {/* Vinyl/Album Art Visual */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Vinyl Record */}
                            <div className={`relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center transition-transform duration-700 ${state.active && !state.paused ? '' : 'scale-95'}`}>
                                {/* The Record Base */}
                                <div className={`absolute inset-0 bg-[#0a0a0a] rounded-full border-[12px] border-[#1a1a1a] shadow-2xl flex items-center justify-center ${state.active && !state.paused ? 'animate-spin-slow' : ''}`}>
                                    <div className="absolute inset-[30%] border border-white/5 rounded-full" />
                                    <div className="absolute inset-[40%] border border-white/5 rounded-full" />
                                    <div className="absolute inset-[50%] border border-white/5 rounded-full" />
                                </div>

                                {/* Center Art */}
                                <div className={`z-10 w-[70%] h-[70%] rounded-full overflow-hidden border-4 border-[#1a1a1a] shadow-inner ${state.active && !state.paused ? 'animate-spin-slow' : ''}`}>
                                    {state.current ? (
                                        <img src={state.current.thumbnail} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-dark-lighter flex items-center justify-center text-slate-700">
                                            <Music size={48} />
                                        </div>
                                    )}
                                </div>

                                {/* Center Hole */}
                                <div className="z-20 w-4 h-4 bg-dark border-2 border-[#2a2a2a] rounded-full shadow-lg" />
                            </div>

                            {/* Status Indicator */}
                            {state.active && (
                                <div className="absolute top-0 right-0 p-2">
                                    <div className="flex gap-1.5 h-6 items-end">
                                        {[1, 2, 3].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={!state.paused ? { height: [8, 16, 12, 20, 10] } : { height: 4 }}
                                                transition={{ repeat: Infinity, duration: 1 + i * 0.2 }}
                                                className="w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Track Info & Controls */}
                        <div className="flex-1 w-full space-y-8">
                            <div className="space-y-2 text-center md:text-left">
                                <motion.h1
                                    key={state.current?.title}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-4xl font-black text-white tracking-tight line-clamp-2"
                                >
                                    {state.current?.title || "No track active"}
                                </motion.h1>
                                <p className="text-xl text-slate-400 font-medium">
                                    {state.current?.author || "Play something to start"}
                                </p>
                            </div>

                            {/* Progress Area */}
                            <div className="space-y-2">
                                <div
                                    className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden cursor-pointer group"
                                    onClick={handleSeek}
                                >
                                    <div className="absolute top-0 left-0 h-full bg-white/10 w-full group-hover:opacity-100 opacity-0 transition-opacity" />
                                    <motion.div
                                        className="absolute top-0 left-0 h-full bg-primary"
                                        initial={false}
                                        animate={{ width: state.current ? `${(state.position / state.current.duration) * 100}%` : '0%' }}
                                        transition={{ type: "tween", ease: "linear" }}
                                    />
                                    {/* Seek indicator handle (visible on hover) */}
                                    <motion.div
                                        className="absolute top-0 w-3 h-3 bg-white rounded-full -mt-0.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        animate={{ left: state.current ? `${(state.position / state.current.duration) * 100}%` : '0%' }}
                                        style={{ transform: 'translateX(-50%)' }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs font-mono text-slate-500 font-bold tracking-widest uppercase">
                                    <span>{formatTime(state.position)}</span>
                                    <span>{state.current ? formatTime(state.current.duration) : "0:00"}</span>
                                </div>
                            </div>

                            {/* Controls Bar */}
                            <div className="flex flex-wrap items-center justify-center md:justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleControl('loop', state.loop === 'off' ? 'track' : state.loop === 'track' ? 'queue' : 'off')}
                                        className={`p-3 rounded-xl transition-all ${state.loop !== 'off' ? 'bg-primary/20 text-primary' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                        title={`Loop: ${state.loop}`}
                                    >
                                        <div className="relative">
                                            <Repeat size={22} />
                                            {state.loop === 'track' && <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-primary text-white px-1 rounded-sm">1</span>}
                                        </div>
                                    </button>
                                    <button
                                        onClick={fetchLyrics}
                                        className={`p-3 rounded-xl transition-all ${activeTab === 'lyrics' ? 'bg-primary/20 text-primary' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                        title="Show Lyrics"
                                    >
                                        <Mic2 size={22} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-8">
                                    <button onClick={() => handleControl('stop')} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
                                        <Square size={24} fill="currentColor" />
                                    </button>
                                    <button
                                        onClick={() => handleControl(state.paused ? 'resume' : 'pause')}
                                        className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-primary/20"
                                    >
                                        {state.paused || !state.current ? <Play size={36} fill="currentColor" className="ml-1" /> : <Pause size={36} fill="currentColor" />}
                                    </button>
                                    <button onClick={() => handleControl('skip')} className="p-2 text-slate-500 hover:text-white transition-transform hover:translate-x-1">
                                        <SkipForward size={28} fill="currentColor" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 group/vol">
                                    <Volume2 size={20} className="text-slate-500" />
                                    <div className="w-32 h-1.5 bg-white/5 rounded-full relative overflow-hidden group/bar cursor-pointer">
                                        <input
                                            type="range" min="0" max="100"
                                            value={state.volume}
                                            onChange={(e) => handleControl('volume', e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="absolute inset-0 bg-primary" style={{ width: `${state.volume}%` }} />
                                    </div>
                                    <span className="text-xs font-mono text-slate-500 w-8">{state.volume}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats / Extra Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Clock, label: "Total Length", value: state.current ? formatTime(state.current.duration) : "--:--" },
                            { icon: Layers, label: "Queue Size", value: `${queue.length} Tracks` },
                            { icon: Radio, label: "Current Effect", value: state.filter.toUpperCase() }
                        ].map((stat, i) => (
                            <div key={i} className="glass-card p-6 rounded-3xl border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                                        <stat.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                        <p className="text-lg font-bold text-white">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Side Tabbed Content (4 columns) */}
                <div className="lg:col-span-12 xl:col-span-4 h-full min-h-[600px]">
                    <div className="glass-card flex flex-col h-full rounded-[2.5rem] bg-dark-lighter border-white/5 overflow-hidden">
                        <div className="flex p-3 bg-white/[0.03] gap-2 border-b border-white/5">
                            {[
                                { id: 'queue', icon: ListMusic, label: 'Queue' },
                                { id: 'filters', icon: Settings2, label: 'Filters' },
                                { id: 'lyrics', icon: Mic2, label: 'Lyrics' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                                >
                                    <tab.icon size={16} />
                                    <span className="hidden md:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
                            <AnimatePresence mode="wait">
                                {activeTab === 'queue' && (
                                    <motion.div
                                        key="queue"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-3"
                                    >
                                        {queue.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-80 text-center space-y-4 text-slate-600">
                                                <ListMusic size={64} opacity={0.1} />
                                                <p className="font-bold">The queue is currently empty</p>
                                            </div>
                                        ) : (
                                            queue.map((track, i) => (
                                                <motion.div
                                                    key={`${track.uri}-${i}`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className={`group flex items-center gap-4 p-3 rounded-2xl border transition-all ${i === 0 ? 'bg-primary/10 border-primary/20' : 'hover:bg-white/5 border-transparent'}`}
                                                >
                                                    <div className="relative w-12 h-12 flex-shrink-0">
                                                        <img src={track.thumbnail} className="w-full h-full rounded-xl object-cover shadow-lg" />
                                                        {i === 0 && (
                                                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded-xl">
                                                                <Play size={16} fill="currentColor" className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-bold text-sm truncate ${i === 0 ? 'text-primary' : 'text-slate-200'} group-hover:text-primary transition-colors`}>
                                                            {track.title}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 truncate">{track.author}</p>
                                                    </div>
                                                    <span className="text-[10px] font-mono font-black text-slate-600">
                                                        {formatTime(track.duration)}
                                                    </span>
                                                </motion.div>
                                            ))
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'filters' && (
                                    <motion.div
                                        key="filters"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="grid grid-cols-2 gap-3"
                                    >
                                        {['none', 'bassboost', 'nightcore', 'vaporwave', 'pop', 'soft', 'treblebass', '8d', 'karaoke'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => handleControl('filter', f)}
                                                className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 relative overflow-hidden group ${state.filter === f ? 'bg-primary border-primary shadow-xl shadow-primary/20' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                                            >
                                                {state.filter === f && (
                                                    <motion.div layoutId="filter-active" className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                                                )}
                                                <div className={`p-3 rounded-2xl ${state.filter === f ? 'bg-white/20' : 'bg-white/5 group-hover:bg-primary/10'} transition-colors`}>
                                                    <Radio size={20} className={state.filter === f ? 'text-white' : 'text-primary'} />
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${state.filter === f ? 'text-white' : 'text-slate-400'}`}>
                                                    {f}
                                                </span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}

                                {activeTab === 'lyrics' && (
                                    <motion.div
                                        key="lyrics"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="space-y-6"
                                    >
                                        {!lyrics ? (
                                            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                                                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Fetching lyrics...</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-8 pb-10">
                                                <div className="sticky top-0 bg-dark-lighter/80 backdrop-blur-md pt-2 pb-6 z-10 border-b border-white/5">
                                                    <h3 className="text-2xl font-black text-white">{lyrics.title || "Unknown"}</h3>
                                                    <p className="text-primary font-bold">{lyrics.artist}</p>
                                                </div>
                                                <p className="whitespace-pre-wrap text-lg text-slate-300 font-medium leading-relaxed px-2 selection:bg-primary selection:text-white">
                                                    {lyrics.lyrics}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Playback Controls Tip */}
            <div className="flex items-center justify-center gap-2 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] relative z-10 py-4 opacity-50">
                <Music size={12} />
                <span>Premium Audio Suite • Powered by Shoukaku</span>
                <Music size={12} />
            </div>
        </div>
    );
};

export default MusicPlayer;
