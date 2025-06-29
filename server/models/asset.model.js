// server/models/asset.model.js
const db = require('../config/db');

class Asset {
    // --- Asset Category Operations ---
    static createCategory(categoryName, callback) {
        db.run('INSERT INTO asset_categories (category_name) VALUES (?)', [categoryName], function(err) {
            callback(err, { category_id: this.lastID });
        });
    }

    static getAllCategories(callback) {
        db.all('SELECT category_id, category_name FROM asset_categories', callback);
    }

    static findCategoryByName(categoryName, callback) {
        db.get('SELECT category_id, category_name FROM asset_categories WHERE category_name = ?', [categoryName], callback);
    }

    // --- Asset Operations ---
    static createAsset(assetData, callback) {
        const { category_id, model_name, serial_number, quantity, unit_of_measure, current_base_id, acquisition_date, unit_cost, status, notes } = assetData;
        db.run(
            `INSERT INTO assets (category_id, model_name, serial_number, quantity, unit_of_measure, current_base_id, acquisition_date, unit_cost, status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [category_id, model_name, serial_number, quantity, unit_of_measure, current_base_id, acquisition_date, unit_cost, status, notes],
            function(err) {
                callback(err, { asset_id: this.lastID });
            }
        );
    }

    static getAllAssets(callback) {
        const query = `
            SELECT a.asset_id, a.model_name, a.serial_number, a.quantity, a.unit_of_measure, a.acquisition_date, a.unit_cost, a.status, a.notes, a.created_at,
                   ac.category_name, b.base_name AS current_base_name
            FROM assets a
            JOIN asset_categories ac ON a.category_id = ac.category_id
            LEFT JOIN bases b ON a.current_base_id = b.base_id
        `;
        db.all(query, callback);
    }

    static getAssetById(assetId, callback) {
        const query = `
            SELECT a.asset_id, a.category_id, a.model_name, a.serial_number, a.quantity, a.unit_of_measure, a.acquisition_date, a.unit_cost, a.status, a.notes, a.created_at,
                   ac.category_name, b.base_name AS current_base_name, a.current_base_id
            FROM assets a
            JOIN asset_categories ac ON a.category_id = ac.category_id
            LEFT JOIN bases b ON a.current_base_id = b.base_id
            WHERE a.asset_id = ?
        `;
        db.get(query, [assetId], callback);
    }

    static updateAsset(assetId, updates, callback) {
        let fields = [];
        let values = [];
        for (const key in updates) {
            if (updates[key] !== undefined && key !== 'asset_id' && key !== 'created_at') {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        }
        if (fields.length === 0) {
            return callback(null, { message: "No fields to update." });
        }
        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(assetId); // Add assetId for the WHERE clause
        const query = `UPDATE assets SET ${fields.join(', ')} WHERE asset_id = ?`;
        db.run(query, values, callback);
    }

    static deleteAsset(assetId, callback) {
        db.run('DELETE FROM assets WHERE asset_id = ?', [assetId], callback);
    }

    static updateAssetQuantity(assetId, quantityChange, callback) {
        db.run('UPDATE assets SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE asset_id = ?',
            [quantityChange, assetId],
            callback
        );
    }

    static updateAssetLocation(assetId, newBaseId, callback) {
        db.run('UPDATE assets SET current_base_id = ?, updated_at = CURRENT_TIMESTAMP WHERE asset_id = ?',
            [newBaseId, assetId],
            callback
        );
    }
}

module.exports = Asset;
