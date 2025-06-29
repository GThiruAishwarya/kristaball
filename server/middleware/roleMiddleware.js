// server/middleware/roleMiddleware.js
const db = require('../config/db');

const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const userId = req.user.id;

        const query = `
            SELECT r.role_name FROM user_roles ur
            JOIN roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = ?
        `;

        db.all(query, [userId], (err, userRoles) => {
            if (err) {
                console.error("Error fetching user roles:", err.message);
                return res.status(500).json({ message: 'Server error fetching roles' });
            }

            const hasRequiredRole = userRoles.some(role => roles.includes(role.role_name));

            if (hasRequiredRole) {
                // Attach user's roles to request for later use if needed
                req.user.roles = userRoles.map(role => role.role_name);
                next();
            } else {
                res.status(403).json({ message: 'Forbidden, insufficient role' });
            }
        });
    };
};

module.exports = { authorize };
