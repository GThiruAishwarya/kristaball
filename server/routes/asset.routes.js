// server/routes/asset.routes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    createAssetCategory,
    getAllAssetCategories,
    createAsset,
    getAllAssets,
    getAssetById,
    updateAsset,
    deleteAsset,
    recordTransfer,
    recordAssignment,
    recordExpenditure,
    getAssetHistory,
    getDashboardMetrics
} = require('../controllers/asset.controller');

const router = express.Router();

router.use(protect); // All routes below this require authentication

// Asset Categories (Admin only)
router.post('/categories', authorize(['Admin']), createAssetCategory);
router.get('/categories', authorize(['Admin', 'Logistics Officer', 'Base Commander']), getAllAssetCategories); // Can be viewed by others

// Asset Management (CRUD)
router.post('/', authorize(['Admin', 'Logistics Officer']), createAsset);
router.get('/', authorize(['Admin', 'Logistics Officer', 'Base Commander']), getAllAssets); // Can be viewed by all with access
router.get('/:id', authorize(['Admin', 'Logistics Officer', 'Base Commander']), getAssetById);
router.put('/:id', authorize(['Admin', 'Logistics Officer']), updateAsset); // Only Admin/Logistics can update full asset details
router.delete('/:id', authorize(['Admin']), deleteAsset); // Only Admin can delete

// Asset Transactions
router.post('/transfer', authorize(['Admin', 'Logistics Officer', 'Base Commander']), recordTransfer);
router.post('/assign', authorize(['Admin', 'Logistics Officer', 'Base Commander']), recordAssignment); // Includes expenditures (small arms, ammo, rations)
router.post('/expend', authorize(['Admin', 'Logistics Officer', 'Base Commander']), recordExpenditure); // Direct expenditure (e.g., non-recoverable items, combat loss)

// Asset History
router.get('/history', authorize(['Admin', 'Logistics Officer', 'Base Commander']), getAssetHistory);

// Dashboard Metrics (Accessible by relevant roles)
router.get('/dashboard-metrics', authorize(['Admin', 'Logistics Officer', 'Base Commander']), getDashboardMetrics);

module.exports = router;
