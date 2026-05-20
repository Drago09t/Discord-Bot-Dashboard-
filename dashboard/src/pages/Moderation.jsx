import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gavel,
    Shield,
    AlertTriangle,
    Check,
    X,
    Edit2,
    Save,
    Search,
    Filter,
    ChevronDown,
    Lock
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

// Command Configuration
const COMMANDS = [
    { name: 'ban', description: 'Bans a member from the server.', category: 'Moderation' },
    { name: 'unban', description: 'Unbans a member.', category: 'Moderation' },
    { name: 'kick', description: 'Kicks a member from the server.', category: 'Moderation' },
    { name: 'vkick', description: 'Kicks a member from a voice channel.', category: 'Moderation' },
    { name: 'mute', description: 'Mutes a member via role/timeout.', category: 'Moderation' },
    { name: 'unmute', description: 'Unmutes a member.', category: 'Moderation' },
    { name: 'timeout', description: 'Timeouts a member.', category: 'Moderation' },
    { name: 'untimeout', description: 'Removes a timeout from a member.', category: 'Moderation' },
    { name: 'clear', description: 'Cleans up channel messages.', category: 'Moderation' },
    { name: 'move', description: 'Moves a member to another voice channel.', category: 'Moderation' },
    { name: 'setnick', description: 'Changes the nickname of a member.', category: 'Utility' },
    { name: 'role', description: 'Add/remove role(s) for a member.', category: 'Utility' },
    { name: 'points', description: 'Manage server points for members.', category: 'Economy' },
    { name: 'warn', description: 'Warns a member.', category: 'Moderation' },
    { name: 'warnings', description: 'View warnings for a member.', category: 'Moderation' }
];

const Moderation = ({ guild }) => {
    const { showNotification } = useNotification();
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingCommand, setEditingCommand] = useState(null);
    const [saving, setSaving] = useState(false);

    // Initial load
    useEffect(() => {
        if (guild?.id) {
            fetchSettings();
        }
    }, [guild]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/moderation/${guild.id}`);
            // Transform array to object for easier access
            const settingsMap = {};
            response.data.settings.forEach(s => {
                settingsMap[s.command_name] = s;
            });
            setSettings(settingsMap);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (commandName, currentState) => {
        const newState = !currentState;

        // Optimistic update
        setSettings(prev => ({
            ...prev,
            [commandName]: { ...prev[commandName], enabled: newState }
        }));

        try {
            await axios.post(`/api/moderation/${guild.id}/update`, {
                command: commandName,
                updates: { enabled: newState }
            });
            showNotification('success', `Command /${commandName} is now ${newState ? 'active' : 'inactive'}.`, 'Terminal Updated');
        } catch (error) {
            console.error('Error updating toggle:', error);
            showNotification('error', 'Protocol override failed.', 'Access Denied');
            // Revert on error
            setSettings(prev => ({
                ...prev,
                [commandName]: { ...prev[commandName], enabled: currentState }
            }));
        }
    };

    const handleSaveEdit = async (updates) => {
        setSaving(true);
        try {
            const response = await axios.post(`/api/moderation/${guild.id}/update`, {
                command: editingCommand.name,
                updates: updates // { allowed_roles: [], allowed_channels: [] }
            });

            setSettings(prev => ({
                ...prev,
                [editingCommand.name]: { ...prev[editingCommand.name], ...updates }
            }));
            setEditingCommand(null);
            showNotification('success', `Security rules for /${editingCommand.name} updated.`, 'Rules Applied');
        } catch (error) {
            console.error('Error saving command settings:', error);
            showNotification('error', 'Failed to push configuration to the core.', 'Upload Failed');
        } finally {
            setSaving(false);
        }
    };

    const filteredCommands = COMMANDS.filter(cmd =>
        cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin text-primary">
                    <Gavel size={32} />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3">
                        <Shield className="text-primary" size={32} />
                        Moderation System
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Manage command permissions, toggles, and advanced moderation rules.
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search commands..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="glass-input pl-10 w-64"
                    />
                </div>
            </div>

            {/* Global Switches / Features (Future expansion) */}
            {/* <div className="glass-card p-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white">Global Moderation</h3>
                    <p className="text-slate-400 text-sm">Master switch for all moderation features</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked readOnly />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
            </div> */}

            {/* Command List */}
            <motion.div layout className="grid gap-4">
                <AnimatePresence>
                    {filteredCommands.map(cmd => {
                        const setting = settings[cmd.name] || { enabled: true }; // Default to enabled
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={cmd.name}
                                className={`glass-card p-5 flex items-center justify-between border-l-4 ${setting.enabled ? 'border-l-primary' : 'border-l-slate-600'}`}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-white font-mono">/{cmd.name}</h3>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                                            {cmd.category}
                                        </span>
                                        {setting.allowed_roles?.length > 0 && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                                                <Lock size={10} /> Role Locked
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-sm mt-1">{cmd.description}</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setEditingCommand({ ...cmd, ...setting })}
                                        className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-2"
                                    >
                                        <Edit2 size={14} />
                                        Edit
                                    </button>

                                    <div
                                        onClick={() => handleToggle(cmd.name, setting.enabled)}
                                        className="relative inline-flex items-center cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={setting.enabled ?? true}
                                            readOnly
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingCommand && (
                    <EditModal
                        command={editingCommand}
                        onClose={() => setEditingCommand(null)}
                        onSave={handleSaveEdit}
                        saving={saving}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const EditModal = ({ command, onClose, onSave, saving }) => {
    const [roles, setRoles] = useState(command.allowed_roles || []);
    // Simple text input for roles for now, split by comma or enter
    const [roleInput, setRoleInput] = useState(roles.join(', '));

    const handleSubmit = () => {
        // Parse roles
        const cleanRoles = roleInput.split(',')
            .map(r => r.trim())
            .filter(r => r.length > 0);

        onSave({ allowed_roles: cleanRoles });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card w-full max-w-lg p-6 border border-white/10 shadow-2xl space-y-6"
            >
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Edit2 size={20} className="text-primary" />
                        Edit /{command.name}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 block">Allowed Roles (IDs)</label>
                        <p className="text-xs text-slate-500 mb-2">
                            Only users with these role IDs can use this command. Leave empty for all (or default permissions).
                        </p>
                        <textarea
                            value={roleInput}
                            onChange={(e) => setRoleInput(e.target.value)}
                            placeholder="Enter Role IDs separated by comma..."
                            className="glass-input w-full min-h-[100px] font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="btn-primary flex items-center gap-2"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        Save Changes
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Moderation;
