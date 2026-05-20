const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
    db.run('ALTER TABLE user_profiles ADD COLUMN guild_id TEXT DEFAULT ""', (err) => {
        if(err) console.log(err.message);
    });
    db.run('ALTER TABLE user_profiles ADD COLUMN coins INTEGER DEFAULT 100', (err) => {
        if(err) console.log(err.message);
    });
    db.run('ALTER TABLE user_profiles ADD COLUMN xp INTEGER DEFAULT 0', (err) => {
        if(err) console.log(err.message);
    });
    db.run('ALTER TABLE user_profiles ADD COLUMN level INTEGER DEFAULT 1', (err) => {
        if(err) console.log(err.message);
    });
    db.run('ALTER TABLE user_profiles ADD COLUMN total_messages INTEGER DEFAULT 0', (err) => {
        if(err) console.log(err.message);
    });
    db.run('ALTER TABLE user_profiles ADD COLUMN daily_streak INTEGER DEFAULT 0', (err) => {
        if(err) console.log(err.message);
    });
    db.run('ALTER TABLE user_profiles ADD COLUMN last_daily DATETIME', (err) => {
        if(err) console.log(err.message);
    });
    db.run('ALTER TABLE user_profiles ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP', (err) => {
        if(err) console.log(err.message);
        else console.log('user_profiles updated successfully');
    });
});
