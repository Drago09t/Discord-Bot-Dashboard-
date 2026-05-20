const { Shoukaku, Connectors } = require('shoukaku');
const { Client } = require('genius-lyrics');

// Nodes configuration - Local and Premium Fallbacks
const Nodes = [
    {
        name: 'Local-Node',
        url: 'localhost:2333',
        auth: 'youshallnotpass',
        secure: false
    }
];






// Genius Client
const geniusRef = { client: null };

// Global Queue Map
const queues = new Map();

// Filter Constants
const FILTERS = {
    nightcore: {
        timescale: { speed: 1.1, pitch: 1.2, rate: 1.0 }
    },
    vaporwave: {
        timescale: { speed: 0.85, pitch: 0.8, rate: 1.0 }
    },
    bassboost: {
        equalizer: [
            { band: 0, gain: 0.6 },
            { band: 1, gain: 0.67 },
            { band: 2, gain: 0.67 },
            { band: 3, gain: 0.0 },
            { band: 4, gain: -0.5 }
        ]
    },
    pop: {
        equalizer: [
            { band: 0, gain: 0.65 },
            { band: 1, gain: 0.45 },
            { band: 2, gain: -0.45 },
            { band: 3, gain: -0.65 },
            { band: 4, gain: -0.35 },
            { band: 5, gain: 0.45 },
            { band: 6, gain: 0.55 },
            { band: 7, gain: 0.6 },
            { band: 8, gain: 0.6 },
            { band: 9, gain: 0.6 }
        ]
    },
    soft: {
        equalizer: [
            { band: 0, gain: 0 },
            { band: 1, gain: 0 },
            { band: 2, gain: 0 },
            { band: 3, gain: 0 },
            { band: 4, gain: 0 },
            { band: 5, gain: 0 },
            { band: 6, gain: 0 },
            { band: 7, gain: 0 },
            { band: 8, gain: -0.25 },
            { band: 9, gain: -0.25 },
            { band: 10, gain: -0.25 },
            { band: 11, gain: -0.25 },
            { band: 12, gain: -0.25 },
            { band: 13, gain: -0.25 }
        ]
    },
    treblebass: {
        equalizer: [
            { band: 0, gain: 0.6 },
            { band: 1, gain: 0.67 },
            { band: 2, gain: 0.67 },
            { band: 3, gain: 0 },
            { band: 4, gain: -0.5 },
            { band: 5, gain: 0.15 },
            { band: 6, gain: -0.45 },
            { band: 7, gain: 0.23 },
            { band: 8, gain: 0.35 },
            { band: 9, gain: 0.45 },
            { band: 10, gain: 0.55 },
            { band: 11, gain: 0.6 },
            { band: 12, gain: 0.55 },
            { band: 13, gain: 0.0 }
        ]
    },
    "8d": {
        rotation: { rotationHz: 0.2 }
    },
    karaoke: {
        karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 }
    }
};

module.exports = (client) => {
    // 1. Initialize Shoukaku
    const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);

    // Initialize Genius
    geniusRef.client = new Client(); // Requires GENIUS_ACCESS_TOKEN env usually, but can work without for basic search sometimes

    shoukaku.on('error', (_, error) => console.error('[Music] Shoukaku Error:', error));
    shoukaku.on('debug', (name, info) => {
        if (info.includes('PLAYER_UPDATE') || info.includes('EVENT')) {
            // Only log important gateway/player events
            console.log(`[Music Debug] ${name}: ${info.substring(0, 100)}...`);
        }
    });
    shoukaku.on('close', (name, code, reason) => console.warn(`[Music] Node ${name} closed: ${code} ${reason}`));
    shoukaku.on('disconnect', (name, moved) => {
        if (moved) return;
        console.warn(`[Music] Node ${name} disconnected`);
    });

    shoukaku.on('ready', (name) => console.log(`[Music] Pro Node ${name} is ready`));

    // Expose API for Dashboard
    client.music = {
        shoukaku,
        queues,

        // --- Actions ---
        async play(guildId, voiceChannelId, query, requesterId) {
            console.log(`[Music API] Play Request - Guild: ${guildId}, VC: ${voiceChannelId}, Query: ${query}`);
            // 1. Get a working node
            let node = shoukaku.options.nodeResolver(shoukaku.nodes);
            if (!node || node.state !== 1) { // 1 = CONNECTED
                console.warn('[Music] Primary node not ready, searching for others...');
                node = Array.from(shoukaku.nodes.values()).find(n => n.state === 1);
            }


            if (!node) throw new Error('No Lavalink nodes are currently connected. Please wait a moment.');

            // 0. Cleanup any existing 24/7 connection from voiceManager
            try {
                const voiceManager = require('../voiceManager');
                if (voiceManager.isConnected(guildId)) {
                    voiceManager.leaveChannel(guildId);
                    await new Promise(resolve => setTimeout(resolve, 800)); // Wait for gateway cleanup
                }
            } catch (e) {
                console.warn('[Music] Could not cleanup voiceManager:', e.message);
            }

            // Add search prefix if not a URL
            let searchQuery = query;
            if (!query.startsWith('http://') && !query.startsWith('https://')) {
                searchQuery = `ytsearch:${query}`;
            }

            // Search with Fallback Support
            let result;
            try {
                result = await node.rest.resolve(searchQuery);
            } catch (err) {
                console.error(`[Music] Resolve Error on ${node.name}:`, err.message);
                // Try one more node if available
                const otherNode = Array.from(shoukaku.nodes.values()).find(n => n.name !== node.name && n.state === 1);
                if (otherNode) {
                    console.log(`[Music] Retrying search on fallback node: ${otherNode.name}`);
                    node = otherNode;
                    result = await node.rest.resolve(searchQuery);
                } else {
                    throw err;
                }
            }

            console.log(`[Music] Resolve LoadType: ${result?.loadType} [Node: ${node.name}]`);

            if (!result || result.loadType === 'empty' || result.loadType === 'error') {
                throw new Error(result?.data?.message || 'No tracks found or Lavalink error');
            }

            let tracks = [];
            if (result.loadType === 'playlist') {
                tracks = result.data.tracks;
            } else if (result.loadType === 'search') {
                tracks = result.data; // Search returns array directly
            } else if (result.loadType === 'track') {
                tracks = [result.data]; // Single track
            } else {
                tracks = Array.isArray(result.data) ? result.data : [result.data];
            }

            if (tracks.length === 0) throw new Error('Processed tracks were empty');

            // Get or Join Player
            let player = shoukaku.players.get(guildId);
            if (!player) {
                console.log(`[Music] Joining VC: ${voiceChannelId} in Guild: ${guildId} via Node: ${node.name}`);
                player = await shoukaku.joinVoiceChannel({
                    guildId: guildId,
                    channelId: voiceChannelId,
                    shardId: 0,
                    deaf: false
                });

                // Event Listeners for Player
                player.on('start', () => {
                    const q = queues.get(guildId);
                    if (q) q.current = q.tracks[0];
                    console.log(`[Music] 🎵 Track started: ${q?.current?.title} [Guild: ${guildId}]`);

                    // Track position for 30s to verify progression
                    if (q) q.stuckCount = 0;
                    const interval = setInterval(() => {
                        const currentQ = queues.get(guildId);
                        if (player.track && currentQ) {
                            console.log(`[Music Progress] Guild: ${guildId} | Pos: ${player.position}ms | Volume: ${player.volume}% | Node: ${player.node.name}`);

                            // Check if stuck at 0 or not moving
                            if (player.position === 0 || (currentQ.lastPos === player.position && !player.paused)) {
                                currentQ.stuckCount = (currentQ.stuckCount || 0) + 1;
                                if (currentQ.stuckCount >= 3) {
                                    console.warn(`[Music] ⚠️ Track seems stuck (no progress). Moving to next or retrying.`);
                                    clearInterval(interval);
                                    this.skip(guildId).catch(() => { });
                                }
                            } else {
                                currentQ.stuckCount = 0;
                            }
                            currentQ.lastPos = player.position;
                        } else {
                            clearInterval(interval);
                        }
                    }, 5000);
                });

                player.on('error', (error) => {
                    console.error(`[Music] ❌ Player error [Guild: ${guildId}]:`, error);
                    // Connection issues often manifest here
                });

                player.on('stuck', () => {
                    console.warn(`[Music] ⚠️ Track stuck event [Guild: ${guildId}]`);
                    this.skip(guildId).catch(() => { });
                });

                player.on('closed', (reason) => {
                    console.warn(`[Music] 🚪 Connection closed [Guild: ${guildId}]:`, reason);
                    queues.delete(guildId);
                });

                player.on('end', (data) => {
                    const q = queues.get(guildId);
                    if (!q) return;

                    // Handle loop
                    if (q.loop === 'track') {
                        player.playTrack({ track: { encoded: q.current.original.encoded } });
                        return;
                    }

                    if (q.loop === 'queue') {
                        q.tracks.push(q.current);
                    }

                    q.tracks.shift();

                    if (q.tracks.length > 0) {
                        q.current = q.tracks[0];
                        player.playTrack({ track: { encoded: q.current.original.encoded } });
                    } else {
                        q.current = null;
                        console.log(`[Music] Queue empty for ${guildId}`);
                    }
                });
            }

            // Add to Queue
            let q = queues.get(guildId);
            if (!q) {
                q = {
                    tracks: [],
                    current: null,
                    paused: false,
                    loop: 'off',
                    volume: 100,
                    filter: 'none',
                    stuckCount: 0,
                    lastPos: -1
                };
                queues.set(guildId, q);
            }

            const addedTracks = tracks.map(t => ({
                title: t.info.title,
                author: t.info.author,
                uri: t.info.uri,
                thumbnail: t.info.artworkUrl || `https://img.youtube.com/vi/${t.info.identifier}/hqdefault.jpg`,
                duration: t.info.length,
                requesterId,
                original: t
            }));

            q.tracks.push(...addedTracks);

            if (!player.track) {
                q.current = q.tracks[0];
                await player.setGlobalVolume(100);
                await player.playTrack({ track: { encoded: q.current.original.encoded } });
            }

            return { count: addedTracks.length, first: addedTracks[0] };
        },

        async pause(guildId) {
            const player = shoukaku.players.get(guildId);
            const q = queues.get(guildId);
            if (!player || !q) throw new Error('No active player');

            q.paused = !q.paused;
            player.setPaused(q.paused);
            return q.paused;
        },

        async skip(guildId) {
            const player = shoukaku.players.get(guildId);
            const q = queues.get(guildId);
            if (!player || !q) throw new Error('No active player');

            player.stopTrack(); // Triggers 'end' event which handles next track
            return true;
        },

        async stop(guildId) {
            const player = shoukaku.players.get(guildId);
            if (player) {
                shoukaku.leaveChannel(guildId);
                queues.delete(guildId);
                return true;
            }
            return false;
        },

        async setVolume(guildId, volume) {
            const player = shoukaku.players.get(guildId);
            const q = queues.get(guildId);
            if (!player || !q) throw new Error('No active player');

            q.volume = volume;
            player.setGlobalVolume(volume);
            return volume;
        },

        async seek(guildId, positionMs) {
            const player = shoukaku.players.get(guildId);
            if (!player) throw new Error('No active player');

            await player.seekTo(positionMs);
            return true;
        },

        async setLoop(guildId, mode) {
            const q = queues.get(guildId);
            if (!q) throw new Error('No active queue');
            q.loop = mode;
            return mode;
        },

        // --- Advanced Features ---
        async setFilter(guildId, filterName) {
            const player = shoukaku.players.get(guildId);
            const q = queues.get(guildId);
            if (!player || !q) throw new Error('No active player');

            if (filterName === 'clear' || !FILTERS[filterName]) {
                player.clearFilters();
                q.filter = 'none';
            } else {
                player.setFilters(FILTERS[filterName]);
                q.filter = filterName;
            }
            return q.filter;
        },

        async getLyrics(title) {
            try {
                const searches = await geniusRef.client.songs.search(title);
                if (!searches || searches.length === 0) return null;

                const firstSong = searches[0];
                const lyrics = await firstSong.lyrics();
                return { lyrics, title: firstSong.title, artist: firstSong.artist.name, art: firstSong.image };
            } catch (err) {
                console.error('[Music] Lyrics fetch error:', err);
                return null;
            }
        },

        // --- State ---
        getState(guildId) {
            const player = shoukaku.players.get(guildId);
            const q = queues.get(guildId);

            if (!player || !q) return { active: false };

            return {
                active: true,
                current: q.current,
                position: player.position,
                paused: q.paused,
                volume: q.volume,
                loop: q.loop,
                filter: q.filter,
                filtersAvailable: Object.keys(FILTERS)
            };
        },

        getQueue(guildId) {
            const q = queues.get(guildId);
            return q ? q.tracks : [];
        }
    };

    console.log('[Music] System initialized');
};
