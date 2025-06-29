// server/models/asset_history.model.js
const db = require('../config/db');

class AssetHistory {
    static recordTransaction(transactionData, callback) {
        const { asset_id, transaction_type, quantity_change, source_base_id, destination_base_id, involved_user_id, notes } = transactionData;
        db.run(
            `INSERT INTO asset_history (asset_id, transaction_type, quantity_change, source_base_id, destination_base_id, involved_user_id, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [asset_id, transaction_type, quantity_change, source_base_id, destination_base_id, involved_user_id, notes],
            function(err) {
                callback(err, { history_id: this.lastID });
            }
        );
    }

    static getHistoryByAsset(assetId, callback) {
        const query = `
            SELECT ah.history_id, ah.transaction_type, ah.quantity_change, ah.transaction_date, ah.notes,
                   s_b.base_name AS source_base_name,
                   d_b.base_name AS destination_base_name,
                   u.username AS involved_username
            FROM asset_history ah
            LEFT JOIN bases s_b ON ah.source_base_id = s_b.base_id
            LEFT JOIN bases d_b ON ah.destination_base_id = d_b.base_id
            LEFT JOIN users u ON ah.involved_user_id = u.user_id
            WHERE ah.asset_id = ?
            ORDER BY ah.transaction_date DESC
        `;
        db.all(query, [assetId], callback);
    }

    static getFilteredHistory(filters, callback) {
        let query = `
            SELECT ah.history_id, ah.transaction_type, ah.quantity_change, ah.transaction_date, ah.notes,
                   a.model_name AS asset_model, a.serial_number AS asset_serial, ac.category_name AS asset_category,
                   s_b.base_name AS source_base_name,
                   d_b.base_name AS destination_base_name,
                   u.username AS involved_username
            FROM asset_history ah
            JOIN assets a ON ah.asset_id = a.asset_id
            JOIN asset_categories ac ON a.category_id = ac.category_id
            LEFT JOIN bases s_b ON ah.source_base_id = s_b.base_id
            LEFT JOIN bases d_b ON ah.destination_base_id = d_b.base_id
            LEFT JOIN users u ON ah.involved_user_id = u.user_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.assetId) {
            query += ` AND ah.asset_id = ?`;
            params.push(filters.assetId);
        }
        if (filters.transactionType) {
            query += ` AND ah.transaction_type = ?`;
            params.push(filters.transactionType);
        }
        if (filters.sourceBaseId) {
            query += ` AND ah.source_base_id = ?`;
            params.push(filters.sourceBaseId);
        }
        if (filters.destinationBaseId) {
            query += ` AND ah.destination_base_id = ?`;
            params.push(filters.destinationBaseId);
        }
        if (filters.involvedUserId) {
            query += ` AND ah.involved_user_id = ?`;
            params.push(filters.involvedUserId);
        }
        if (filters.startDate) {
            query += ` AND ah.transaction_date >= ?`;
            params.push(filters.startDate);
        }
        if (filters.endDate) {
            query += ` AND ah.transaction_date <= ?`;
            params.push(filters.endDate);
        }
        if (filters.categoryName) { // Filter by category name
            query += ` AND ac.category_name = ?`;
            params.push(filters.categoryName);
        }
        if (filters.modelName) { // Filter by asset model name
            query += ` AND a.model_name LIKE ?`;
            params.push(`%${filters.modelName}%`);
        }
        if (filters.serialNumber) { // Filter by asset serial number
            query += ` AND a.serial_number = ?`;
            params.push(filters.serialNumber);
        }


        query += ` ORDER BY ah.transaction_date DESC`;

        db.all(query, params, callback);
    }

    // Helper for Dashboard metrics - Get Net Movement for a period/base
    static getNetMovement(baseId, startDate, endDate, callback) {
        let query = `
            SELECT SUM(quantity_change) AS net_change FROM asset_history
            WHERE transaction_date BETWEEN ? AND ?
        `;
        const params = [startDate, endDate];

        if (baseId) {
            query += ` AND (source_base_id = ? OR destination_base_id = ?)`;
            params.push(baseId, baseId);
        }

        db.get(query, params, callback);
    }
}

module.exports = AssetHistory;
