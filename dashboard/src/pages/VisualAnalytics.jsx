import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    Activity,
    TrendingUp,
    MessageSquare,
    Mic,
    Users,
    Calendar,
    Loader2
} from 'lucide-react';

const VisualAnalytics = ({ guild }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30);

    useEffect(() => {
        if (guild?.id) {
            fetchAnalytics();
        }
    }, [guild?.id, timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/analytics/${guild.id}?days=${timeRange}`);
            // Format data for Recharts if needed, or assume backend returns array of objects with correct keys
            // Expected keys: snapshot_date, member_count, message_count, voice_minutes
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    // Calculate totals/averages for summary cards
    const totalMessages = data.reduce((acc, curr) => acc + (curr.message_count || 0), 0);
    const totalVoice = data.reduce((acc, curr) => acc + (curr.voice_minutes || 0), 0);
    const growth = data.length > 1 ? (data[data.length - 1].member_count - data[0].member_count) : 0;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Activity className="text-blue-500" size={32} />
                        Visual Analytics Pro
                    </h1>
                    <p className="text-slate-400 mt-1">Deep insights into your community's growth and engagement.</p>
                </div>

                <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
                    {[7, 30, 90].map(days => (
                        <button
                            key={days}
                            onClick={() => setTimeRange(days)}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${timeRange === days ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {days} Days
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-l-4 border-emerald-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <Users size={24} />
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${growth >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {growth >= 0 ? '+' : ''}{growth} Members
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Members</span>
                        <span className="text-2xl font-black text-white mt-1">
                            {data.length > 0 ? data[data.length - 1].member_count.toLocaleString() : 0}
                        </span>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <MessageSquare size={24} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400">
                            Avg {(totalMessages / (data.length || 1)).toFixed(0)} / day
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Messages</span>
                        <span className="text-2xl font-black text-white mt-1">
                            {totalMessages.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-purple-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                            <Mic size={24} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400">
                            {(totalVoice / 60).toFixed(1)} Hours
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Voice Activity</span>
                        <span className="text-2xl font-black text-white mt-1">
                            {totalVoice.toLocaleString()} <span className="text-sm text-slate-500 font-medium">min</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Member Growth Chart */}
                <div className="glass-card p-6 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp size={20} className="text-emerald-500" />
                        <h3 className="font-bold text-white">Member Growth Trend</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis
                                    dataKey="snapshot_date"
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                />
                                <Area type="monotone" dataKey="member_count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMembers)" name="Members" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Message Activity */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <MessageSquare size={20} className="text-blue-500" />
                        <h3 className="font-bold text-white">Message Activity</h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis
                                    dataKey="snapshot_date"
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                                />
                                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                />
                                <Bar dataKey="message_count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Messages" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Voice Minutes */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Mic size={20} className="text-purple-500" />
                        <h3 className="font-bold text-white">Voice Engagement</h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis
                                    dataKey="snapshot_date"
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                                />
                                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                />
                                <Line type="monotone" dataKey="voice_minutes" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7' }} name="Minutes" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {data.length === 0 && !loading && (
                <div className="text-center p-10 text-slate-500 italic">
                    Not enough data points yet. Data is collected daily.
                </div>
            )}
        </div>
    );
};

export default VisualAnalytics;
