// server/models/user.model.js
const db = require('../config/db');

class User {
    static createUser(username, passwordHash, fullName, email, phone, callback) {
        db.run('INSERT INTO users (username, password_hash, full_name, email, phone) VALUES (?, ?, ?, ?, ?)',
            [username, passwordHash, fullName, email, phone],
            function(err) {
                callback(err, { user_id: this.lastID });
            }
        );
    }

    static findByUsername(username, callback) {
        db.get('SELECT user_id, username, password_hash, full_name, email, phone FROM users WHERE username = ?', [username], callback);
    }

    static findById(userId, callback) {
        db.get('SELECT user_id, username, full_name, email, phone FROM users WHERE user_id = ?', [userId], callback);
    }

    static assignRole(userId, roleId, callback) {
        db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleId], callback);
    }

    static removeRole(userId, roleId, callback) {
        db.run('DELETE FROM user_roles WHERE user_id = ? AND role_id = ?', [userId, roleId], callback);
    }

    static getUserRoles(userId, callback) {
        const query = `
            SELECT r.role_name FROM user_roles ur
            JOIN roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = ?
        `;
        db.all(query, [userId], callback);
    }

    static assignBase(userId, baseId, callback) {
        db.run('INSERT INTO base_users (user_id, base_id) VALUES (?, ?)', [userId, baseId], callback);
    }

    static removeBase(userId, baseId, callback) {
        db.run('DELETE FROM base_users WHERE user_id = ? AND base_id = ?', [userId, baseId], callback);
    }

    static getUserBases(userId, callback) {
        const query = `
            SELECT b.base_id, b.base_name FROM base_users bu
            JOIN bases b ON bu.base_id = b.base_id
            WHERE bu.user_id = ?
        `;
        db.all(query, [userId], callback);
    }

    static getAllUsers(callback) {
        const query = `
            SELECT u.user_id, u.username, u.full_name, u.email, u.phone, u.created_at
            FROM users u
        `;
        db.all(query, callback);
    }

    static updateUser(userId, updates, callback) {
        let fields = [];
        let values = [];
        for (const key in updates) {
            if (updates[key] !== undefined && key !== 'user_id' && key !== 'username' && key !== 'password_hash') {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        }
        if (fields.length === 0) {
            return callback(null, { message: "No fields to update." });
        }
        values.push(userId);
        const query = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;
        db.run(query, values, callback);
    }

    static deleteUser(userId, callback) {
        db.run('DELETE FROM users WHERE user_id = ?', [userId], callback);
    }
}

module.exports = User;
