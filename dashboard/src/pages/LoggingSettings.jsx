import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, AlertTriangle } from 'lucide-react';
import LogConfigurationCard from '../components/LogConfigurationCard';
import { useNotification } from '../context/NotificationContext';

const EVENT_CATEGORIES = [
    {
        title: "🛡️ Moderation Events",
        events: [
            { id: 'member_ban', label: 'Member Banned' },
            { id: 'member_unban', label: 'Member Unbanned' },
            { id: 'member_kick', label: 'Member Kicked' },
            { id: 'member_timeout', label: 'Timeout Given/Removed' }, // Placeholder for future expansion
            { id: 'mod_command', label: 'Moderation Command Used' } // Placeholder
        ]
    },
    {
        title: "💬 Message Events",
        events: [
            { id: 'message_delete', label: 'Message Deleted' },
            { id: 'message_update', label: 'Message Edited' }
        ]
    },
    {
        title: "📁 Channel Events",
        events: [
            { id: 'channel_create', label: 'Channel Created' },
            { id: 'channel_delete', label: 'Channel Deleted' },
            { id: 'channel_update', label: 'Channel Updated' },
            { id: 'channel_perms', label: 'Channel Permissions Updated' } // Placeholder
        ]
    },
    {
        title: "🎭 Role Events",
        events: [
            { id: 'role_create', label: 'Role Created' },
            { id: 'role_delete', label: 'Role Deleted' },
            { id: 'role_update', label: 'Role Updated' },
            { id: 'role_give', label: 'Role Given' },
            { id: 'role_remove', label: 'Role Removed' }
        ]
    },
    {
        title: "👥 Member Events",
        events: [
            { id: 'member_join', label: 'Member Joined' },
            { id: 'member_leave', label: 'Member Left' },
            { id: 'member_nickname', label: 'Nickname Changed' }
        ]
    },
    {
        title: "🔊 Voice Events",
        events: [
            { id: 'voice_join', label: 'Member Joined Voice' },
            { id: 'voice_leave', label: 'Member Left Voice' },
            { id: 'voice_move', label: 'Member Switched Voice' },
            { id: 'voice_state', label: 'Voice State (Mute/Deafen)' }
        ]
    },
    {
        title: "🏠 Server Events",
        events: [
            { id: 'update_server', label: 'Update Server' },
            { id: 'servers_invites', label: 'Invite Created' }
        ]
    }
];

const LoggingSettings = ({ guild }) => {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [logSettings, setLogSettings] = useState([]);
    const [channels, setChannels] = useState([]);

    useEffect(() => {
        if (guild) fetchData();
    }, [guild]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [logsRes, channelsRes] = await Promise.all([
                axios.get(`/api/settings/${guild.id}/logs`),
                axios.get(`/api/channels/${guild.id}`)
            ]);
            setLogSettings(logsRes.data.logs || []);
            setLogSettings(logsRes.data.logs || []);
            const fetchedChannels = channelsRes.data || [];
            console.log('[Frontend] Channels Fetched:', fetchedChannels.length);
            // DEBUG: Inject dummy channel to prove rendering works
            setChannels([{ id: 'debug-1', name: 'DEBUG CHANNEL' }, ...fetchedChannels]);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (eventType, updates) => {
        // Optimistic update
        setLogSettings(prev => {
            const existingIndex = prev.findIndex(s => s.event_type === eventType);
            if (existingIndex >= 0) {
                const newSettings = [...prev];
                newSettings[existingIndex] = { ...newSettings[existingIndex], ...updates };
                return newSettings;
            } else {
                return [...prev, { event_type: eventType, guild_id: guild.id, ...updates }];
            }
        });

        try {
            await axios.post(`/api/settings/${guild.id}/logs/update`, {
                eventType,
                updates
            });
            showNotification('success', `Logging protocol for ${eventType} updated.`, 'Monitor Updated');
        } catch (error) {
            console.error('Failed to save setting:', error);
            showNotification('error', `Failed to update monitor for ${eventType}.`, 'Sync Error');
            // Revert would go here in a production app
        }
    };

    const getConfig = (eventType) => logSettings.find(s => s.event_type === eventType) || {};

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

    return (
        <div className="space-y-12 pb-20">
            <div>
                <h2 className="text-3xl">Advanced Observer Protocol</h2>
                <p className="text-slate-400 mt-2">Configure granular logging for every event type. Designate specific audit channels and colors.</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={20} />
                <div>
                    <h4 className="text-amber-500 font-bold text-sm">Database Upgrade Required</h4>
                    <p className="text-slate-400 text-xs mt-1">
                        If these settings don't save or load, please ensuring you have run the <code>migration_logging_advanced.sql</code> script in your local Supabase SQL editor.
                    </p>
                </div>
            </div>

            {channels.length === 0 && !loading && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-red-500 shrink-0" size={20} />
                        <div>
                            <h4 className="text-red-500 font-bold text-sm">No Channels Found</h4>
                            <p className="text-slate-400 text-xs mt-1">
                                The bot couldn't find any channels. Is the bot in this server?
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded transition-colors"
                    >
                        Retry Fetch
                    </button>
                </div>
            )}

            <div className="space-y-12">
                {EVENT_CATEGORIES.map((category) => (
                    <div key={category.title} className="space-y-6">
                        <h3 className="text-xl font-bold text-white border-l-4 border-primary pl-3">{category.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {category.events.map(event => (
                                <LogConfigurationCard
                                    key={event.id}
                                    label={event.label}
                                    eventType={event.id}
                                    currentConfig={getConfig(event.id)}
                                    channels={channels}
                                    onUpdate={handleUpdate}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LoggingSettings;
