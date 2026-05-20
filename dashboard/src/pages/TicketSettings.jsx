
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Ticket, Settings, Plus, Trash2, Save, Send,
    MessageSquare, AlertCircle, CheckCircle, Shield,
    LayoutTemplate
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const TicketSettings = ({ guild }) => {
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('general'); // general, panels
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Data
    const [settings, setSettings] = useState({
        enabled: false,
        log_channel_id: '',
        transcript_channel_id: '',
        limit_per_user: 1
    });
    const [panels, setPanels] = useState([]);
    const [textChannels, setTextChannels] = useState([]);

    // UI State
    const [showPanelModal, setShowPanelModal] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [selectedPanel, setSelectedPanel] = useState(null);
    const [newPanel, setNewPanel] = useState({
        title: '',
        description: 'Click below to open a ticket.',
        button_text: 'Create Ticket',
        button_emoji: '🎫',
        button_style: 'Primary',
        support_role_id: '',
        welcome_message: 'Support will be with you shortly!',
        naming_scheme: 'ticket-{user}'
    });
    const [sendChannelId, setSendChannelId] = useState('');

    const [roles, setRoles] = useState([]);

    useEffect(() => {
        if (guild) fetchData();
    }, [guild]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [dataRes, channelsRes, rolesRes] = await Promise.all([
                axios.get(`/api/tickets/settings/${guild.id}`),
                axios.get(`/api/channels/${guild.id}`),
                axios.get(`/api/guild/${guild.id}/roles`)
            ]);

            setSettings(dataRes.data.settings || {
                enabled: false,
                log_channel_id: '',
                transcript_channel_id: '',
                limit_per_user: 1
            });
            setPanels(dataRes.data.panels || []);
            setTextChannels(channelsRes.data || []);
            setRoles(rolesRes.data || []);
        } catch (error) {
            console.error('Failed to fetch ticket data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await axios.post(`/api/tickets/settings/${guild.id}`, settings);
            showNotification('success', 'Support protocols synchronized with the database.', 'System Online');
        } catch (error) {
            console.error('Failed to save settings:', error);
            showNotification('error', 'Critical error during support protocol sync.', 'Sync Error');
        } finally {
            setSaving(false);
        }
    };

    const handleCreatePanel = async () => {
        try {
            await axios.post(`/api/tickets/panels/${guild.id}`, newPanel);
            setShowPanelModal(false);
            setNewPanel({
                title: '',
                description: 'Click below to open a ticket.',
                button_text: 'Create Ticket',
                button_emoji: '🎫',
                button_style: 'Primary',
                support_role_id: '',
                welcome_message: 'Support will be with you shortly!',
                naming_scheme: 'ticket-{user}'
            });
            fetchData();
            showNotification('success', `Ticket panel "${newPanel.title}" created successfully.`, 'Panel Deployed');
        } catch (error) {
            console.error('Failed to create panel:', error);
            showNotification('error', 'Could not deploy ticket panel.', 'Deployment Failed');
        }
    };

    const handleDeletePanel = async (id) => {
        if (!confirm('Are you sure? This cannot be undone.')) return;
        try {
            await axios.delete(`/api/tickets/panels/${guild.id}/${id}`);
            fetchData();
            showNotification('success', 'The panel has been decommissioned.', 'Panel Removed');
        } catch (error) {
            console.error('Failed to delete panel:', error);
            showNotification('error', 'Failed to remove panel from the core.', 'Removal Error');
        }
    };

    const handleSendPanel = async () => {
        if (!selectedPanel || !sendChannelId) return;
        try {
            await axios.post(`/api/tickets/send-panel/${guild.id}`, {
                panelId: selectedPanel.id,
                channelId: sendChannelId
            });
            setShowSendModal(false);
            showNotification('success', `Panel transmitted to selected channel.`, 'Signal Sent');
        } catch (error) {
            console.error('Failed to send panel:', error);
            showNotification('error', 'Signal transmission failed. Check bot permissions.', 'Transmission Error');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading settings...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8 min-h-screen">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Ticket className="text-pink-400" /> Ticket System
                    </h1>
                    <p className="text-slate-400 mt-1">Manage support tickets, transcripts, and panels.</p>
                </div>

                <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === 'general' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Settings size={16} /> General
                    </button>
                    <button
                        onClick={() => setActiveTab('panels')}
                        className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === 'panels' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <LayoutTemplate size={16} /> Panels
                    </button>
                </div>
            </header>

            {activeTab === 'general' ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-white">Enable Ticket System</h3>
                            <p className="text-sm text-slate-400">Master switch for the entire ticket module.</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                            className={`w-14 h-7 rounded-full transition-colors relative ${settings.enabled ? 'bg-green-500' : 'bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${settings.enabled ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Transcript Channel</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                value={settings.transcript_channel_id || ''}
                                onChange={(e) => setSettings({ ...settings, transcript_channel_id: e.target.value })}
                            >
                                <option value="">Select a channel...</option>
                                {textChannels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Limit Per User</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                value={settings.limit_per_user}
                                onChange={(e) => setSettings({ ...settings, limit_per_user: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSaveSettings}
                            disabled={saving}
                            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
                        <div>
                            <h2 className="text-xl font-semibold">Ticket Panels</h2>
                            <p className="text-sm text-slate-400">Create embed panels for users to open tickets.</p>
                        </div>
                        <button
                            onClick={() => setShowPanelModal(true)}
                            className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-lg shadow-pink-500/20 flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Plus size={18} /> Create Panel
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {panels.map((panel) => (
                            <div key={panel.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 group hover:border-pink-500/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-white text-lg">{panel.title}</h3>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setSelectedPanel(panel);
                                                setShowSendModal(true);
                                            }}
                                            className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20"
                                            title="Send to Channel"
                                        >
                                            <Send size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePanel(panel.id)}
                                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{panel.description}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                    <span className="bg-slate-800 px-2 py-1 rounded-md">{panel.button_emoji} {panel.button_text}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Panel Modal */}
            {showPanelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowPanelModal(false)}>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold text-white">New Ticket Panel</h3>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                                <input
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                    value={newPanel.title}
                                    onChange={e => setNewPanel({ ...newPanel, title: e.target.value })}
                                    placeholder="e.g. Support"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                <textarea
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                    value={newPanel.description}
                                    onChange={e => setNewPanel({ ...newPanel, description: e.target.value })}
                                    placeholder="Panel body text..."
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Support Role</label>
                                <select
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                    value={newPanel.support_role_id}
                                    onChange={e => setNewPanel({ ...newPanel, support_role_id: e.target.value })}
                                >
                                    <option value="">No Role (Admin Only)</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id} style={{ color: role.color ? `#${role.color.toString(16)}` : 'white' }}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">This role will be pinged and added to the ticket channel.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Button Text</label>
                                    <input
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                        value={newPanel.button_text}
                                        onChange={e => setNewPanel({ ...newPanel, button_text: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Emoji</label>
                                    <input
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-center"
                                        value={newPanel.button_emoji}
                                        onChange={e => setNewPanel({ ...newPanel, button_emoji: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Welcome Message</label>
                                <textarea
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white"
                                    value={newPanel.welcome_message}
                                    onChange={e => setNewPanel({ ...newPanel, welcome_message: e.target.value })}
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowPanelModal(false)}
                                className="flex-1 py-3 text-slate-300 hover:bg-slate-800 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreatePanel}
                                className="flex-[2] py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-lg shadow-pink-500/20"
                            >
                                Create Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Panel Modal */}
            {showSendModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowSendModal(false)}>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white">Send "{selectedPanel?.title}"</h3>
                        <p className="text-slate-400 text-sm">Select a channel to post this ticket panel.</p>

                        <select
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={sendChannelId}
                            onChange={(e) => setSendChannelId(e.target.value)}
                        >
                            <option value="">Select Channel...</option>
                            {textChannels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                        </select>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowSendModal(false)}
                                className="flex-1 py-3 text-slate-300 hover:bg-slate-800 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendPanel}
                                disabled={!sendChannelId}
                                className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50"
                            >
                                Send Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketSettings;
