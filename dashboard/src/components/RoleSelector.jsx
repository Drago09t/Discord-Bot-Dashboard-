import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, Shield } from 'lucide-react';
import axios from 'axios';

const RoleSelector = ({ guildId, selectedRoles = [], onChange, label = "Select Roles" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (guildId && isOpen && roles.length === 0) {
            fetchRoles();
        }
    }, [guildId, isOpen]);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/guild/${guildId}/roles`);
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
            setRoles([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredRoles = roles.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleRole = (roleId) => {
        const newSelection = selectedRoles.includes(roleId)
            ? selectedRoles.filter(id => id !== roleId)
            : [...selectedRoles, roleId];
        onChange(newSelection);
    };

    const getSelectedCount = () => {
        return selectedRoles.length;
    };

    return (
        <div className="relative">
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                {label}
            </label>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-12 px-4 glass-card flex items-center justify-between hover:bg-white/10 transition-colors"
            >
                <span className="text-sm font-medium">
                    {getSelectedCount() > 0
                        ? `${getSelectedCount()} role${getSelectedCount() > 1 ? 's' : ''} selected`
                        : 'Select roles...'}
                </span>
                <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        ></div>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full mt-2 left-0 w-full glass-card p-2 z-50 overflow-hidden shadow-2xl border-white/20 max-h-80"
                        >
                            <div className="p-2 mb-2 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search roles..."
                                    className="w-full bg-black/40 border border-white/5 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-primary/50"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>

                            <div className="max-h-56 overflow-y-auto space-y-1 px-1">
                                {loading ? (
                                    <p className="text-center py-4 text-xs text-slate-500">Loading roles...</p>
                                ) : filteredRoles.length === 0 ? (
                                    <p className="text-center py-4 text-xs text-slate-500 font-medium">No roles found</p>
                                ) : (
                                    filteredRoles.map((role) => {
                                        const isSelected = selectedRoles.includes(role.id);
                                        return (
                                            <button
                                                key={role.id}
                                                onClick={() => toggleRole(role.id)}
                                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left group ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                                            >
                                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-slate-600'}`}>
                                                    {isSelected && <Check size={12} className="text-white" />}
                                                </div>

                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99AAB5' }}
                                                ></div>

                                                <span className="text-xs font-semibold flex-1 truncate">{role.name}</span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoleSelector;
