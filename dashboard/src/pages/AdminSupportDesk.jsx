import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LifeBuoy,
    MessageCircle,
    ExternalLink,
    Clock,
    Server,
    User,
    Trash2,
    Search,
    Filter,
    ArrowRightCircle,
    CheckCircle2,
    ShieldAlert
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const AdminSupportDesk = () => {
    const { showNotification } = useNotification();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await axios.get('/api/admin/tickets/all');
            setTickets(response.data.tickets);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = tickets.filter(ticket =>
        ticket.guild_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.channel_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                    Support Desk
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse mt-1" />
                </h1>
                <p className="text-slate-500 mt-2 font-medium">A centralized command center for monitoring active support tickets across the network.</p>
            </motion.div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden">
                {/* Toolbar */}
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row gap-6 justify-between items-center">
                    <div className="relative group flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Guild ID or User ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={fetchTickets} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                            <Clock size={18} />
                        </button>
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{tickets.length} Active Tickets</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {filteredTickets.map((ticket, i) => (
                            <motion.div
                                key={ticket.id || i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 space-y-6 group hover:bg-white/[0.05] hover:border-blue-500/20 transition-all"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <MessageCircle size={20} />
                                    </div>
                                    <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                        Active
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Server Identifier</label>
                                        <div className="flex items-center gap-2 text-white font-bold group-hover:text-blue-400 transition-colors cursor-pointer">
                                            <Server size={14} />
                                            <span className="truncate">{ticket.guild_id}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Reported By</label>
                                        <div className="flex items-center gap-2 text-slate-400 font-medium">
                                            <User size={14} />
                                            <span className="truncate">{ticket.user_id}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Opened At</span>
                                            <span className="text-xs text-slate-500">{new Date(ticket.created_at).toLocaleString()}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 text-slate-600 hover:text-white transition-colors">
                                                <ExternalLink size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredTickets.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-600 opacity-30 text-center">
                            <LifeBuoy size={64} className="mb-4" />
                            <p className="font-black uppercase tracking-[0.2em] text-sm italic">Clear Horizons</p>
                            <p className="text-xs font-medium mt-1">No active support interactions detected.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSupportDesk;
