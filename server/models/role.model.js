// server/models/role.model.js
const db = require('../config/db');

class Role {
    static createRole(roleName, callback) {
        db.run('INSERT INTO roles (role_name) VALUES (?)', [roleName], function(err) {
            callback(err, { role_id: this.lastID });
        });
    }

    static findByName(roleName, callback) {
        db.get('SELECT role_id, role_name FROM roles WHERE role_name = ?', [roleName], callback);
    }

    static findById(roleId, callback) {
        db.get('SELECT role_id, role_name FROM roles WHERE role_id = ?', [roleId], callback);
    }

    static getAllRoles(callback) {
        db.all('SELECT role_id, role_name FROM roles', callback);
    }
}

module.exports = Role;
