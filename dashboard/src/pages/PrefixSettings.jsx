import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, Command, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const PrefixSettings = ({ guild }) => {
    const { showNotification } = useNotification();
    const [prefix, setPrefix] = useState('!');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (guild) fetchPrefix();
    }, [guild]);

    const fetchPrefix = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/settings/${guild.id}/prefix`);
            setPrefix(response.data.prefix || '!');
        } catch (error) {
            console.error('Failed to fetch prefix:', error);
            setError('Failed to load current prefix');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!prefix.trim()) {
            setError('Prefix cannot be empty');
            return;
        }
        if (prefix.length > 5) {
            setError('Prefix must be 5 characters or less');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await axios.post(`/api/settings/${guild.id}/prefix`, { prefix: prefix.trim() });
            showNotification('success', `Bot will now respond to: ${prefix.trim()}`, 'Prefix Updated');
        } catch (error) {
            console.error('Failed to save prefix:', error);
            showNotification('error', 'Failed to update system prefix. Please try again.', 'System Error');
        } finally {
            setSaving(false);
        }
    };

    if (!guild) return <div className="flex justify-center p-20 text-slate-500 font-bold uppercase tracking-widest">No Server Context</div>;
    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

    return (
        <div className="space-y-8 pb-20 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold text-white">Advanced Prefix System</h2>
                <p className="text-slate-400 mt-2">Configure how commands are triggered in your server.</p>
            </div>

            <div className="glass-card p-8 space-y-8 border-primary/20">
                <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">
                        <Command size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Dynamic Command Prefix</h3>
                        <p className="text-sm text-slate-400 mt-1">
                            The prefix is the symbol that precedes your commands. Choosing a unique prefix helps prevent conflicts with other bots.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block">Server Prefix</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                maxLength={5}
                                className={`glass-input flex-1 text-2xl font-mono tracking-widest ${error ? 'border-red-500/50' : 'border-primary/20 focus:border-primary'}`}
                                placeholder="e.g. !, ., /, ?"
                                value={prefix}
                                onChange={(e) => {
                                    setPrefix(e.target.value);
                                    if (error) setError(null);
                                }}
                            />
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-primary px-8 flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Update
                            </button>
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}
                        <p className="text-xs text-slate-500 mt-2">
                            Maximum 5 characters. Recommended: One special character.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="p-6 bg-white/5 rounded-2xl space-y-4">
                            <h4 className="font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="text-accent-emerald" size={18} />
                                Example 1
                            </h4>
                            <div className="font-mono text-sm bg-black/40 p-4 rounded-xl border border-white/5">
                                <span className="text-primary">{prefix}</span>help
                            </div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl space-y-4">
                            <h4 className="font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="text-accent-emerald" size={18} />
                                Example 2
                            </h4>
                            <div className="font-mono text-sm bg-black/40 p-4 rounded-xl border border-white/5">
                                <span className="text-primary">{prefix}</span>ask
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
                    <div className="flex gap-3">
                        <AlertCircle className="text-yellow-500 shrink-0" size={20} />
                        <div className="text-sm text-yellow-500/80">
                            <strong>Note:</strong> Changes are applied instantly. If you lose track of your prefix, you can always mention the bot or check this dashboard.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrefixSettings;
