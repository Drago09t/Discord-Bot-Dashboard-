const { createClient } = require('./sqliteDB');
require('dotenv').config();

const supabase = createClient();

async function checkColumn() {
    const { data, error } = await supabase
        .from('guild_settings')
        .select('prefix')
        .limit(1);

    if (error) {
        console.error('❌ Error checking prefix column:', error.message);
        if (error.message.includes('column "prefix" does not exist')) {
            console.log('💡 Fix: Run the following SQL in your Supabase SQL Editor:');
            console.log('ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS prefix TEXT DEFAULT \'!\';');
        }
    } else {
        console.log('✅ Prefix column exists!');
    }
}

checkColumn();
