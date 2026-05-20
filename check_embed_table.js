const { createClient } = require('./sqliteDB');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabase = createClient();

async function check() {
    console.log('Checking embed_templates table...');
    const { data, error } = await supabase
        .from('embed_templates')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.log('✅ Table exists! Found', data.length, 'rows');
    }
}

check();
