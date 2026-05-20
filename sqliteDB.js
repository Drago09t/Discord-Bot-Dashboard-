const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let dbPromise = null;

function getDb() {
    if (!dbPromise) {
        dbPromise = open({
            filename: path.join(__dirname, 'database.sqlite'),
            driver: sqlite3.Database
        });
    }
    return dbPromise;
}

class QueryBuilder {
    constructor(table) {
        this.table = table;
        this.action = 'select'; // select, insert, update, upsert, delete
        this.selectCols = '*';
        this.wheres = [];
        this.params = [];
        this.orderCol = null;
        this.orderAsc = true;
        this.limitCount = null;
        this.payload = null;
        this.upsertConflictCols = null;
    }

    select(cols = '*') {
        if (this.action === 'select' || !this.action) {
            this.action = 'select';
        }
        this.selectCols = cols;
        return this;
    }

    insert(data) {
        this.action = 'insert';
        this.payload = Array.isArray(data) ? data : [data];
        return this;
    }

    update(data) {
        this.action = 'update';
        this.payload = data;
        return this;
    }

    upsert(data, options) {
        this.action = 'upsert';
        this.payload = Array.isArray(data) ? data : [data];
        if (options && options.onConflict) {
            this.upsertConflictCols = options.onConflict.split(',').map(s => s.trim());
        }
        return this;
    }

    delete() {
        this.action = 'delete';
        return this;
    }

    eq(col, val) {
        this.wheres.push(`${col} = ?`);
        this.params.push(val);
        return this;
    }

    gte(col, val) {
        this.wheres.push(`${col} >= ?`);
        this.params.push(val);
        return this;
    }

    lte(col, val) {
        this.wheres.push(`${col} <= ?`);
        this.params.push(val);
        return this;
    }

    is(col, val) {
        if (val === null) {
            this.wheres.push(`${col} IS NULL`);
        } else {
            this.wheres.push(`${col} IS ?`);
            this.params.push(val);
        }
        return this;
    }

    match(obj) {
        for (const [k, v] of Object.entries(obj)) {
            this.eq(k, v);
        }
        return this;
    }

    order(col, options = { ascending: true }) {
        this.orderCol = col;
        this.orderAsc = options.ascending;
        return this;
    }

    limit(n) {
        this.limitCount = n;
        return this;
    }

    async execute() {
        const db = await getDb();
        try {
            if (this.action === 'select') {
                // Special handling for the single join in the codebase
                if (this.table === 'user_inventory' && this.selectCols.includes('item:shop_items(*)')) {
                    const whereClause = this.wheres.length ? `WHERE ${this.wheres.join(' AND ')}` : '';
                    let sql = `
                        SELECT ui.*, json_object(
                            'id', si.id,
                            'guild_id', si.guild_id,
                            'name', si.name,
                            'description', si.description,
                            'price', si.price,
                            'stock', si.stock,
                            'role_id', si.role_id,
                            'type', si.type
                        ) as item
                        FROM user_inventory ui
                        LEFT JOIN shop_items si ON ui.item_id = si.id
                        ${whereClause}
                    `;
                    if (this.orderCol) sql += ` ORDER BY ui.${this.orderCol} ${this.orderAsc ? 'ASC' : 'DESC'}`;
                    if (this.limitCount) sql += ` LIMIT ${this.limitCount}`;
                    
                    const rows = await db.all(sql, this.params);
                    // parse JSON object back
                    rows.forEach(r => {
                        if (r.item) r.item = JSON.parse(r.item);
                    });
                    return { data: rows, error: null };
                }

                const whereClause = this.wheres.length ? `WHERE ${this.wheres.join(' AND ')}` : '';
                let sql = `SELECT ${this.selectCols === '*' ? '*' : this.selectCols} FROM ${this.table} ${whereClause}`;
                if (this.orderCol) sql += ` ORDER BY ${this.orderCol} ${this.orderAsc ? 'ASC' : 'DESC'}`;
                if (this.limitCount) sql += ` LIMIT ${this.limitCount}`;

                const rows = await db.all(sql, this.params);
                return { data: rows, error: null };
            } 
            else if (this.action === 'insert') {
                const results = [];
                for (const row of this.payload) {
                    const keys = Object.keys(row);
                    const values = Object.values(row);
                    const placeholders = keys.map(() => '?').join(',');
                    const sql = `INSERT INTO ${this.table} (${keys.join(',')}) VALUES (${placeholders}) RETURNING *`;
                    const result = await db.get(sql, values);
                    results.push(result);
                }
                return { data: results, error: null };
            }
            else if (this.action === 'update') {
                const keys = Object.keys(this.payload);
                const values = Object.values(this.payload);
                const setClause = keys.map(k => `${k} = ?`).join(', ');
                const whereClause = this.wheres.length ? `WHERE ${this.wheres.join(' AND ')}` : '';
                const sql = `UPDATE ${this.table} SET ${setClause} ${whereClause} RETURNING *`;
                
                const rows = await db.all(sql, [...values, ...this.params]);
                return { data: rows, error: null };
            }
            else if (this.action === 'upsert') {
                const results = [];
                for (const row of this.payload) {
                    const keys = Object.keys(row);
                    const values = Object.values(row);
                    const placeholders = keys.map(() => '?').join(',');
                    const setClause = keys.map(k => `${k} = EXCLUDED.${k}`).join(', ');
                    
                    // Fallback if upsertConflictCols is not provided: try to use standard primary keys. 
                    // In Supabase, if onConflict is missing, it assumes the primary key.
                    // For SQLite, ON CONFLICT requires specific columns if we don't just want ON CONFLICT DO UPDATE.
                    // Wait, SQLite ON CONFLICT DO UPDATE requires specifying the conflict target or we can use REPLACE.
                    // Let's use INSERT OR REPLACE INTO which is simpler and covers most cases.
                    
                    const sql = `INSERT OR REPLACE INTO ${this.table} (${keys.join(',')}) VALUES (${placeholders}) RETURNING *`;
                    const result = await db.get(sql, values);
                    results.push(result);
                }
                return { data: results, error: null };
            }
            else if (this.action === 'delete') {
                const whereClause = this.wheres.length ? `WHERE ${this.wheres.join(' AND ')}` : '';
                const sql = `DELETE FROM ${this.table} ${whereClause} RETURNING *`;
                const rows = await db.all(sql, this.params);
                return { data: rows, error: null };
            }
        } catch (error) {
            console.error(`MockSupabase DB Error [${this.action} on ${this.table}]:`, error.message);
            // Some operations might not support RETURNING (like older sqlite), fallback if needed, but sqlite3 does support it since 3.35
            return { data: null, error };
        }
    }

    async single() {
        const { data, error } = await this.execute();
        if (error) return { data: null, error };
        if (!data || data.length === 0) return { data: null, error: { message: 'Row not found', code: 'PGRST116' } };
        return { data: data[0], error: null };
    }

    async maybeSingle() {
        const { data, error } = await this.execute();
        if (error) return { data: null, error };
        if (!data || data.length === 0) return { data: null, error: null };
        return { data: data[0], error: null };
    }

    then(resolve, reject) {
        return this.execute().then(resolve, reject);
    }
}

const supabase = {
    from: (table) => new QueryBuilder(table)
};

// Instead of exporting a complex createClient, we just export supabase instance directly
// and a dummy createClient function to prevent existing imports from crashing.
module.exports = {
    supabase,
    createClient: () => supabase
};
