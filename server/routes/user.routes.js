// server/routes/user.routes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllRoles,
    createRole
} = require('../controllers/user.controller');

const router = express.Router();

// Public route for initial setup (if allowed) - consider removing this for production
// router.post('/', createUser); // Register route for initial admin is better handled via seed or a specific admin setup flow.
// For now, registration is through /api/auth/register

// Admin-only routes
router.use(protect); // All routes below this require authentication
router.use(authorize(['Admin'])); // All routes below this require 'Admin' role

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser); // Admin can create other users
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Role management
router.get('/roles', getAllRoles); // Maybe more roles added in the future.
router.post('/roles', createRole);

module.exports = router;
