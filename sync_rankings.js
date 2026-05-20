const fs = require('fs').promises;
const path = require('path');
const supabaseDB = require('./supabaseDB');

async function syncRankings() {
    console.log('🚀 Starting ranking data sync...');
    const DB_FILE = path.join(__dirname, 'ranking_data.json');

    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        const rankings = JSON.parse(data);
        const entries = Object.values(rankings);

        console.log(`📊 Found ${entries.length} users in local database.`);

        for (const user of entries) {
            console.log(`Syncing ${user.username}...`);
            await supabaseDB.updateUserRanking(user.guildId, user.userId, {
                username: user.username,
                xp: user.xp,
                level: user.level,
                total_messages: user.totalMessages,
                last_xp_time: user.lastXPTime
            });
        }

        console.log('✅ Sync completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

syncRankings();
