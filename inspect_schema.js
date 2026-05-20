const { supabase } = require('./supabaseDB');

async function inspectSchema() {
    console.log('\n--- [SCHEMA INSPECTION] ---');

    try {
        // Inspect columns of user_profiles
        const { data: cols, error: colErr } = await supabase.rpc('get_table_info', { table_name: 'user_profiles' });

        if (colErr) {
            console.log('[Info] RPC get_table_info failed, trying generic query...');
            const { data: sample, error: sampleErr } = await supabase.from('user_profiles').select('*').limit(1);
            if (sampleErr) {
                console.error('[Error] Could not even select from user_profiles:', sampleErr);
            } else {
                console.log('[Success] user_profiles exists. Sample data keys:', Object.keys(sample[0] || {}));
            }
        } else {
            console.log('[Columns] user_profiles:', cols);
        }

        // Check for existing tables
        const { data: tables, error: tableErr } = await supabase.from('pg_tables').select('tablename').eq('schemaname', 'public');
        if (tables) {
            console.log('[Tables] Found:', tables.map(t => t.tablename).join(', '));
        }

    } catch (err) {
        console.error('[Fatal] Inspection failed:', err);
    }
    console.log('--- [END] ---\n');
    process.exit(0);
}

// Note: I don't know if get_table_info RPC exists, usually it doesn't.
// I'll just try to fetch one row and see the keys.
inspectSchema();
