// server/seeds/seed.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Ensure .env is loaded from server directory

const dbPath = path.resolve(__dirname, process.env.DATABASE_URL || '../data/kristalball.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        return;
    }
    console.log('Connected to SQLite database for seeding.');

    db.serialize(() => {
        // Drop tables in correct order to avoid foreign key constraints during development/reseeding
        db.run('DROP TABLE IF EXISTS asset_history');
        db.run('DROP TABLE IF EXISTS assets');
        db.run('DROP TABLE IF EXISTS asset_categories');
        db.run('DROP TABLE IF EXISTS base_users');
        db.run('DROP TABLE IF EXISTS bases');
        db.run('DROP TABLE IF EXISTS user_roles');
        db.run('DROP TABLE IF EXISTS roles');
        db.run('DROP TABLE IF EXISTS users', () => {
            console.log('Existing tables dropped (if they existed).');
            // Now re-run the schema creation from db.js
            require('../config/db'); // This will execute the schema creation
            console.log('Schema re-created.');
            seedData();
        });
    });
});

const seedData = () => {
    // 1. Seed Roles
    const roles = ['Admin', 'Logistics Officer', 'Base Commander', 'User'];
    roles.forEach(roleName => {
        db.run('INSERT OR IGNORE INTO roles (role_name) VALUES (?)', [roleName], function(err) {
            if (err) {
                console.error(`Error seeding role ${roleName}:`, err.message);
            } else if (this.changes > 0) {
                console.log(`Role '${roleName}' seeded.`);
            }
        });
    });

    // 2. Seed an Admin User
    const adminUsername = 'admin';
    const adminPassword = 'adminpassword'; // CHANGE THIS IN PRODUCTION!
    bcrypt.hash(adminPassword, 10, (err, passwordHash) => {
        if (err) {
            console.error('Error hashing admin password:', err.message);
            return;
        }

        db.get('SELECT user_id FROM users WHERE username = ?', [adminUsername], (err, row) => {
            if (err) {
                console.error('Error checking for admin user:', err.message);
                return;
            }
            if (!row) {
                db.run('INSERT INTO users (username, password_hash, full_name, email) VALUES (?, ?, ?, ?)',
                    [adminUsername, passwordHash, 'Admin User', 'admin@kristalball.com'],
                    function(err) {
                        if (err) {
                            console.error('Error seeding admin user:', err.message);
                            return;
                        }
                        const adminUserId = this.lastID;
                        console.log(`Admin user '${adminUsername}' seeded with ID: ${adminUserId}`);

                        // Assign 'Admin' role to the admin user
                        db.get('SELECT role_id FROM roles WHERE role_name = "Admin"', (err, roleRow) => {
                            if (err || !roleRow) {
                                console.error('Admin role not found or error:', err ? err.message : 'Role not found');
                                return;
                            }
                            db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [adminUserId, roleRow.role_id], (err) => {
                                if (err) {
                                    console.error('Error assigning Admin role:', err.message);
                                } else {
                                    console.log(`Admin role assigned to ${adminUsername}.`);
                                }
                                // Assign admin user to a base (if it exists or will exist)
                                db.get('SELECT base_id FROM bases WHERE base_name = "Central Command HQ"', (err, baseRow) => {
                                    if (err) {
                                        console.error('Error checking for Central Command HQ base:', err.message);
                                        return;
                                    }
                                    if (baseRow) {
                                        db.run('INSERT INTO base_users (user_id, base_id) VALUES (?, ?)', [adminUserId, baseRow.base_id], (err) => {
                                            if (err) {
                                                console.error('Error assigning Admin to Central Command HQ:', err.message);
                                            } else {
                                                console.log(`Admin user assigned to Central Command HQ.`);
                                            }
                                        });
                                    } else {
                                        console.warn('Central Command HQ base not found for admin assignment. Create it manually or adjust seed.');
                                    }
                                    // Close database connection after all operations
                                    db.close(() => {
                                        console.log('Database connection closed.');
                                    });
                                });
                            });
                        });
                    }
                );
            } else {
                console.log(`Admin user '${adminUsername}' already exists. Skipping.`);
                // If admin exists, ensure their role is correct (optional check)
                db.close(() => {
                    console.log('Database connection closed.');
                });
            }
        });
    });

    // 3. Seed Bases
    const bases = [
        { name: 'Central Command HQ', location: 'Capital City', commander_username: 'admin' },
        { name: 'Forward Operating Base Alpha', location: 'Northern Front', commander_username: null },
        { name: 'Logistics Hub Gamma', location: 'Industrial Zone', commander_username: null }
    ];

    bases.forEach(base => {
        db.get('SELECT base_id FROM bases WHERE base_name = ?', [base.name], (err, row) => {
            if (err) {
                console.error(`Error checking for base ${base.name}:`, err.message);
                return;
            }
            if (!row) {
                let commanderId = null;
                if (base.commander_username) {
                    db.get('SELECT user_id FROM users WHERE username = ?', [base.commander_username], (err, userRow) => {
                        if (!err && userRow) {
                            commanderId = userRow.user_id;
                        }
                        db.run('INSERT INTO bases (base_name, location, commander_id) VALUES (?, ?, ?)',
                            [base.name, base.location, commanderId],
                            function(err) {
                                if (err) {
                                    console.error(`Error seeding base ${base.name}:`, err.message);
                                } else {
                                    console.log(`Base '${base.name}' seeded.`);
                                }
                            }
                        );
                    });
                } else {
                    db.run('INSERT INTO bases (base_name, location, commander_id) VALUES (?, ?, ?)',
                        [base.name, base.location, null],
                        function(err) {
                            if (err) {
                                console.error(`Error seeding base ${base.name}:`, err.message);
                            } else {
                                console.log(`Base '${base.name}' seeded.`);
                            }
                        }
                    );
                }
            } else {
                console.log(`Base '${base.name}' already exists. Skipping.`);
            }
        });
    });

    // 4. Seed Asset Categories
    const assetCategories = ['Vehicle', 'Small Arm', 'Ammunition', 'Ration', 'Medical Supply', 'Communication Equipment'];
    assetCategories.forEach(categoryName => {
        db.run('INSERT OR IGNORE INTO asset_categories (category_name) VALUES (?)', [categoryName], function(err) {
            if (err) {
                console.error(`Error seeding asset category ${categoryName}:`, err.message);
            } else if (this.changes > 0) {
                console.log(`Asset category '${categoryName}' seeded.`);
            }
        });
    });

    // The db.close() for the initial admin seeding is in the admin user creation callback.
    // This is to ensure the admin user and their base assignment happens before closing.
    // For other seeds, it's fire-and-forget or requires careful Promises.
    // For a simple dev seed, a single close at the very end after all async ops finish is common.
    // However, for this script, we're closing it within the admin user creation callback
    // because that's the last guaranteed asynchronous operation that needs to complete.
    // For more complex seeding, consider using async/await and wrapping db operations in Promises.
};
