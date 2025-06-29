// server/models/base.model.js
const db = require('../config/db');

class Base {
    static createBase(baseName, location, commanderId, callback) {
        db.run('INSERT INTO bases (base_name, location, commander_id) VALUES (?, ?, ?)',
            [baseName, location, commanderId],
            function(err) {
                callback(err, { base_id: this.lastID });
            }
        );
    }

    static getAllBases(callback) {
        db.all('SELECT base_id, base_name, location, commander_id FROM bases', callback);
    }

    static findById(baseId, callback) {
        db.get('SELECT base_id, base_name, location, commander_id FROM bases WHERE base_id = ?', [baseId], callback);
    }

    static updateBase(baseId, updates, callback) {
        let fields = [];
        let values = [];
        for (const key in updates) {
            if (updates[key] !== undefined && key !== 'base_id') {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        }
        if (fields.length === 0) {
            return callback(null, { message: "No fields to update." });
        }
        values.push(baseId);
        const query = `UPDATE bases SET ${fields.join(', ')} WHERE base_id = ?`;
        db.run(query, values, callback);
    }

    static deleteBase(baseId, callback) {
        db.run('DELETE FROM bases WHERE base_id = ?', [baseId], callback);
    }
}

module.exports = Base;
