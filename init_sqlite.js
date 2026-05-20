const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function initDB() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    const sqlFiles = [
        'supabase_schema.sql',
        'admin_system_schema.sql',
        'ai_suite_schema.sql',
        'economy_shop_schema.sql',
        // 'economy_migration.sql', // ignore migration files with plpgsql blocks
        'engagement_suite_schema.sql',
        'invite_logger_schema.sql',
        'premium_system_schema.sql',
        'social_notifications_schema.sql',
        'user_profile_schema.sql'
    ];

    for (const file of sqlFiles) {
        if (!fs.existsSync(file)) continue;
        console.log(`Processing ${file}...`);
        let sql = fs.readFileSync(file, 'utf8');

        // Regex replacements to make Postgres syntax SQLite compatible
        sql = sql.replace(/BIGSERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
        sql = sql.replace(/BIGSERIAL/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
        sql = sql.replace(/SERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
        sql = sql.replace(/SERIAL/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
        sql = sql.replace(/UUID DEFAULT gen_random_uuid\(\)/gi, 'TEXT');
        sql = sql.replace(/DEFAULT gen_random_uuid\(\)/gi, '');
        sql = sql.replace(/UUID PRIMARY KEY/gi, 'TEXT PRIMARY KEY');
        sql = sql.replace(/UUID/gi, 'TEXT');
        sql = sql.replace(/TIMESTAMPTZ/gi, 'DATETIME');
        sql = sql.replace(/TIMESTAMP WITH TIME ZONE/gi, 'DATETIME');
        sql = sql.replace(/JSONB/gi, 'TEXT');
        sql = sql.replace(/TEXT\[\]/gi, 'TEXT');
        sql = sql.replace(/BIGINT/gi, 'INTEGER');
        sql = sql.replace(/FLOAT/gi, 'REAL');
        sql = sql.replace(/BOOLEAN/gi, 'INTEGER'); // SQLite uses 0/1 for booleans
        sql = sql.replace(/DEFAULT NOW\(\)/gi, 'DEFAULT CURRENT_TIMESTAMP');
        sql = sql.replace(/::jsonb/gi, '');
        sql = sql.replace(/::TEXT/gi, '');

        // Remove array brackets from defaults
        sql = sql.replace(/DEFAULT '\{\}'/gi, "DEFAULT '[]'");

        // Strip all single-line comments
        sql = sql.replace(/--.*$/gm, '');

        // Split the file into statements
        const statements = sql.split(';');
        for (let stmt of statements) {
            stmt = stmt.trim();
            if (!stmt || stmt.startsWith('--')) continue;
            
            // Only execute CREATE TABLE and CREATE INDEX
            if (!stmt.match(/^(CREATE TABLE|CREATE INDEX|CREATE UNIQUE INDEX)/i)) {
                continue;
            }

            try {
                await db.exec(stmt);
            } catch (err) {
                console.error(`Error executing statement from ${file}:`, err.message);
                console.error(`Statement: ${stmt}`);
            }
        }
    }
    console.log('Database initialized successfully.');
    await db.close();
}

initDB().catch(console.error);
