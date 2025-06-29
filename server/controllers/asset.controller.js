// server/controllers/asset.controller.js
const Asset = require('../models/asset.model');
const AssetHistory = require('../models/asset_history.model');

// --- Asset Category Controllers ---

exports.createAssetCategory = (req, res) => {
    const { category_name } = req.body;
    if (!category_name) {
        return res.status(400).json({ message: 'Category name is required' });
    }
    Asset.createCategory(category_name, (err, newCategory) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ message: 'Category name already exists' });
            }
            console.error("Error creating category:", err.message);
            return res.status(500).json({ message: 'Error creating category' });
        }
        res.status(201).json({ message: 'Asset category created successfully', category_id: newCategory.category_id, category_name });
    });
};

exports.getAllAssetCategories = (req, res) => {
    Asset.getAllCategories((err, categories) => {
        if (err) {
            console.error("Error fetching categories:", err.message);
            return res.status(500).json({ message: 'Server error fetching categories' });
        }
        res.status(200).json(categories);
    });
};

// --- Asset Controllers ---

exports.createAsset = (req, res) => {
    const assetData = req.body; // category_id, model_name, serial_number, quantity, unit_of_measure, current_base_id, acquisition_date, unit_cost, status, notes
    const { category_id, model_name, quantity, unit_of_measure, current_base_id, acquisition_date } = assetData;

    if (!category_id || !model_name || !quantity || !unit_of_measure || !current_base_id || !acquisition_date) {
        return res.status(400).json({ message: 'Required asset fields missing.' });
    }

    Asset.createAsset(assetData, (err, newAsset) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed') && assetData.serial_number) {
                return res.status(409).json({ message: `Asset with serial number '${assetData.serial_number}' already exists.` });
            }
            console.error("Error creating asset:", err.message);
            return res.status(500).json({ message: 'Error creating asset' });
        }

        // Record as a 'Purchase' transaction in history
        const transactionData = {
            asset_id: newAsset.asset_id,
            transaction_type: 'Purchase',
            quantity_change: quantity,
            destination_base_id: current_base_id,
            involved_user_id: req.user.id, // User who is recording the purchase
            notes: `Initial purchase record. ${assetData.notes || ''}`.trim()
        };
        AssetHistory.recordTransaction(transactionData, (histErr) => {
            if (histErr) {
                console.error("Warning: Failed to record purchase history for new asset:", histErr.message);
                // Continue with success, but log the warning
            }
            res.status(201).json({ message: 'Asset created and purchase recorded successfully', asset_id: newAsset.asset_id });
        });
    });
};

exports.getAllAssets = (req, res) => {
    Asset.getAllAssets((err, assets) => {
        if (err) {
            console.error("Error fetching assets:", err.message);
            return res.status(500).json({ message: 'Server error fetching assets' });
        }
        res.status(200).json(assets);
    });
};

exports.getAssetById = (req, res) => {
    const assetId = req.params.id;
    Asset.getAssetById(assetId, (err, asset) => {
        if (err) {
            console.error("Error fetching asset:", err.message);
            return res.status(500).json({ message: 'Server error' });
        }
        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.status(200).json(asset);
    });
};

exports.updateAsset = (req, res) => {
    const assetId = req.params.id;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No update data provided' });
    }

    Asset.updateAsset(assetId, updates, (err) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed') && updates.serial_number) {
                return res.status(409).json({ message: `Asset with serial number '${updates.serial_number}' already exists.` });
            }
            console.error("Error updating asset:", err.message);
            return res.status(500).json({ message: 'Error updating asset' });
        }
        res.status(200).json({ message: 'Asset updated successfully' });
    });
};

exports.deleteAsset = (req, res) => {
    const assetId = req.params.id;
    Asset.deleteAsset(assetId, (err) => {
        if (err) {
            console.error("Error deleting asset:", err.message);
            return res.status(500).json({ message: 'Error deleting asset' });
        }
        res.status(200).json({ message: 'Asset deleted successfully' });
    });
};

// --- Asset Transaction Controllers ---

exports.recordTransfer = (req, res) => {
    const { asset_id, quantity, source_base_id, destination_base_id, notes } = req.body;
    const involved_user_id = req.user.id; // User initiating the transfer

    if (!asset_id || !quantity || !source_base_id || !destination_base_id) {
        return res.status(400).json({ message: 'Required transfer fields missing.' });
    }
    if (source_base_id === destination_base_id) {
        return res.status(400).json({ message: 'Source and destination bases cannot be the same for a transfer.' });
    }

    Asset.getAssetById(asset_id, (err, asset) => {
        if (err) return res.status(500).json({ message: 'Server error fetching asset' });
        if (!asset) return res.status(404).json({ message: 'Asset not found' });
        if (asset.quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient quantity at source base for transfer.' });
        }
        if (asset.current_base_id !== source_base_id) {
            return res.status(400).json({ message: 'Asset is not currently at the specified source base.' });
        }

        // Decrement quantity at source
        Asset.updateAssetQuantity(asset_id, -quantity, (err) => {
            if (err) {
                console.error("Error updating asset quantity for transfer (source):", err.message);
                return res.status(500).json({ message: 'Error updating asset quantity for transfer.' });
            }

            // If the asset is fungible (no serial_number), create a new asset entry at destination,
            // otherwise, just update the location of the existing asset if quantity is transferred fully.
            if (!asset.serial_number || quantity < asset.quantity) {
                // If it's fungible OR a partial transfer of a non-fungible item (e.g. 5 out of 10)
                // In a real system, partial transfers of specific serialized items are complex.
                // For simplicity, we assume if it has a serial, it's transferred fully.
                // If no serial, or we're creating a 'new batch' at destination for simplicity.
                const newAssetData = {
                    category_id: asset.category_id,
                    model_name: asset.model_name,
                    serial_number: null, // New batch, no serial or partial transfer
                    quantity: quantity,
                    unit_of_measure: asset.unit_of_measure,
                    current_base_id: destination_base_id,
                    acquisition_date: new Date().toISOString().split('T')[0], // Use current date
                    unit_cost: asset.unit_cost,
                    status: 'Operational',
                    notes: `Transferred from Base ID ${source_base_id}. ${notes || ''}`.trim()
                };
                Asset.createAsset(newAssetData, (createErr, newTransferredAsset) => {
                    if (createErr) {
                        console.error("Error creating new asset for transfer destination:", createErr.message);
                        return res.status(500).json({ message: 'Error creating new asset for transfer destination. Source quantity reverted.' });
                    }
                    const sourceTx = { asset_id, transaction_type: 'Transfer_Out', quantity_change: -quantity, source_base_id, destination_base_id: null, involved_user_id, notes: `Transfer out. ${notes || ''}`.trim() };
                    const destTx = { asset_id: newTransferredAsset.asset_id, transaction_type: 'Transfer_In', quantity_change: quantity, source_base_id: null, destination_base_id, involved_user_id, notes: `Transfer in. ${notes || ''}`.trim() };

                    Promise.all([
                        new Promise(resolve => AssetHistory.recordTransaction(sourceTx, resolve)),
                        new Promise(resolve => AssetHistory.recordTransaction(destTx, resolve))
                    ])
                    .then(() => res.status(200).json({ message: 'Asset transferred successfully and history recorded.' }))
                    .catch(e => {
                        console.error("Error recording transfer history:", e.message);
                        res.status(500).json({ message: 'Asset transferred, but failed to record history.' });
                    });
                });
            } else {
                // Fully transfer the specific serialized asset to the new base
                Asset.updateAssetLocation(asset_id, destination_base_id, (err) => {
                    if (err) {
                        console.error("Error updating asset location for transfer:", err.message);
                        return res.status(500).json({ message: 'Error updating asset location for transfer.' });
                    }
                    const transactionData = {
                        asset_id,
                        transaction_type: 'Transfer', // Combined 'Transfer_Out' and 'Transfer_In' for simplicity here
                        quantity_change: 0, // No quantity change for the same asset_id, only location
                        source_base_id,
                        destination_base_id,
                        involved_user_id,
                        notes: `Asset fully transferred. ${notes || ''}`.trim()
                    };
                    AssetHistory.recordTransaction(transactionData, (histErr) => {
                        if (histErr) {
                            console.error("Warning: Failed to record transfer history for asset:", histErr.message);
                        }
                        res.status(200).json({ message: 'Asset transferred successfully and history recorded.' });
                    });
                });
            }
        });
    });
};


exports.recordAssignment = (req, res) => {
    const { asset_id, quantity, assigned_to_user_id, base_of_assignment_id, purpose, expected_return_date, notes } = req.body;
    const involved_user_id = req.user.id; // User who is doing the assignment

    if (!asset_id || !quantity || !assigned_to_user_id || !base_of_assignment_id || !purpose) {
        return res.status(400).json({ message: 'Required assignment fields missing.' });
    }

    Asset.getAssetById(asset_id, (err, asset) => {
        if (err) return res.status(500).json({ message: 'Server error fetching asset' });
        if (!asset) return res.status(404).json({ message: 'Asset not found' });
        if (asset.quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient quantity of asset for assignment.' });
        }
        if (asset.current_base_id !== base_of_assignment_id) {
            return res.status(400).json({ message: 'Asset is not currently at the specified base of assignment.' });
        }

        // Reduce quantity at current base (as it's assigned out)
        Asset.updateAssetQuantity(asset_id, -quantity, (err) => {
            if (err) {
                console.error("Error updating asset quantity for assignment:", err.message);
                return res.status(500).json({ message: 'Error updating asset quantity for assignment.' });
            }

            const transactionData = {
                asset_id,
                transaction_type: 'Assignment',
                quantity_change: -quantity, // Negative as it's assigned OUT of inventory
                source_base_id: base_of_assignment_id, // Assigned FROM this base's inventory
                destination_base_id: null, // No destination base in this sense, but assigned to a user
                involved_user_id: assigned_to_user_id, // The user to whom it is assigned
                notes: `Assigned to user ID ${assigned_to_user_id} for purpose: ${purpose}. Expected return: ${expected_return_date || 'N/A'}. ${notes || ''}`.trim()
            };

            AssetHistory.recordTransaction(transactionData, (histErr) => {
                if (histErr) {
                    console.error("Warning: Failed to record assignment history:", histErr.message);
                }
                res.status(200).json({ message: 'Asset assigned successfully and history recorded.' });
            });
        });
    });
};


exports.recordExpenditure = (req, res) => {
    const { asset_id, quantity, base_where_expended_id, reason, reporting_user_id, notes } = req.body;
    const involved_user_id = req.user.id; // User who is recording the expenditure

    if (!asset_id || !quantity || !base_where_expended_id || !reason) {
        return res.status(400).json({ message: 'Required expenditure fields missing.' });
    }

    Asset.getAssetById(asset_id, (err, asset) => {
        if (err) return res.status(500).json({ message: 'Server error fetching asset' });
        if (!asset) return res.status(404).json({ message: 'Asset not found' });
        if (asset.quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient quantity of asset for expenditure.' });
        }
        if (asset.current_base_id !== base_where_expended_id) {
             return res.status(400).json({ message: 'Asset is not currently at the specified base of expenditure.' });
        }


        // Reduce quantity in inventory
        Asset.updateAssetQuantity(asset_id, -quantity, (err) => {
            if (err) {
                console.error("Error updating asset quantity for expenditure:", err.message);
                return res.status(500).json({ message: 'Error updating asset quantity for expenditure.' });
            }

            // If quantity becomes 0 and it's a serialized item, update status to 'Expended' or 'Disposed'
            if (asset.serial_number && (asset.quantity - quantity) === 0) {
                 Asset.updateAsset(asset_id, { status: 'Expended' }, (updateErr) => {
                    if (updateErr) console.error("Warning: Could not update asset status to Expended:", updateErr.message);
                 });
            }

            const transactionData = {
                asset_id,
                transaction_type: 'Expenditure',
                quantity_change: -quantity, // Negative as it's removed from inventory
                source_base_id: base_where_expended_id,
                destination_base_id: null,
                involved_user_id: reporting_user_id || involved_user_id, // Who reported it vs who recorded it
                notes: `Reason: ${reason}. ${notes || ''}`.trim()
            };

            AssetHistory.recordTransaction(transactionData, (histErr) => {
                if (histErr) {
                    console.error("Warning: Failed to record expenditure history:", histErr.message);
                }
                res.status(200).json({ message: 'Asset expenditure recorded successfully.' });
            });
        });
    });
};


exports.getAssetHistory = (req, res) => {
    const filters = req.query; // assetId, transactionType, sourceBaseId, etc.
    AssetHistory.getFilteredHistory(filters, (err, history) => {
        if (err) {
            console.error("Error fetching asset history:", err.message);
            return res.status(500).json({ message: 'Server error fetching asset history' });
        }
        res.status(200).json(history);
    });
};

// --- Dashboard Metrics (Examples) ---
exports.getDashboardMetrics = (req, res) => {
    const { baseId, startDate, endDate } = req.query; // Filters for metrics

    // Example: Current Date if not provided
    const now = new Date();
    const sDate = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
    const eDate = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month

    const promises = [];

    // Total Assets (Current Inventory)
    promises.push(new Promise((resolve, reject) => {
        let query = `SELECT SUM(quantity) AS total_assets FROM assets`;
        const params = [];
        if (baseId) {
            query += ` WHERE current_base_id = ?`;
            params.push(baseId);
        }
        db.get(query, params, (err, row) => {
            if (err) return reject(err);
            resolve({ total_assets: row ? row.total_assets || 0 : 0 });
        });
    }));

    // Total Purchased (within date range)
    promises.push(new Promise((resolve, reject) => {
        let query = `
            SELECT SUM(quantity_change) AS total_purchased FROM asset_history
            WHERE transaction_type = 'Purchase' AND transaction_date BETWEEN ? AND ?
        `;
        const params = [sDate.toISOString().split('T')[0], eDate.toISOString().split('T')[0]];
        if (baseId) {
            query += ` AND destination_base_id = ?`;
            params.push(baseId);
        }
        db.get(query, params, (err, row) => {
            if (err) return reject(err);
            resolve({ total_purchased: row ? row.total_purchased || 0 : 0 });
        });
    }));

    // Total Expended (within date range)
    promises.push(new Promise((resolve, reject) => {
        let query = `
            SELECT SUM(ABS(quantity_change)) AS total_expended FROM asset_history
            WHERE transaction_type = 'Expenditure' AND transaction_date BETWEEN ? AND ?
        `;
        const params = [sDate.toISOString().split('T')[0], eDate.toISOString().split('T')[0]];
        if (baseId) {
            query += ` AND source_base_id = ?`; // Assets expended FROM this base
            params.push(baseId);
        }
        db.get(query, params, (err, row) => {
            if (err) return reject(err);
            resolve({ total_expended: row ? row.total_expended || 0 : 0 });
        });
    }));

    // Net Movement (within date range for a base)
    // This uses the helper in AssetHistory model
    promises.push(new Promise((resolve, reject) => {
        AssetHistory.getNetMovement(baseId, sDate.toISOString().split('T')[0], eDate.toISOString().split('T')[0], (err, row) => {
            if (err) return reject(err);
            resolve({ net_movement: row ? row.net_change || 0 : 0 });
        });
    }));

    Promise.all(promises)
        .then(results => {
            const metrics = results.reduce((acc, current) => ({ ...acc, ...current }), {});
            res.status(200).json(metrics);
        })
        .catch(error => {
            console.error("Error fetching dashboard metrics:", error.message);
            res.status(500).json({ message: 'Server error fetching dashboard metrics' });
        });
};
