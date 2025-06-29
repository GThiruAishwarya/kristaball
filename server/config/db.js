// server/config/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbPath = path.resolve(__dirname, process.env.DATABASE_URL || '../data/kristalball.sqlite'); // Use process.env.DATABASE_URL
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Run migrations/schema creation here
        db.serialize(() => {
            // Users Table
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    full_name TEXT,
                    email TEXT UNIQUE,
                    phone TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Roles Table
            db.run(`
                CREATE TABLE IF NOT EXISTS roles (
                    role_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    role_name TEXT UNIQUE NOT NULL
                )
            `);

            // User_Roles Junction Table (Many-to-Many)
            db.run(`
                CREATE TABLE IF NOT EXISTS user_roles (
                    user_id INTEGER NOT NULL,
                    role_id INTEGER NOT NULL,
                    PRIMARY KEY (user_id, role_id),
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
                )
            `);

            // Bases Table (Military Bases)
            db.run(`
                CREATE TABLE IF NOT EXISTS bases (
                    base_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    base_name TEXT UNIQUE NOT NULL,
                    location TEXT,
                    commander_id INTEGER,
                    FOREIGN KEY (commander_id) REFERENCES users(user_id)
                )
            `);

            // Base_Users Junction Table (A user can be assigned to multiple bases)
            db.run(`
                CREATE TABLE IF NOT EXISTS base_users (
                    base_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    PRIMARY KEY (base_id, user_id),
                    FOREIGN KEY (base_id) REFERENCES bases(base_id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
                )
            `);


            // Asset Categories/Types (e.g., Vehicle, Small Arm, Ammunition, Equipment, Consumable)
            db.run(`
                CREATE TABLE IF NOT EXISTS asset_categories (
                    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category_name TEXT UNIQUE NOT NULL
                )
            `);

            // Assets Master Table (Individual Assets or Models/Types if fungible)
            db.run(`
                CREATE TABLE IF NOT EXISTS assets (
                    asset_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category_id INTEGER NOT NULL,
                    model_name TEXT NOT NULL,            -- e.g., Humvee M1151, M4 Carbine, 7.62x39mm rounds
                    serial_number TEXT UNIQUE,          -- Nullable for fungible items like ammo
                    quantity INTEGER NOT NULL DEFAULT 1, -- Quantity for fungible items (e.g., 500 rounds)
                    unit_of_measure TEXT,               -- e.g., 'units', 'rounds', 'liters'
                    current_base_id INTEGER,            -- Where the asset is currently located
                    acquisition_date DATETIME,
                    unit_cost REAL,
                    status TEXT DEFAULT 'Operational',  -- Operational, Damaged, Under Repair, Disposed, Expended
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (category_id) REFERENCES asset_categories(category_id),
                    FOREIGN KEY (current_base_id) REFERENCES bases(base_id)
                )
            `);

            // Asset History/Transactions (Purchases, Transfers, Assignments, Expenditures, Returns)
            db.run(`
                CREATE TABLE IF NOT EXISTS asset_history (
                    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    asset_id INTEGER NOT NULL,
                    transaction_type TEXT NOT NULL,     -- 'Purchase', 'Transfer_In', 'Transfer_Out', 'Assignment', 'Expenditure', 'Return', 'Disposal'
                    quantity_change INTEGER NOT NULL,   -- Positive for addition, negative for reduction
                    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    source_base_id INTEGER,             -- For transfers/returns
                    destination_base_id INTEGER,        -- For transfers/purchases/assignments
                    involved_user_id INTEGER,           -- User initiating or receiving (e.g., assigned personnel)
                    notes TEXT,
                    FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
                    FOREIGN KEY (source_base_id) REFERENCES bases(base_id),
                    FOREIGN KEY (destination_base_id) REFERENCES bases(base_id),
                    FOREIGN KEY (involved_user_id) REFERENCES users(user_id)
                )
            `);

            // Indexes for faster lookups
            db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_assets_category ON assets (category_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_assets_base ON assets (current_base_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_history_asset ON asset_history (asset_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_history_type ON asset_history (transaction_type)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_history_date ON asset_history (transaction_date)`);

            console.log("Database schema checked/created.");
        });
    }
});

module.exports = db;
