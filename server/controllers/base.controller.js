// server/controllers/base.controller.js
const Base = require('../models/base.model');

// Create a new base
exports.createBase = (req, res) => {
    const { base_name, location, commander_id } = req.body;
    if (!base_name || !location) {
        return res.status(400).json({ message: 'Base name and location are required' });
    }
    Base.createBase(base_name, location, commander_id, (err, newBase) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ message: 'Base name already exists' });
            }
            console.error("Error creating base:", err.message);
            return res.status(500).json({ message: 'Error creating base' });
        }
        res.status(201).json({ message: 'Base created successfully', base_id: newBase.base_id, base_name, location });
    });
};

// Get all bases
exports.getAllBases = (req, res) => {
    Base.getAllBases((err, bases) => {
        if (err) {
            console.error("Error fetching bases:", err.message);
            return res.status(500).json({ message: 'Server error fetching bases' });
        }
        res.status(200).json(bases);
    });
};

// Get a single base by ID
exports.getBaseById = (req, res) => {
    const baseId = req.params.id;
    Base.findById(baseId, (err, base) => {
        if (err) {
            console.error("Error fetching base:", err.message);
            return res.status(500).json({ message: 'Server error' });
        }
        if (!base) {
            return res.status(404).json({ message: 'Base not found' });
        }
        res.status(200).json(base);
    });
};

// Update an existing base
exports.updateBase = (req, res) => {
    const baseId = req.params.id;
    const updates = req.body; // { base_name, location, commander_id }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No update data provided' });
    }

    Base.updateBase(baseId, updates, (err) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ message: 'Base name already exists' });
            }
            console.error("Error updating base:", err.message);
            return res.status(500).json({ message: 'Error updating base' });
        }
        res.status(200).json({ message: 'Base updated successfully' });
    });
};

// Delete a base
exports.deleteBase = (req, res) => {
    const baseId = req.params.id;
    Base.deleteBase(baseId, (err) => {
        if (err) {
            console.error("Error deleting base:", err.message);
            return res.status(500).json({ message: 'Error deleting base' });
        }
        res.status(200).json({ message: 'Base deleted successfully' });
    });
};
