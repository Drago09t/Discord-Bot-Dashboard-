const economyDB = require('./database');
const { supabase } = require('./supabaseDB');

async function debugShop() {
    const guildId = '869960506201489448';
    console.log(`\n--- [DEBUG START] ---`);
    console.log(`[1] Testing with Guild ID: ${guildId}`);

    try {
        // Test 1: Using the Database class method
        const items = await economyDB.getShopItems(guildId);
        console.log(`[2] economyDB.getShopItems('${guildId}') returned ${items.length} items`);

        // Test 2: Raw Supabase Query
        const { data: rawItems, error: rawError } = await supabase
            .from('shop_items')
            .select('*');

        if (rawError) {
            console.error(`[3] Raw Query Error:`, rawError);
        } else {
            console.log(`[3] Raw query (all guilds) returned ${rawItems?.length || 0} total items in table.`);
            rawItems?.forEach(item => {
                console.log(`   - Item: "${item.name}", GuildID in DB: "${item.guild_id}" (Type: ${typeof item.guild_id})`);
            });
        }

        // Test 3: Specific equality check
        if (rawItems && rawItems.length > 0) {
            const firstItem = rawItems[0];
            console.log(`[4] Direct comparison test for first item:`);
            const dbVal = String(firstItem.guild_id);
            const inputVal = String(guildId);
            console.log(`    DB Value: "${dbVal}" === Input Value: "${inputVal}" : ${dbVal === inputVal}`);
        }

    } catch (err) {
        console.error('[FATAL] Debug script error:', err);
    }
    console.log(`--- [DEBUG END] ---\n`);
    process.exit(0);
}

debugShop();
