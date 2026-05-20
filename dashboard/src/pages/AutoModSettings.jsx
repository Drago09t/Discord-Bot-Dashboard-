import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Shield, MessageSquare, Copy, Repeat, Link as LinkIcon,
    FileText, Type, Smile, AtSign, X, Trash2, Bell, Hash
} from 'lucide-react';
import MultiChannelSelector from '../components/MultiChannelSelector';
import RoleSelector from '../components/RoleSelector';
import { useNotification } from '../context/NotificationContext';

const AutoModSettings = ({ guild }) => {
    const { showNotification } = useNotification();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [configModal, setConfigModal] = useState(null);

    const modules = [
        { key: 'spam', name: 'SPAM (5 messages/5 sec)', icon: <MessageSquare size={20} />, desc: 'Detects rapid message spamming' },
        { key: 'badWords', name: 'BAD WORDS', icon: <Trash2 size={20} />, desc: 'Filters prohibited words' },
        { key: 'duplicatedText', name: 'DUPLICATED TEXT', icon: <Copy size={20} />, desc: 'Prevents identical messages' },
        { key: 'repeatedMessages', name: 'REPEATED MESSAGES', icon: <Repeat size={20} />, desc: 'Blocks message repetition', premium: true },
        { key: 'discordInvites', name: 'DISCORD INVITES', icon: <LinkIcon size={20} />, desc: 'Blocks Discord invite links' },
        { key: 'links', name: 'LINKS', icon: <LinkIcon size={20} />, desc: 'Filters external URLs' },
        { key: 'capsSpam', name: 'SPAMMED CAPS (70% > CAPS)', icon: <Type size={20} />, desc: 'Detects excessive caps usage' },
        { key: 'emojiSpam', name: 'EMOJI SPAM', icon: <Smile size={20} />, desc: 'Limits emoji flooding' },
        { key: 'massMention', name: 'MASS MENTION', icon: <AtSign size={20} />, desc: 'Prevents mention spam' }
    ];

    useEffect(() => {
        if (guild) {
            fetchSettings();
        }
    }, [guild]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/automod/${guild.id}`);
            setSettings(response.data.settings);
        } catch (error) {
            console.error('Error fetching automod settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (updates) => {
        setSaving(true);
        try {
            const response = await axios.post(`/api/automod/${guild.id}/update`, {
                settings: { ...settings, ...updates }
            });
            setSettings(response.data.settings);
            showNotification('success', 'Neural security protocols updated successfully.', 'Security Patched');
        } catch (error) {
            console.error('Error saving automod settings:', error);
            showNotification('error', 'Failed to synchronize security rules.', 'Protocol Error');
        } finally {
            setSaving(false);
        }
    };

    const toggleMasterSwitch = async () => {
        await saveSettings({ enabled: !settings.enabled });
    };

    const toggleModule = async (moduleKey) => {
        const newModules = {
            ...settings.modules,
            [moduleKey]: {
                ...settings.modules[moduleKey],
                enabled: !settings.modules[moduleKey].enabled
            }
        };
        await saveSettings({ modules: newModules });
    };

    const updateModuleConfig = async (moduleKey, config) => {
        const newModules = {
            ...settings.modules,
            [moduleKey]: {
                ...settings.modules[moduleKey],
                ...config
            }
        };
        await saveSettings({ modules: newModules });
        setConfigModal(null);
    };

    if (!guild) {
        return <div className="text-slate-500 text-center py-20">No server selected</div>;
    }

    if (loading || !settings) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Auto Moderation</h2>
                    <p className="text-slate-400 mt-2">Automated content filtering and protection</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${settings.enabled ? 'text-primary' : 'text-slate-500'}`}>
                        {settings.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                    <button
                        onClick={toggleMasterSwitch}
                        className={`relative w-14 h-7 rounded-full transition-colors ${settings.enabled ? 'bg-primary' : 'bg-slate-700'}`}
                        disabled={saving}
                    >
                        <motion.div
                            className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                            animate={{ left: settings.enabled ? '30px' : '4px' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    </button>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module, index) => {
                    const moduleConfig = settings.modules[module.key];
                    return (
                        <motion.div
                            key={module.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card p-6 hover:border-primary/30 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${moduleConfig?.enabled ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-500'}`}>
                                    {module.icon}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleModule(module.key);
                                    }}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${moduleConfig?.enabled ? 'bg-primary' : 'bg-slate-700'}`}
                                    disabled={saving}
                                >
                                    <motion.div
                                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                                        animate={{ left: moduleConfig?.enabled ? '24px' : '4px' }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            </div>

                            <h3 className="text-sm font-bold mb-1">{module.name}</h3>
                            {module.premium && (
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Premium Tier 2</span>
                            )}
                            <p className="text-xs text-slate-500 mb-4">{module.desc}</p>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfigModal(module.key);
                                }}
                                className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium transition-colors"
                                disabled={saving}
                            >
                                Setup / Configure
                            </button>
                        </motion.div>
                    );
                })}
            </div>

            {/* Global Settings */}
            <div className="glass-card p-8">
                <h3 className="text-xl font-bold mb-6">Global Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MultiChannelSelector
                        guildId={guild.id}
                        selectedChannels={settings.ignored_channels || []}
                        onChange={(channels) => saveSettings({ ignored_channels: channels })}
                        label="IGNORED CHANNELS"
                    />
                    <RoleSelector
                        guildId={guild.id}
                        selectedRoles={settings.ignored_roles || []}
                        onChange={(roles) => saveSettings({ ignored_roles: roles })}
                        label="IGNORED ROLES"
                    />
                    <MultiChannelSelector
                        guildId={guild.id}
                        selectedChannels={settings.only_images_channels || []}
                        onChange={(channels) => saveSettings({ only_images_channels: channels })}
                        label="ONLY IMAGES CHANNELS"
                    />
                    <MultiChannelSelector
                        guildId={guild.id}
                        selectedChannels={settings.only_youtube_channels || []}
                        onChange={(channels) => saveSettings({ only_youtube_channels: channels })}
                        label="ONLY YOUTUBE LINKS CHANNELS"
                    />
                </div>
            </div>

            {/* Configuration Modal */}
            <AnimatePresence>
                {configModal && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/60 z-50"
                            onClick={() => setConfigModal(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            onClick={() => setConfigModal(null)}
                        >
                            <div
                                className="glass-card p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold">
                                        {modules.find(m => m.key === configModal)?.name}
                                    </h3>
                                    <button
                                        onClick={() => setConfigModal(null)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <ConfigModalContent
                                    moduleKey={configModal}
                                    config={settings.modules[configModal]}
                                    guildId={guild.id}
                                    onSave={(config) => updateModuleConfig(configModal, config)}
                                    onCancel={() => setConfigModal(null)}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const ConfigModalContent = ({ moduleKey, config, guildId, onSave, onCancel }) => {
    const [action, setAction] = useState(config?.action || 'block');
    const [disabledChannels, setDisabledChannels] = useState(config?.disabledChannels || []);
    const [disabledRoles, setDisabledRoles] = useState(config?.disabledRoles || []);

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                    CHOOSE THE RESPONSE
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setAction('block')}
                        className={`p-4 rounded-xl border-2 transition-all ${action === 'block' ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${action === 'block' ? 'border-primary' : 'border-slate-600'}`}>
                                {action === 'block' && <div className="w-3 h-3 rounded-full bg-primary" />}
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm">Block Message</div>
                                <div className="text-xs text-slate-500">Delete the message</div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setAction('mute')}
                        className={`p-4 rounded-xl border-2 transition-all ${action === 'mute' ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${action === 'mute' ? 'border-primary' : 'border-slate-600'}`}>
                                {action === 'mute' && <div className="w-3 h-3 rounded-full bg-primary" />}
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm">Mute Member</div>
                                <div className="text-xs text-slate-500">Timeout the user</div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <MultiChannelSelector
                guildId={guildId}
                selectedChannels={disabledChannels}
                onChange={setDisabledChannels}
                label="DISABLED CHANNELS"
            />

            <RoleSelector
                guildId={guildId}
                selectedRoles={disabledRoles}
                onChange={setDisabledRoles}
                label="DISABLED ROLES"
            />

            <p className="text-xs text-slate-500 italic">
                Members with Administrator or Manage Server permissions are always excluded from filter rules
            </p>

            <div className="flex gap-3 pt-4">
                <button
                    onClick={onCancel}
                    className="flex-1 py-3 px-6 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onSave({ action, disabledChannels, disabledRoles })}
                    className="flex-1 py-3 px-6 btn-primary"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default AutoModSettings;
