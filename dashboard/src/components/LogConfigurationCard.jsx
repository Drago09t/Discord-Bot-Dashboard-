import React from 'react';
import { ToggleLeft, ToggleRight, Palette } from 'lucide-react';

const LogConfigurationCard = ({
    label,
    eventType,
    currentConfig,
    channels,
    onUpdate
}) => {
    const isEnabled = currentConfig?.is_enabled ?? true;
    const channelId = currentConfig?.channel_id || '';
    const color = currentConfig?.embed_color || '#FF0000';

    const handleToggle = () => {
        onUpdate(eventType, { is_enabled: !isEnabled });
    };

    const handleChannelChange = (e) => {
        onUpdate(eventType, { channel_id: e.target.value });
    };

    const handleColorChange = (e) => {
        onUpdate(eventType, { embed_color: e.target.value });
    };

    return (
        <div className="glass-card p-5 flex flex-col gap-4 border border-white/5 hover:border-primary/30 transition-all group">
            <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm">{label}</span>
                <button
                    onClick={handleToggle}
                    className={`transition-colors ${isEnabled ? 'text-primary' : 'text-slate-600'}`}
                >
                    {isEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
            </div>

            <div className="space-y-3">
                <div className="space-y-1">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            Channel (Count: {channels.length})
                        </label>
                        <span className="text-[10px] text-slate-600">{channelId ? channelId : 'Not set'}</span>
                    </div>
                    <select
                        value={channelId}
                        onChange={handleChannelChange}
                        className="glass-input w-full text-xs py-2 px-3 bg-black/40 border-white/10 text-slate-300 focus:border-primary/50"
                    >
                        <option value="">Select Channel ..</option>
                        {channels.length > 0 ? (
                            channels.map(ch => (
                                <option key={ch.id} value={ch.id}>#{ch.name}</option>
                            ))
                        ) : (
                            <option value="" disabled>No channels found</option>
                        )}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Embed Color</label>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-full h-8 rounded-md border border-white/10 relative overflow-hidden"
                            style={{ backgroundColor: color }}
                        >
                            <input
                                type="color"
                                value={color}
                                onChange={handleColorChange}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            />
                        </div>
                        <div className="bg-black/40 px-2 py-1 rounded text-[10px] font-mono text-slate-400 border border-white/5">
                            {color}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogConfigurationCard;
