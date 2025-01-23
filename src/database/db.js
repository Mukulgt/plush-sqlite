const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, 'store.db'), (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create tables
db.serialize(() => {
    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        category TEXT,
        inStock BOOLEAN DEFAULT 1,
        image TEXT
    )`);

    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user'
    )`);

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        totalAmount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    // Order items table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER,
        productId INTEGER,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders(id),
        FOREIGN KEY (productId) REFERENCES products(id)
    )`);

    // Create indexes for better performance
    db.run('CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)');
    db.run('CREATE INDEX IF NOT EXISTS idx_product_category ON products(category)');
    db.run('CREATE INDEX IF NOT EXISTS idx_order_user ON orders(userId)');
});

// Helper functions
const dbAsync = {
    run: (sql, params) => new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    }),
    get: (sql, params) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    }),
    all: (sql, params) => new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    })
};

// User operations
dbAsync.createUser = (userData) => {
    return dbAsync.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [userData.name, userData.email, userData.password, userData.role]);
};

dbAsync.findUserByEmail = (email) => {
    return dbAsync.get('SELECT * FROM users WHERE email = ?', [email]);
};

// Product operations
dbAsync.getAllProducts = () => {
    return dbAsync.all('SELECT * FROM products');
};

dbAsync.createProduct = (productData) => {
    return dbAsync.run('INSERT INTO products (name, price, description, category, inStock, image) VALUES (?, ?, ?, ?, ?, ?)', [productData.name, productData.price, productData.description, productData.category, productData.inStock, productData.image]);
};

// Order operations
dbAsync.createOrder = (orderData) => {
    return dbAsync.run('INSERT INTO orders (userId, totalAmount, status) VALUES (?, ?, ?)', [orderData.userId, orderData.totalAmount, orderData.status])
        .then(order => {
            const orderId = order.lastID;
            const promises = orderData.products.map(product => {
                return dbAsync.run('INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)', [orderId, product.productId, product.quantity, product.price]);
            });
            return Promise.all(promises).then(() => orderId);
        });
};

dbAsync.getOrders = (userId = null) => {
    let sql = 'SELECT * FROM orders';
    let params = [];
    if (userId) {
        sql += ' WHERE userId = ?';
        params.push(userId);
    }
    return dbAsync.all(sql, params);
};

module.exports = dbAsync;
