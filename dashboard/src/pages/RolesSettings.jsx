import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Shield, Sparkles, Plus, Trash2, Hash, Smile, Clipboard, List, ArrowRight, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const RolesSettings = ({ guild }) => {
    const [activeTab, setActiveTab] = useState('auto');
    const [loading, setLoading] = useState(false);
    const [guildRoles, setGuildRoles] = useState([]);
    const [autoRoles, setAutoRoles] = useState([]);
    const [reactionRoles, setReactionRoles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editRR, setEditRR] = useState(null);

    // New Reaction Role State
    const [newRR, setNewRR] = useState({ messageId: '', emoji: '', roleId: '' });



    useEffect(() => {
        if (guild) {
            fetchData();
        }
    }, [guild]);

    const openEditModal = (rr) => {
        setEditRR({ id: rr.id, messageId: rr.message_id, emoji: rr.emoji, roleId: rr.role_id });
        setNewRR({ messageId: rr.message_id, emoji: rr.emoji, roleId: rr.role_id });
        setShowModal(true);
    };

    const handleEditReactionRole = async () => {
        if (!newRR.messageId || !newRR.emoji || !newRR.roleId) return;
        try {
            // Check if key (messageId or emoji) changed, if so delete original
            if (editRR && (editRR.messageId !== newRR.messageId || editRR.emoji !== newRR.emoji)) {
                await axios.delete(`/api/roles/reaction/${guild.id}`, {
                    data: { messageId: editRR.messageId, emoji: editRR.emoji }
                });
            }

            const res = await axios.post(`/api/roles/reaction/${guild.id}/add`, newRR);
            if (res.data.success) {
                await fetchData();
                setShowModal(false);
                setEditRR(null);
                setNewRR({ messageId: '', emoji: '', roleId: '' });
            }
        } catch (error) {
            console.error('Failed to edit reaction role:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Guild Roles
            try {
                const rolesRes = await axios.get(`/api/guild/${guild.id}/roles`);
                setGuildRoles(rolesRes.data);
            } catch (error) {
                console.error('Failed to fetch guild roles:', error);
            }

            // Fetch Auto Roles
            try {
                const autoRes = await axios.get(`/api/roles/auto/${guild.id}`);
                setAutoRoles(autoRes.data.roles || []);
            } catch (error) {
                console.error('Failed to fetch auto roles:', error);
            }

            // Fetch Reaction Roles
            try {
                const reactionRes = await axios.get(`/api/roles/reaction/${guild.id}`);
                setReactionRoles(reactionRes.data.roles || []);
            } catch (error) {
                console.error('Failed to fetch reaction roles:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAutoRole = async (roleId) => {
        const isAdded = autoRoles.includes(roleId);
        const updatedRoles = isAdded
            ? autoRoles.filter(id => id !== roleId)
            : [...autoRoles, roleId];

        setAutoRoles(updatedRoles);
        try {
            await axios.post(`/api/roles/auto/${guild.id}/update`, { roles: updatedRoles });
        } catch (error) {
            console.error('Failed to update auto roles:', error);
        }
    };

    const handleAddReactionRole = async () => {
        if (!newRR.messageId || !newRR.emoji || !newRR.roleId) return;
        try {
            const res = await axios.post(`/api/roles/reaction/${guild.id}/add`, newRR);
            if (res.data.success) {
                // Refresh list from backend
                await fetchData();
                setShowModal(false);
                setNewRR({ messageId: '', emoji: '', roleId: '' });
            }
        } catch (error) {
            console.error('Failed to add reaction role:', error);
        }
    };

    const handleDeleteReactionRole = async (rr) => {
        try {
            await axios.delete(`/api/roles/reaction/${guild.id}`, { data: { messageId: rr.message_id, emoji: rr.emoji } });
            // Refresh list after deletion
            await fetchData();
        } catch (error) {
            console.error('Failed to delete reaction role:', error);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8 min-h-screen">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Shield className="text-blue-400" /> Roles & Reactions
                    </h1>
                    <p className="text-slate-400 mt-1">Automate your server's role management with ease.</p>
                </div>

                <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('auto')}
                        className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === 'auto' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Shield size={16} /> Auto-Roles
                    </button>
                    <button
                        onClick={() => setActiveTab('reaction')}
                        className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === 'reaction' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Smile size={16} /> Reaction Roles
                    </button>
                </div>
            </header>

            {activeTab === 'auto' ? (
                <div className="space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <Sparkles className="text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Join Roles</h2>
                                <p className="text-sm text-slate-400">Select roles to be automatically given to new members when they join.</p>
                            </div>
                        </div>

                        {guildRoles.length === 0 && !loading && (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-6 text-yellow-200 flex items-center gap-2">
                                <Shield size={18} />
                                <span>No roles found. Ensure the bot is in this server and has permission to view roles.</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {guildRoles.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => handleToggleAutoRole(role.id)}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${autoRoles.includes(role.id)
                                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-100 ring-2 ring-blue-500/20'
                                        : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 text-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99aab5' }}
                                        />
                                        <span className="font-medium truncate">{role.name}</span>
                                    </div>
                                    {autoRoles.includes(role.id) && <div><Shield size={16} className="text-blue-400" /></div>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-xl">
                                <Smile className="text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Message Reaction Roles</h2>
                                <p className="text-sm text-slate-400">Users get a role when they react to a specific message.</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                console.log('Opening Modal...');
                                setEditRR(null);
                                setNewRR({ messageId: '', emoji: '', roleId: '' });
                                setShowModal(true);
                            }}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Plus size={18} /> Add Role
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reactionRoles.map((rr) => {
                            const role = guildRoles.find(r => r.id === rr.role_id);
                            return (
                                <div key={rr.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl p-2 bg-slate-800 rounded-lg">{rr.emoji}</div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-white">{role?.name || 'Unknown Role'}</span>
                                                <ArrowRight size={14} className="text-slate-500" />
                                                <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                                                    <Clipboard size={12} /> {rr.message_id.slice(0, 8)}...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(rr)}
                                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteReactionRole(rr)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* RR Modal */}
            {console.log('[RolesSettings] Render. showModal:', showModal, 'activeTab:', activeTab)}
            {showModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md debug-modal-overlay"
                    onClick={() => console.log("[RolesSettings] Overlay Clicked")}
                    style={{ pointerEvents: 'auto' }} // Force pointer events
                >
                    <div
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6 relative"
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log("[RolesSettings] Modal Content Clicked");
                        }}
                    >
                        {console.log("[RolesSettings] Rendering Modal Body Content")}
                        <h3 className="text-2xl font-bold text-white">{editRR ? 'Edit Reaction Role' : 'New Reaction Role'}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
                                    <Hash size={14} /> Message ID
                                </label>
                                <input
                                    type="text"
                                    placeholder="Paste message ID here..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                                    value={newRR.messageId}
                                    onChange={(e) => setNewRR({ ...newRR, messageId: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Emoji</label>
                                    <input
                                        type="text"
                                        placeholder="🔥"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-center text-xl"
                                        value={newRR.emoji}
                                        onChange={(e) => setNewRR({ ...newRR, emoji: e.target.value })}
                                    />
                                </div>
                                <div className="flex-[2]">
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 font-mono">Role</label>
                                    <select
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        value={newRR.roleId}
                                        onChange={(e) => setNewRR({ ...newRR, roleId: e.target.value })}
                                    >
                                        <option value="">Select a Role</option>
                                        {guildRoles.length === 0 && <option disabled>No roles available (Bot missing permissions?)</option>}
                                        {guildRoles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditRR(null);
                                    setNewRR({ messageId: '', emoji: '', roleId: '' });
                                }}
                                className="flex-1 py-3 text-slate-300 hover:bg-slate-800 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editRR ? handleEditReactionRole : handleAddReactionRole}
                                className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
                            >
                                {editRR ? 'Save Changes' : 'Create Rule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesSettings;
