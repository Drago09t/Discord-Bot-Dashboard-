import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShieldAlert, Ban, Power, ShieldOff, AlertTriangle, Plus, Trash2, User, Server } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const AdminSecurity = () => {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [maintenance, setMaintenance] = useState(false);
    const [blacklist, setBlacklist] = useState([]);
    const [targetId, setTargetId] = useState('');
    const [type, setType] = useState('user');
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchSecurityData();
    }, []);

    const fetchSecurityData = async () => {
        try {
            const [mRes, bRes] = await Promise.all([
                axios.get('/api/admin/maintenance'),
                axios.get('/api/admin/blacklist')
            ]);
            setMaintenance(mRes.data.maintenanceMode);
            setBlacklist(bRes.data.blacklist);
        } catch (error) {
            console.error('Failed to fetch security data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMaintenance = async () => {
        try {
            const response = await axios.post('/api/admin/maintenance/toggle', { enabled: !maintenance });
            setMaintenance(response.data.maintenanceMode);
            showNotification('success', `Maintenance mode ${!maintenance ? 'ENABLED' : 'DISABLED'}`, 'System Security');
        } catch (error) {
            showNotification('error', 'Failed to toggle maintenance mode.', 'Error');
        }
    };

    const handleAddBlacklist = async () => {
        if (!targetId.trim()) return;
        try {
            await axios.post('/api/admin/blacklist/add', { targetId, type, reason });
            showNotification('success', 'Target blacklisted successfully!', 'Blacklist Updated');
            setTargetId('');
            setReason('');
            fetchSecurityData();
        } catch (error) {
            showNotification('error', 'Failed to update blacklist.', 'Error');
        }
    };

    const handleRemoveBlacklist = async (id) => {
        try {
            await axios.delete(`/api/admin/blacklist/${id}`);
            showNotification('success', 'Target removed from blacklist.', 'Blacklist Updated');
            fetchSecurityData();
        } catch (error) {
            showNotification('error', 'Failed to remove from blacklist.', 'Error');
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                    Global Security
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse mt-1" />
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Protect the network through maintenance mode and global blacklisting.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Maintenance Mode Card */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
                    <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-700 ${maintenance ? 'from-red-500/10 via-transparent to-red-500/5 opacity-100' : 'from-emerald-500/10 via-transparent to-emerald-500/5 opacity-0'}`} />

                    <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                        <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 ${maintenance ? 'bg-red-500 text-white shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 'bg-emerald-500 text-white shadow-[0_0_50px_rgba(16,185,129,0.3)]'}`}>
                            {maintenance ? <ShieldOff size={40} /> : <ShieldAlert size={40} />}
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">System Maintenance</h3>
                            <p className="text-slate-500 font-medium mt-1">
                                {maintenance
                                    ? 'The bot is currently restricted. Only administrators can use commands.'
                                    : 'The bot is operating normally across all servers.'}
                            </p>
                        </div>

                        <button
                            onClick={toggleMaintenance}
                            className={`px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center gap-3 ${maintenance ? 'bg-white text-black hover:bg-slate-100' : 'bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/20'}`}
                        >
                            <Power size={18} />
                            {maintenance ? 'Disable Restrictions' : 'Activate Maintenance'}
                        </button>
                    </div>
                </motion.div>

                {/* Add to Blacklist Form */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 space-y-8">
                    <div>
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                            <Ban size={24} className="text-red-500" />
                            Global Blacklist
                        </h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">Restrict access for specific users or servers across the entire network.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'user', name: 'User ID', icon: <User size={14} /> },
                                { id: 'guild', name: 'Guild ID', icon: <Server size={14} /> }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setType(t.id)}
                                    className={`py-4 rounded-2xl border transition-all flex items-center justify-center gap-2 ${type === t.id ? 'bg-red-500 text-white border-red-500' : 'bg-white/[0.02] border-white/5 text-slate-500 hover:text-white'}`}
                                >
                                    {t.icon}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                placeholder="Enter Target ID (User or Guild)..."
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-red-500/50 transition-all font-bold"
                            />
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Reason for blacklist (optional)..."
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-red-500/50 transition-all font-medium resize-none h-24"
                            />
                        </div>

                        <button
                            onClick={handleAddBlacklist}
                            className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 hover:bg-slate-100 transition-all"
                        >
                            <Plus size={18} />
                            Commit Blacklist
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Blacklist History Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden">
                <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                        <AlertTriangle size={24} className="text-amber-500" />
                        Blacklist Registry
                    </h3>
                    <span className="bg-white/[0.02] border border-white/5 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {blacklist.length} Registered Targets
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/[0.02] border-b border-white/5">
                            <tr>
                                <th className="px-10 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Type</th>
                                <th className="px-10 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Target ID</th>
                                <th className="px-10 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Reason</th>
                                <th className="px-10 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {blacklist.map((item, i) => (
                                <tr key={i} className="hover:bg-red-500/[0.02] transition-colors group">
                                    <td className="px-10 py-5">
                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.type === 'user' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-10 py-5">
                                        <span className="text-white font-mono font-bold">{item.target_id}</span>
                                    </td>
                                    <td className="px-10 py-5">
                                        <p className="text-slate-500 font-medium text-sm italic truncate max-w-sm">{item.reason || 'No reason provided'}</p>
                                    </td>
                                    <td className="px-10 py-5 text-right">
                                        <button
                                            onClick={() => handleRemoveBlacklist(item.target_id)}
                                            className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {blacklist.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-10 py-20 text-center text-slate-600 opacity-50 font-black uppercase tracking-[0.2em] text-[10px]">Registry Empty</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminSecurity;
