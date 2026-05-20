const {
    joinVoiceChannel,
    getVoiceConnection,
    VoiceConnectionStatus,
    entersState,
    createAudioPlayer,
    NoSubscriberBehavior
} = require('@discordjs/voice');

class VoiceManager {
    constructor() {
        this.connections = new Map();
        this.reconnectAttempts = new Map();
        this.maxReconnectAttempts = 5;
        this.reconnectDelays = [5000, 10000, 20000, 40000, 60000]; // milliseconds
    }

    async joinChannel(channel, is247 = false) {
        try {
            // Check if already connected
            const existingConnection = getVoiceConnection(channel.guild.id);
            if (existingConnection) {
                console.log(`Already connected to voice in guild ${channel.guild.id}`);
                return existingConnection;
            }

            // Join the voice channel
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false,
            });

            // Create audio player (even if not playing anything, helps keep connection alive)
            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            });

            connection.subscribe(player);

            // Store connection info
            this.connections.set(channel.guild.id, {
                connection,
                channelId: channel.id,
                channelName: channel.name,
                guildId: channel.guild.id,
                is247,
                player,
                connectedAt: new Date(),
            });

            // Reset reconnect attempts on successful connection
            this.reconnectAttempts.set(channel.guild.id, 0);

            // Setup event handlers
            this.setupConnectionHandlers(connection, channel.guild.id, is247);

            console.log(`✅ Joined voice channel: ${channel.name} in ${channel.guild.name} (24/7: ${is247})`);
            return connection;

        } catch (error) {
            console.error(`Error joining voice channel:`, error);
            throw error;
        }
    }

    setupConnectionHandlers(connection, guildId, is247) {
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            console.log(`⚠️ Disconnected from voice in guild ${guildId}`);

            if (is247) {
                // Try to reconnect for 24/7 channels
                await this.handleReconnect(guildId);
            } else {
                // Remove non-24/7 connections
                this.connections.delete(guildId);
            }
        });

        connection.on(VoiceConnectionStatus.Destroyed, () => {
            console.log(`🔴 Voice connection destroyed for guild ${guildId}`);
            this.connections.delete(guildId);
            this.reconnectAttempts.delete(guildId);
        });

        connection.on('error', (error) => {
            console.error(`Voice connection error in guild ${guildId}:`, error);
        });
    }

    async handleReconnect(guildId) {
        const connectionInfo = this.connections.get(guildId);
        if (!connectionInfo || !connectionInfo.is247) {
            return;
        }

        const attempts = this.reconnectAttempts.get(guildId) || 0;

        if (attempts >= this.maxReconnectAttempts) {
            console.log(`❌ Max reconnect attempts reached for guild ${guildId}`);
            this.connections.delete(guildId);
            this.reconnectAttempts.delete(guildId);
            return;
        }

        const delay = this.reconnectDelays[attempts] || 60000;
        this.reconnectAttempts.set(guildId, attempts + 1);

        console.log(`🔄 Attempting to reconnect to guild ${guildId} (attempt ${attempts + 1}/${this.maxReconnectAttempts}) in ${delay / 1000}s`);

        setTimeout(async () => {
            try {
                const connection = getVoiceConnection(guildId);
                if (connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
                    // Try to reconnect existing connection
                    connection.rejoin();
                }
            } catch (error) {
                console.error(`Reconnect failed for guild ${guildId}:`, error);
                await this.handleReconnect(guildId); // Try again
            }
        }, delay);
    }

    leaveChannel(guildId) {
        const connectionInfo = this.connections.get(guildId);
        if (!connectionInfo) {
            return false;
        }

        try {
            connectionInfo.connection.destroy();
            this.connections.delete(guildId);
            this.reconnectAttempts.delete(guildId);
            console.log(`👋 Left voice channel in guild ${guildId}`);
            return true;
        } catch (error) {
            console.error(`Error leaving voice channel:`, error);
            return false;
        }
    }

    getConnection(guildId) {
        return this.connections.get(guildId);
    }

    getAllConnections() {
        return Array.from(this.connections.values());
    }

    isConnected(guildId) {
        const connection = getVoiceConnection(guildId);
        return connection && connection.state.status !== VoiceConnectionStatus.Destroyed;
    }
}

module.exports = new VoiceManager();
