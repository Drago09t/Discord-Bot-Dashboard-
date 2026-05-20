import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Radio,
    Send,
    History,
    Users,
    Crown,
    AlertCircle,
    CheckCircle2,
    X,
    Layout,
    Type,
    Eye,
    Zap,
    MessageSquare,
    Activity
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const AdminBroadcast = () => {
    const { showNotification } = useNotification();
    const [content, setContent] = useState('');
    const [targetType, setTargetType] = useState('all');
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get('/api/admin/broadcast/history');
            setHistory(response.data.history);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!content.trim()) return;
        setSending(true);
        try {
            await axios.post('/api/admin/broadcast/send', { content, targetType });
            showNotification('success', 'Broadcast emitted successfully!', 'Message Active');
            setContent('');
            fetchHistory();
        } catch (error) {
            showNotification('error', 'Failed to send broadcast.', 'Transmission Error');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                    Global Broadcast
                    <div className="px-3 py-1 bg-amber-500 rounded-full text-[10px] text-black not-italic font-black tracking-[0.2em] animate-pulse uppercase">Live</div>
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Transmit direct announcements to all clusters in the network.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Composer */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-10 relative overflow-hidden group"
                    >
                        {/* Ambient Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] -z-10 group-hover:bg-amber-500/20 transition-colors" />

                        <div className="space-y-8 relative z-10">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block px-2">Announcement Content</label>
                                <div className="relative">
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Enter your transmission content here..."
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 text-white text-lg font-medium focus:outline-none focus:border-amber-500/50 min-h-[300px] transition-all resize-none custom-scrollbar"
                                    />
                                    <div className="absolute bottom-6 right-8 text-[10px] font-black text-slate-600 tracking-widest uppercase">
                                        {content.length} Characters
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block px-2">Target Sectors</label>
                                    <div className="flex gap-4">
                                        {[
                                            { id: 'all', name: 'Global', icon: <Users size={16} /> },
                                            { id: 'premium', name: 'Premium Only', icon: <Crown size={16} /> }
                                        ].map(target => (
                                            <button
                                                key={target.id}
                                                onClick={() => setTargetType(target.id)}
                                                className={`flex-1 py-4 px-6 rounded-2xl border transition-all flex items-center justify-center gap-3 ${targetType === target.id ? 'bg-amber-500/10 border-amber-500/20 text-white' : 'bg-white/[0.02] border-white/5 text-slate-600 hover:text-slate-400'}`}
                                            >
                                                {target.icon}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{target.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={handleSend}
                                        disabled={sending || !content.trim()}
                                        className="w-full h-[60px] bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 shadow-2xl shadow-white/5"
                                    >
                                        {sending ? (
                                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Emit Transmission
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Preview (Client Side Sim) */}
                    <div className="mx-6">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block px-2 italic">Live Preview (Mobile View)</label>
                        <div className="w-full max-w-sm mx-auto bg-[#2b2d31] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                            <div className="p-4 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black">
                                    <Zap size={20} fill="currentColor" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold text-sm">Vortex System</span>
                                        <div className="bg-[#5865f2] text-white text-[9px] px-1 font-bold rounded">BOT</div>
                                        <span className="text-slate-500 text-[10px]">Today at 4:20 PM</span>
                                    </div>
                                    <div className="bg-[#1e1f22] border-l-4 border-amber-500 p-3 rounded-r-lg space-y-1">
                                        <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest">
                                            <Radio size={10} />
                                            System Broadcast
                                        </div>
                                        <p className="text-slate-300 text-sm italic">{content || "Start typing to see preview..."}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Sidebar */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 min-h-[600px] flex flex-col"
                    >
                        <h3 className="text-lg font-black text-white italic uppercase tracking-tighter flex items-center gap-3 mb-8">
                            <History size={20} className="text-amber-500" />
                            Transmission Logs
                        </h3>

                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                            {loading ? (
                                <div className="flex justify-center py-10 opacity-30">
                                    <Activity className="animate-spin text-amber-500" />
                                </div>
                            ) : history.length > 0 ? (
                                history.map((log, idx) => (
                                    <div key={log.id || idx} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-3 group hover:bg-white/[0.04] transition-all">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Crown size={12} className={log.target_type === 'premium' ? 'text-amber-500' : 'text-slate-700'} />
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{log.target_type} Sector</span>
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-700">{new Date(log.sent_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-400 font-medium truncate italic">"{log.message_content}"</p>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                    <MessageSquare size={40} className="mb-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">No previous broadcasts</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminBroadcast;
