// server/routes/base.routes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    createBase,
    getAllBases,
    getBaseById,
    updateBase,
    deleteBase
} = require('../controllers/base.controller');

const router = express.Router();

router.use(protect); // All routes below this require authentication

// Admin-only operations
router.post('/', authorize(['Admin']), createBase);
router.put('/:id', authorize(['Admin']), updateBase);
router.delete('/:id', authorize(['Admin']), deleteBase);

// Accessible by relevant roles (e.g., Admin, Logistics Officer, Base Commander)
router.get('/', authorize(['Admin', 'Logistics Officer', 'Base Commander']), getAllBases);
router.get('/:id', authorize(['Admin', 'Logistics Officer', 'Base Commander']), getBaseById);

module.exports = router;
