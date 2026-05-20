import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Zap } from 'lucide-react';
import ProfileSettings from './pages/ProfileSettings';
import PrefixSettings from './pages/PrefixSettings';
import Home from './pages/Home';
import RankingSettings from './pages/RankingSettings';
import RolesSettings from './pages/RolesSettings';
import TicketSettings from './pages/TicketSettings';
import WelcomeSettings from './pages/WelcomeSettings';
import AutoModSettings from './pages/AutoModSettings';
import LoggingSettings from './pages/LoggingSettings';
import ActivityAnalytics from './pages/ActivityAnalytics';
import Moderation from './pages/Moderation';
import AIChatSettings from './pages/AIChatSettings';
import EmbedBuilder from './pages/EmbedBuilder';
import InviteLogger from './pages/InviteLogger';
import EconomyShop from './pages/EconomyShop';
import AIModeration from './pages/AIModeration';
import VisualAnalytics from './pages/VisualAnalytics';
import VoiceXP from './pages/VoiceXP';
import GiveawayManager from './pages/GiveawayManager';
import MusicPlayer from './pages/MusicPlayer';
import SocialSettings from './pages/SocialSettings';
import AdminPremiumManager from './pages/AdminPremiumManager';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminBroadcast from './pages/AdminBroadcast';
import AdminKeyManager from './pages/AdminKeyManager';
import AdminSecurity from './pages/AdminSecurity';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminTeamManager from './pages/AdminTeamManager';
import AdminSupportDesk from './pages/AdminSupportDesk';
import DashboardLayout from './components/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import PremiumPage from './pages/PremiumPage';
import FeaturesPage from './pages/FeaturesPage';
import { NotificationProvider } from './context/NotificationContext';

// Set base URL for API (Empty to use proxy)
axios.defaults.baseURL = '';
axios.defaults.withCredentials = true;

function App() {
    const [user, setUser] = useState(null);
    const [guilds, setGuilds] = useState([]);
    const [selectedGuild, setSelectedGuild] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            console.log('Fetching user data...');
            const response = await axios.get('/api/user');
            console.log('User data received:', response.data.user?.username);
            setUser(response.data.user);
            setGuilds(response.data.guilds);
        } catch (error) {
            console.warn('Authentication Check:', error.response?.status === 401 ? 'Not logged in' : 'API Error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0a0a0c]">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <NotificationProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/premium" element={<PremiumPage />} />
                    <Route path="/features" element={<FeaturesPage />} />

                    {/* Dashboard Routes with Layout */}
                    <Route path="/dashboard" element={
                        <DashboardLayout
                            user={user}
                            guilds={guilds}
                            selectedGuild={selectedGuild}
                            onSelectGuild={(guild) => {
                                if (guild && guild.id !== selectedGuild?.id) {
                                    setSelectedGuild(guild);
                                }
                            }}
                        />
                    }>
                        <Route index element={<Home guild={selectedGuild} />} />
                        <Route path="welcome" element={<WelcomeSettings guild={selectedGuild} />} />
                        <Route path="automod" element={<AutoModSettings guild={selectedGuild} />} />
                        <Route path="logging" element={<LoggingSettings guild={selectedGuild} />} />
                        <Route path="analytics" element={<VisualAnalytics guild={selectedGuild} />} />
                        <Route path="ranking" element={<RankingSettings guild={selectedGuild} />} />
                        <Route path="roles" element={<RolesSettings guild={selectedGuild} />} />
                        <Route path="tickets" element={<TicketSettings guild={selectedGuild} />} />
                        <Route path="moderation" element={<Moderation guild={selectedGuild} />} />
                        <Route path="ai-chat" element={<AIChatSettings guild={selectedGuild} />} />
                        <Route path="embed-builder" element={<EmbedBuilder guild={selectedGuild} />} />
                        <Route path="shop" element={<EconomyShop guild={selectedGuild} />} />
                        <Route path="invite-logger" element={<InviteLogger guild={selectedGuild} />} />
                        <Route path="ai-moderation" element={<AIModeration guild={selectedGuild} />} />
                        <Route path="voice-xp" element={<VoiceXP guild={selectedGuild} />} />
                        <Route path="giveaways" element={<GiveawayManager guild={selectedGuild} />} />
                        <Route path="music" element={<MusicPlayer guild={selectedGuild} />} />
                        <Route path="social" element={<SocialSettings guild={selectedGuild} />} />
                        <Route path="prefix" element={<PrefixSettings guild={selectedGuild} />} />
                        <Route path="admin-premium" element={<AdminPremiumManager />} />
                        <Route path="admin-logs" element={<AdminAuditLogs />} />
                        <Route path="admin-broadcast" element={<AdminBroadcast />} />
                        <Route path="admin-keys" element={<AdminKeyManager />} />
                        <Route path="admin-security" element={<AdminSecurity />} />
                        <Route path="admin-analytics" element={<AdminAnalytics />} />
                        <Route path="admin-team" element={<AdminTeamManager />} />
                        <Route path="admin-tickets" element={<AdminSupportDesk />} />
                        <Route path="profile" element={<ProfileSettings />} />
                    </Route>

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </NotificationProvider>
        </ErrorBoundary>
    );
}

export default App;
