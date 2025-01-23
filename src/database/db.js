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
    // Categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image TEXT,
        parentId INTEGER,
        FOREIGN KEY (parentId) REFERENCES categories(id)
    )`);

    // Products table with enhanced fields
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        price REAL NOT NULL,
        salePrice REAL,
        description TEXT,
        categoryId INTEGER,
        fabric TEXT,
        care TEXT,
        size TEXT,
        color TEXT,
        inStock BOOLEAN DEFAULT 1,
        featured BOOLEAN DEFAULT 0,
        newArrival BOOLEAN DEFAULT 0,
        bestSeller BOOLEAN DEFAULT 0,
        image TEXT,
        images TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
    )`);

    // Insert default categories
    const categories = [
        { name: 'Anarkali Suits', slug: 'anarkali-suits', description: 'Elegant Anarkali suits for every occasion' },
        { name: 'Coord Sets', slug: 'coord-sets', description: 'Trendy and comfortable coord sets' },
        { name: 'Western Wear', slug: 'western-wear', description: 'Modern western fashion pieces' },
        { name: 'Blazer Sets', slug: 'blazer-sets', description: 'Sophisticated blazer sets for a powerful look' },
        { name: 'Ethnic Wear', slug: 'ethnic-wear', description: 'Traditional ethnic wear with modern touch' },
        { name: 'Luxury Collection', slug: 'luxury-collection', description: 'Premium luxury fashion pieces' }
    ];

    categories.forEach(category => {
        db.run(`INSERT OR IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)`,
            [category.name, category.slug, category.description]);
    });

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
    db.run('CREATE INDEX IF NOT EXISTS idx_product_category ON products(categoryId)');
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
    return dbAsync.run('INSERT INTO products (name, slug, price, salePrice, description, categoryId, fabric, care, size, color, inStock, featured, newArrival, bestSeller, image, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [productData.name, productData.slug, productData.price, productData.salePrice, productData.description, productData.categoryId, productData.fabric, productData.care, productData.size, productData.color, productData.inStock, productData.featured, productData.newArrival, productData.bestSeller, productData.image, productData.images]);
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
