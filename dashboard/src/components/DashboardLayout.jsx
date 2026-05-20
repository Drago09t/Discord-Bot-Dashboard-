import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    ShieldCheck,
    UserPlus,
    MessageSquare,
    Activity,
    Zap,
    LogOut,
    Bell,
    Search,
    Menu,
    LogIn,
    User,
    Gavel,
    Sparkles,
    Trophy,
    Shield,
    ChevronRight,
    Settings,
    Hash,
    Layers,
    Store,
    Brain,
    Mic,
    Gift,
    Music,
    Crown,
    Radio,
    Key,
    ShieldAlert,
    History,
    BarChart3,
    Users,
    LifeBuoy
} from 'lucide-react';
import ServerSelector from './ServerSelector';
import ServerSelection from '../pages/ServerSelection';
import ErrorBoundary from './ErrorBoundary';
import Credits from './Credits';

// Helper for Discord image URLs
const getDiscordAssetUrl = (id, hash, size = 64) => {
    if (!hash) return null;
    const isAnimated = hash.startsWith('a_');
    const extension = isAnimated ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${id}/${hash}.${extension}?size=${size}`;
};

const DashboardLayout = ({ user, guilds, selectedGuild, onSelectGuild }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const menuItems = [
        { name: 'Overview', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
        { name: 'Welcome', icon: <UserPlus size={18} />, path: '/dashboard/welcome' },
        { name: 'Auto Mod', icon: <ShieldCheck size={18} />, path: '/dashboard/automod' },
        { name: 'Logging', icon: <MessageSquare size={18} />, path: '/dashboard/logging' },
        { name: 'Analytics', icon: <Activity size={18} />, path: '/dashboard/analytics' },
        { name: 'Levels', icon: <Trophy size={18} />, path: '/dashboard/ranking' },
        { name: 'Roles', icon: <Shield size={18} />, path: '/dashboard/roles' },
        { name: 'Tickets', icon: <Zap size={18} />, path: '/dashboard/tickets' },
        { name: 'Moderation', icon: <Gavel size={18} />, path: '/dashboard/moderation' },
        { name: 'AI Chat', icon: <Sparkles size={18} />, path: '/dashboard/ai-chat' },
        { name: 'AI Moderation', icon: <Brain size={18} />, path: '/dashboard/ai-moderation' },
        { name: 'Invite Logger', icon: <UserPlus size={18} />, path: '/dashboard/invite-logger' },
        { name: 'Voice & Leveling', icon: <Mic size={18} />, path: '/dashboard/voice-xp' },
        { name: 'Music Player', icon: <Music size={18} />, path: '/dashboard/music' },
        { name: 'Social Alerts', icon: <Bell size={18} />, path: '/dashboard/social' },
        { name: 'Giveaways', icon: <Gift size={18} />, path: '/dashboard/giveaways' },
        { name: 'Shop', icon: <Store size={18} />, path: '/dashboard/shop' },
        { name: 'Embed Builder', icon: <Layers size={18} />, path: '/dashboard/embed-builder' },
        { name: 'Prefix', icon: <Hash size={18} />, path: '/dashboard/prefix' },
        { name: 'Profile', icon: <User size={18} />, path: '/dashboard/profile' },
    ];

    const adminItems = [
        { name: 'Adoption', icon: <Crown size={18} />, path: '/dashboard/admin-premium' },
        { name: 'Broadcast', icon: <Radio size={18} />, path: '/dashboard/admin-broadcast' },
        { name: 'License Keys', icon: <Key size={18} />, path: '/dashboard/admin-keys' },
        { name: 'Audit Logs', icon: <History size={18} />, path: '/dashboard/admin-logs' },
        { name: 'Support Desk', icon: <LifeBuoy size={18} />, path: '/dashboard/admin-tickets' },
        { name: 'Security', icon: <ShieldAlert size={18} />, path: '/dashboard/admin-security' },
        { name: 'Management', icon: <BarChart3 size={18} />, path: '/dashboard/admin-analytics' },
        { name: 'Staff Team', icon: <Users size={18} />, path: '/dashboard/admin-team' },
    ];

    if (!user) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#030014] space-y-8 relative overflow-hidden font-inter">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-500/20 blur-[120px]" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-24 h-24 bg-gradient-to-br from-pink-600 to-violet-700 rounded-[2.8rem] flex items-center justify-center text-white"
                >
                    <Zap size={48} fill="currentColor" />
                </motion.div>
                <div className="text-center relative z-10">
                    <h1 className="text-5xl text-white font-bold tracking-tight">Access Denied</h1>
                    <p className="text-slate-500 mt-3 text-lg font-medium">Please authorize with Discord to continue.</p>
                </div>
                <div className="flex flex-col gap-4 items-center relative z-10">
                    <a
                        href="/auth/login"
                        className="px-10 py-4 bg-white text-black rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-white/5"
                    >
                        <LogIn size={20} />
                        Login with Discord
                    </a>
                    <Link to="/" className="text-slate-500 hover:text-white transition-colors font-medium">Return to Landing Page</Link>
                </div>
            </div>
        );
    }

    if (!selectedGuild) {
        return (
            <div className="h-screen bg-[#030014] relative overflow-hidden font-inter">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-500/10 blur-[120px]" />
                <ErrorBoundary>
                    <ServerSelection guilds={guilds} onSelect={onSelectGuild} user={user} />
                </ErrorBoundary>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#030014] font-inter selection:bg-pink-500/30">
            {/* Premium Grain Overlay */}
            <div className="premium-grain" />

            {/* Smooth Ambient Orbs - Restored Full Vibrancy */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-pink-500/10 blur-[150px] animate-float opacity-50" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-violet-600/10 blur-[150px] animate-float opacity-50" style={{ animationDelay: '-5s' }} />
            </div>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 0 }}
                className="bg-black/40 backdrop-blur-3xl border-r border-white/5 relative z-50 flex flex-col overflow-hidden transition-all duration-500"
            >
                <div className="p-8 h-24 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                        <Zap className="text-white fill-white" size={24} />
                    </div>
                    {isSidebarOpen && (
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xl font-bold text-white tracking-tight"
                        >
                            Vortex
                        </motion.h1>
                    )}
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pt-4">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative group ${isActive
                                    ? 'text-white'
                                    : 'text-slate-500 hover:text-white hover:bg-white/[0.03]'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-white/[0.04] rounded-2xl border border-white/10 z-0 shadow-[0_0_20px_rgba(255,255,255,0.02)]"
                                    />
                                )}
                                <div className={`relative z-10 flex items-center justify-center min-w-[20px] ${isActive ? 'text-pink-500' : 'group-hover:text-white transition-colors'}`}>
                                    {item.icon}
                                </div>
                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="font-medium text-sm relative z-10 truncate"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </Link>
                        );
                    })}

                    {/* Management Section */}
                    {isSidebarOpen && (
                        <div className="pt-6 pb-2 px-4">
                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">Management</p>
                        </div>
                    )}
                    {adminItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative group ${isActive
                                    ? 'text-white'
                                    : 'text-slate-500 hover:text-white hover:bg-white/[0.03]'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-white/[0.04] rounded-2xl border border-white/10 z-0 shadow-[0_0_20px_rgba(255,255,255,0.02)]"
                                    />
                                )}
                                <div className={`relative z-10 flex items-center justify-center min-w-[20px] ${isActive ? 'text-amber-500' : 'group-hover:text-white transition-colors'}`}>
                                    {item.icon}
                                </div>
                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="font-medium text-sm relative z-10 truncate"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {isSidebarOpen && (
                    <div className="px-6 py-3 text-center text-[10px] tracking-[0.15em] border-t border-white/5 mt-auto">
                        <Credits />
                    </div>
                )}
                <div className="p-4">
                    <div className="bg-white/[0.02] rounded-[2rem] p-3 flex items-center gap-3 border border-white/10">
                        <img
                            src={getDiscordAssetUrl(user.id, user.avatar)}
                            className="w-10 h-10 rounded-2xl border border-white/20"
                            alt=""
                        />
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate text-white uppercase tracking-wider">{user.username}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                                    <p className="text-[10px] text-pink-500/80 font-black uppercase tracking-widest">Active System</p>
                                </div>
                            </div>
                        )}
                        {isSidebarOpen && (
                            <button onClick={() => window.location.href = '/'} className="p-2 text-slate-600 hover:text-white transition-colors">
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 bg-black/20">
                <header className="h-24 flex items-center justify-between px-10 z-40 border-b border-white/5 bg-black/40 backdrop-blur-3xl">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center hover:bg-white/[0.05] transition-all text-white active:scale-90"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="relative group hidden lg:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-pink-500/40 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search system commands..."
                                className="pl-12 w-96 h-12 rounded-2xl bg-white/[0.01] border border-white/10 text-white placeholder:text-slate-800 focus:outline-none focus:border-pink-500/10 focus:bg-white/[0.02] transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-green-500/5 border border-green-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest leading-none">Online</span>
                        </div>

                        <ServerSelector
                            guilds={guilds}
                            selectedGuild={selectedGuild}
                            onSelect={onSelectGuild}
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
