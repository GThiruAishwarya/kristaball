// server/controllers/user.controller.js
const User = require('../models/user.model');
const Role = require('../models/role.model');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = (req, res) => {
    User.getAllUsers((err, users) => {
        if (err) {
            console.error("Error fetching users:", err.message);
            return res.status(500).json({ message: 'Server error fetching users' });
        }

        // For each user, fetch their roles and bases concurrently
        const userPromises = users.map(user => {
            return new Promise((resolve, reject) => {
                User.getUserRoles(user.user_id, (err, roles) => {
                    if (err) return reject(err);
                    User.getUserBases(user.user_id, (err, bases) => {
                        if (err) return reject(err);
                        resolve({
                            ...user,
                            roles: roles.map(r => r.role_name),
                            base_ids: bases.map(b => b.base_id)
                        });
                    });
                });
            });
        });

        Promise.all(userPromises)
            .then(usersWithDetails => res.status(200).json(usersWithDetails))
            .catch(error => {
                console.error("Error fetching user details:", error.message);
                res.status(500).json({ message: 'Server error fetching user details' });
            });
    });
};

// Get a single user by ID
exports.getUserById = (req, res) => {
    const userId = req.params.id;
    User.findById(userId, (err, user) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (!user) return res.status(404).json({ message: 'User not found' });

        User.getUserRoles(userId, (err, roles) => {
            if (err) return res.status(500).json({ message: 'Server error fetching roles' });
            User.getUserBases(userId, (err, bases) => {
                if (err) return res.status(500).json({ message: 'Server error fetching bases' });
                res.status(200).json({
                    ...user,
                    roles: roles.map(r => r.role_name),
                    base_ids: bases.map(b => b.base_id)
                });
            });
        });
    });
};

// Create a new user (Admin only)
exports.createUser = (req, res) => {
    const { username, password, full_name, email, phone, role_names = [], base_ids = [] } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    User.findByUsername(username, (err, existingUser) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (existingUser) return res.status(409).json({ message: 'Username already exists' });

        bcrypt.hash(password, 10, (err, passwordHash) => {
            if (err) return res.status(500).json({ message: 'Error hashing password' });

            User.createUser(username, passwordHash, full_name, email, phone, (err, newUser) => {
                if (err) return res.status(500).json({ message: 'Error creating user' });

                const userId = newUser.user_id;
                const rolePromises = role_names.map(roleName => {
                    return new Promise((resolve, reject) => {
                        Role.findByName(roleName, (err, role) => {
                            if (err || !role) {
                                console.warn(`Role '${roleName}' not found or error. Skipping assignment.`);
                                return resolve(); // Resolve even if role not found
                            }
                            User.assignRole(userId, role.role_id, (err) => {
                                if (err) {
                                    console.error(`Error assigning role ${roleName}:`, err.message);
                                    return reject(err);
                                }
                                resolve();
                            });
                        });
                    });
                });

                const basePromises = base_ids.map(baseId => {
                    return new Promise((resolve, reject) => {
                        User.assignBase(userId, baseId, (err) => {
                            if (err) {
                                console.error(`Error assigning base ${baseId}:`, err.message);
                                return reject(err);
                            }
                            resolve();
                        });
                    });
                });

                Promise.all([...rolePromises, ...basePromises])
                    .then(() => {
                        res.status(201).json({
                            message: 'User created successfully',
                            user_id: userId,
                            username: username,
                            roles_assigned: role_names,
                            bases_assigned: base_ids
                        });
                    })
                    .catch(error => {
                        console.error("Error during role/base assignment:", error.message);
                        res.status(500).json({ message: 'User created, but error assigning roles/bases.' });
                    });
            });
        });
    });
};

// Update an existing user
exports.updateUser = (req, res) => {
    const userId = req.params.id;
    const { full_name, email, phone, new_password, role_names = [], base_ids = [] } = req.body;
    const updates = { full_name, email, phone };

    // Hash new password if provided
    if (new_password) {
        bcrypt.hash(new_password, 10, (err, passwordHash) => {
            if (err) return res.status(500).json({ message: 'Error hashing new password' });
            updates.password_hash = passwordHash;
            performUpdate();
        });
    } else {
        performUpdate();
    }

    const performUpdate = () => {
        User.updateUser(userId, updates, (err) => {
            if (err) return res.status(500).json({ message: 'Error updating user data' });

            // Handle roles update
            const updateRolesPromise = new Promise((resolve, reject) => {
                if (role_names.length > 0) { // Only update if role_names is provided
                    User.getUserRoles(userId, (err, currentRoles) => {
                        if (err) return reject(err);
                        const currentRoleNames = currentRoles.map(r => r.role_name);

                        const rolesToAdd = role_names.filter(name => !currentRoleNames.includes(name));
                        const rolesToRemove = currentRoleNames.filter(name => !role_names.includes(name));

                        const promises = [];

                        rolesToAdd.forEach(roleName => {
                            promises.push(new Promise((res, rej) => {
                                Role.findByName(roleName, (e, role) => {
                                    if (e || !role) {
                                        console.warn(`Role '${roleName}' not found or error. Skipping add.`);
                                        return res();
                                    }
                                    User.assignRole(userId, role.role_id, res); // No error handling here, handled by Promise.allSettled
                                });
                            }));
                        });

                        rolesToRemove.forEach(roleName => {
                            promises.push(new Promise((res, rej) => {
                                Role.findByName(roleName, (e, role) => {
                                    if (e || !role) {
                                        console.warn(`Role '${roleName}' not found or error. Skipping remove.`);
                                        return res();
                                    }
                                    User.removeRole(userId, role.role_id, res); // No error handling here
                                });
                            }));
                        });
                        Promise.allSettled(promises).then(resolve).catch(reject);
                    });
                } else {
                    resolve(); // No roles to update
                }
            });

            // Handle bases update
            const updateBasesPromise = new Promise((resolve, reject) => {
                if (base_ids.length > 0) { // Only update if base_ids is provided
                    User.getUserBases(userId, (err, currentBases) => {
                        if (err) return reject(err);
                        const currentBaseIds = currentBases.map(b => b.base_id);

                        const basesToAdd = base_ids.filter(id => !currentBaseIds.includes(id));
                        const basesToRemove = currentBaseIds.filter(id => !base_ids.includes(id));

                        const promises = [];
                        basesToAdd.forEach(baseId => promises.push(new Promise((res, rej) => User.assignBase(userId, baseId, res))));
                        basesToRemove.forEach(baseId => promises.push(new Promise((res, rej) => User.removeBase(userId, baseId, res))));

                        Promise.allSettled(promises).then(resolve).catch(reject);
                    });
                } else {
                    resolve(); // No bases to update
                }
            });

            Promise.all([updateRolesPromise, updateBasesPromise])
                .then(() => {
                    res.status(200).json({ message: 'User updated successfully' });
                })
                .catch(error => {
                    console.error("Error during user role/base update:", error.message);
                    res.status(500).json({ message: 'User data updated, but error during role/base updates.' });
                });
        });
    };
};

// Delete a user
exports.deleteUser = (req, res) => {
    const userId = req.params.id;
    User.deleteUser(userId, (err) => {
        if (err) return res.status(500).json({ message: 'Error deleting user' });
        res.status(200).json({ message: 'User deleted successfully' });
    });
};

// Get all roles
exports.getAllRoles = (req, res) => {
    Role.getAllRoles((err, roles) => {
        if (err) return res.status(500).json({ message: 'Server error fetching roles' });
        res.status(200).json(roles);
    });
};

// Create a new role (Admin only)
exports.createRole = (req, res) => {
    const { role_name } = req.body;
    if (!role_name) {
        return res.status(400).json({ message: 'Role name is required' });
    }
    Role.findByName(role_name, (err, existingRole) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (existingRole) return res.status(409).json({ message: 'Role name already exists' });

        Role.createRole(role_name, (err, newRole) => {
            if (err) return res.status(500).json({ message: 'Error creating role' });
            res.status(201).json({ message: 'Role created successfully', role_id: newRole.role_id, role_name });
        });
    });
};
