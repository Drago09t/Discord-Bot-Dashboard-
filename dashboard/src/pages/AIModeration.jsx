import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Brain,
    Shield,
    Save,
    AlertTriangle,
    Zap,
    Activity,
    Settings,
    Eye
} from 'lucide-react';

const AIModeration = ({ guild }) => {
    const [settings, setSettings] = useState({
        enabled: false,
        sensitivity: 5,
        action_type: 'flag',
        ignored_channels: [],
        ignored_roles: []
    });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (guild?.id) {
            fetchSettings();
            fetchLogs();
        }
    }, [guild?.id]);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`/api/ai/mod-settings/${guild.id}`);
            setSettings(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch AI settings');
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await axios.get(`/api/ai/mod-logs/${guild.id}?limit=20`);
            setLogs(res.data);
        } catch (err) {
            console.error('Failed to fetch logs');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`/api/ai/mod-settings/${guild.id}`, settings);
            alert('AI Moderation settings saved successfully!');
        } catch (err) {
            alert('Failed to save settings: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading AI settings...</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Brain className="text-purple-500" size={32} />
                        AI Auto-Moderator
                    </h1>
                    <p className="text-slate-400 mt-1">Advanced context-aware content filtering powered by Google Gemini.</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-50"
                >
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 space-y-6"
                    >
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Settings className="text-purple-400" size={24} />
                            <h2 className="text-xl font-bold text-white">Configuration</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-bold text-white">Enable AI Moderation</label>
                                    <p className="text-xs text-slate-500 mt-1">Automatically analyze messages for toxicity</p>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                                    className={`w-14 h-8 rounded-full transition-all ${settings.enabled ? 'bg-purple-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${settings.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div>
                                <div className="flex justify-between mb-4">
                                    <label className="text-sm font-bold text-white">Sensitivity Level</label>
                                    <span className="text-purple-400 font-bold">{settings.sensitivity}/10</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={settings.sensitivity}
                                    onChange={(e) => setSettings({ ...settings, sensitivity: parseInt(e.target.value) })}
                                    className="w-full accent-purple-500"
                                />
                                <p className="text-xs text-slate-500 mt-2">Higher = More strict filtering</p>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-white block mb-3">Action Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['flag', 'warn', 'delete'].map(action => (
                                        <button
                                            key={action}
                                            onClick={() => setSettings({ ...settings, action_type: action })}
                                            className={`p-4 rounded-xl border-2 transition-all ${settings.action_type === action ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className="text-sm font-bold text-white capitalize">{action}</div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {action === 'flag' && 'Log only'}
                                                {action === 'warn' && 'Send warning'}
                                                {action === 'delete' && 'Remove message'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Activity Log */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 space-y-6"
                    >
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Activity className="text-pink-400" size={24} />
                            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {logs.length === 0 ? (
                                <p className="text-center py-8 text-slate-500 text-sm">No AI actions logged yet</p>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-purple-400">User: {log.user_id}</span>
                                            <span className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-300 italic">"{log.content?.substring(0, 100)}..."</p>
                                        <div className="flex gap-2 items-center">
                                            <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded font-bold">
                                                Score: {(log.ai_score * 100).toFixed(0)}%
                                            </span>
                                            <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded font-bold">
                                                {log.action_taken}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500">{log.ai_reasoning}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Info Panel */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 rounded-[2rem] p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-lg font-black text-white">How It Works</h3>
                        </div>

                        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                            <p>The AI analyzes every message for:</p>
                            <ul className="list-disc pl-5 space-y-2 text-xs">
                                <li>Toxicity & harassment</li>
                                <li>Hate speech</li>
                                <li>Profanity context</li>
                                <li>Spam patterns</li>
                            </ul>
                            <p className="text-xs text-slate-500 italic">Powered by Google Gemini 1.5 Flash</p>
                        </div>
                    </motion.div>

                    <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8">
                        <div className="flex items-center gap-3 mb-4 text-yellow-500">
                            <AlertTriangle size={20} />
                            <h4 className="font-bold">Privacy Note</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Message content is sent to Google's servers for analysis. Ensure your members are aware of this feature.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIModeration;
