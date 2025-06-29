// server/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (id) => {
    return jwt.sign({ user_id: id }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
};

exports.register = (req, res) => {
    const { username, password, full_name, email, phone, role_name = 'User' } = req.body; // Default role to 'User'

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    User.findByUsername(username, (err, user) => {
        if (err) return res.status(500).json({ message: 'Server error during registration' });
        if (user) return res.status(409).json({ message: 'Username already exists' });

        bcrypt.hash(password, 10, (err, passwordHash) => {
            if (err) return res.status(500).json({ message: 'Error hashing password' });

            User.createUser(username, passwordHash, full_name, email, phone, (err, newUser) => {
                if (err) return res.status(500).json({ message: 'Error creating user' });

                // Assign default role (or specified role)
                Role.findByName(role_name, (err, role) => {
                    if (err || !role) {
                        console.warn(`Role '${role_name}' not found, user '${username}' registered without a role.`);
                        return res.status(201).json({
                            message: 'User registered successfully, but role not assigned (role not found).',
                            user: {
                                user_id: newUser.user_id,
                                username: newUser.username,
                                full_name: newUser.full_name,
                                email: newUser.email,
                            }
                        });
                    }

                    User.assignRole(newUser.user_id, role.role_id, (err) => {
                        if (err) {
                            console.error(`Error assigning role ${role_name} to user ${username}:`, err.message);
                            return res.status(500).json({
                                message: 'User registered, but failed to assign role.',
                                user: {
                                    user_id: newUser.user_id,
                                    username: newUser.username,
                                    full_name: newUser.full_name,
                                    email: newUser.email,
                                }
                            });
                        }
                        const token = generateToken(newUser.user_id);
                        res.status(201).json({
                            message: 'User registered successfully',
                            user: {
                                user_id: newUser.user_id,
                                username: newUser.username,
                                full_name: newUser.full_name,
                                email: newUser.email,
                                roles: [role.role_name], // Return the assigned role
                            },
                            token,
                        });
                    });
                });
            });
        });
    });
};

exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    User.findByUsername(username, (err, user) => {
        if (err) return res.status(500).json({ message: 'Server error during login' });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error comparing passwords' });
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

            User.getUserRoles(user.user_id, (err, roles) => {
                if (err) return res.status(500).json({ message: 'Server error fetching user roles' });

                User.getUserBases(user.user_id, (err, bases) => {
                    if (err) return res.status(500).json({ message: 'Server error fetching user bases' });

                    const token = generateToken(user.user_id);
                    res.status(200).json({
                        message: 'Login successful',
                        user: {
                            user_id: user.user_id,
                            username: user.username,
                            full_name: user.full_name,
                            email: user.email,
                            phone: user.phone,
                            roles: roles.map(r => r.role_name),
                            base_ids: bases.map(b => b.base_id) // Return array of base_ids
                        },
                        token,
                    });
                });
            });
        });
    });
};
