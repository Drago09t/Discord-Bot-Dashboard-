import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Key, Plus, Copy, CheckCircle2, History, Zap, Shield, Gift } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const AdminKeyManager = () => {
    const { showNotification } = useNotification();
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [tier, setTier] = useState(1);
    const [duration, setDuration] = useState(30);

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const response = await axios.get('/api/admin/vouchers');
            setVouchers(response.data.vouchers);
        } catch (error) {
            console.error('Failed to fetch vouchers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await axios.post('/api/admin/vouchers/generate', { tier, durationDays: duration });
            showNotification('success', 'Voucher generated successfully!', 'System Update');
            fetchVouchers();
        } catch (error) {
            showNotification('error', 'Failed to generate voucher.', 'Error');
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        showNotification('success', 'Code copied to clipboard!', 'Clipboard');
    };

    return (
        <div className="space-y-8 pb-20">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                    License Keys
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse mt-1" />
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Generate and manage premium vouchers for the bot network.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Generator Form */}
                <div className="lg:col-span-1">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 space-y-8">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block px-2">Voucher Tier</label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 1, name: 'Tier 1', icon: <Zap size={14} /> },
                                    { id: 2, name: 'Ultra', icon: <Gift size={14} /> }
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTier(t.id)}
                                        className={`py-4 rounded-2xl border transition-all flex items-center justify-center gap-2 ${tier === t.id ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/[0.02] border-white/5 text-slate-500 hover:text-white'}`}
                                    >
                                        {t.icon}
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block px-2">Duration (Days)</label>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-amber-500/50 transition-all font-bold"
                            >
                                <option value={7}>7 Days</option>
                                <option value={30}>30 Days</option>
                                <option value={90}>90 Days</option>
                                <option value={365}>1 Year</option>
                                <option value={0}>Lifetime</option>
                            </select>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5"
                        >
                            {generating ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Plus size={18} />}
                            Generate Key
                        </button>
                    </motion.div>
                </div>

                {/* Voucher List */}
                <div className="lg:col-span-2">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden min-h-[500px]">
                        <div className="p-8 border-b border-white/5">
                            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                                <History size={20} className="text-amber-500" />
                                Active Vouchers
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/[0.02] border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Code</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Tier</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02]">
                                    {vouchers.map((v, i) => (
                                        <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-white font-mono font-bold">{v.code}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${v.tier === 2 ? 'bg-pink-500/10 text-pink-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    Tier {v.tier}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                {v.is_used ? (
                                                    <span className="text-[10px] text-slate-600 font-bold italic truncate block max-w-[150px]">Used by {v.used_by_guild}</span>
                                                ) : (
                                                    <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Available</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {!v.is_used && (
                                                    <button
                                                        onClick={() => copyToClipboard(v.code)}
                                                        className="p-2 text-slate-500 hover:text-white transition-colors"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {vouchers.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center text-slate-600 opacity-50 font-black uppercase tracking-widest text-[10px]">No vouchers found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminKeyManager;
