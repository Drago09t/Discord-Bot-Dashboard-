import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Shield, ShieldCheck, Trash2, Search, Mail, Key, Crown, Star, User, Clock } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const AdminTeamManager = () => {
    const { showNotification } = useNotification();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('moderator');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const response = await axios.get('/api/admin/team');
            setAdmins(response.data.admins);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async () => {
        if (!userId.trim()) return;
        setAdding(true);
        try {
            await axios.post('/api/admin/team/add', { userId, role });
            showNotification('success', 'Admin added to the team!', 'Security Update');
            setUserId('');
            fetchAdmins();
        } catch (error) {
            showNotification('error', 'Failed to add admin.', 'Permission Error');
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveAdmin = async (id) => {
        try {
            await axios.delete(`/api/admin/team/${id}`);
            showNotification('success', 'Admin removed from the team.', 'Security Update');
            fetchAdmins();
        } catch (error) {
            showNotification('error', 'Failed to remove admin.', 'Permission Error');
        }
    };

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
                    Staff Team
                    <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse mt-1" />
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Manage the inner circle of bot administrators and their clearance levels.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recruitment Form */}
                <div className="lg:col-span-1">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-10 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[100px] -z-10 group-hover:bg-violet-500/20 transition-colors" />

                        <div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                                <UserPlus size={24} className="text-violet-500" />
                                Onboard Admin
                            </h3>
                            <p className="text-slate-500 text-sm font-medium mt-1">Grant administrative dashboard access to a trusted user.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Discord User ID</label>
                                    <input
                                        type="text"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        placeholder="Enter 18-19 digit ID..."
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-violet-500/50 transition-all font-bold"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Clearance Level</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'moderator', name: 'Moderator', icon: <Shield size={14} /> },
                                            { id: 'admin', name: 'Administrator', icon: <ShieldCheck size={14} /> }
                                        ].map(r => (
                                            <button
                                                key={r.id}
                                                onClick={() => setRole(r.id)}
                                                className={`py-3.5 rounded-xl border transition-all flex items-center justify-center gap-2 ${role === r.id ? 'bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/20' : 'bg-white/[0.02] border-white/5 text-slate-500 hover:text-white'}`}
                                            >
                                                {r.icon}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{r.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleAddAdmin}
                                disabled={adding || !userId.trim()}
                                className="w-full py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5 border-none disabled:opacity-50"
                            >
                                {adding ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Star size={18} fill="currentColor" />}
                                Appoint Official
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Team Roster */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] overflow-hidden">
                        <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                                <Crown size={24} className="text-amber-500" />
                                Official Roster
                            </h3>
                            <span className="bg-violet-500/10 text-violet-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {admins.length} ACTIVE PERSONNEL
                            </span>
                        </div>

                        <div className="p-1 pr-0">
                            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                {admins.map((admin, i) => (
                                    <div key={admin.user_id || i} className="group px-10 py-6 border-b border-white/[0.02] hover:bg-white/[0.01] transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-white relative">
                                                <User size={28} className="text-slate-600" />
                                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 border-[#0a0a0c] flex items-center justify-center ${admin.role === 'owner' ? 'bg-amber-500' : 'bg-violet-500'}`}>
                                                    <Shield size={10} className="text-white" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-white font-black tracking-tight">{admin.user_id}</span>
                                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${admin.role === 'owner' ? 'bg-amber-500/10 text-amber-500' : 'bg-violet-500/10 text-violet-500'}`}>
                                                        {admin.role}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                                                    <Clock size={12} />
                                                    Appointed on {new Date(admin.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        {admin.role !== 'owner' && (
                                            <button
                                                onClick={() => handleRemoveAdmin(admin.user_id)}
                                                className="p-3 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminTeamManager;
