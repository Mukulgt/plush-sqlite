const fs = require('fs');
const path = require('path');
const db = require('./db');

// Backup Configuration
const BACKUP_DIR = path.join(__dirname, 'backups');
const MAX_BACKUPS = 5;

// Search and Filter Functions
const searchProducts = async (query) => {
    const searchTerm = `%${query}%`;
    return db.all(`
        SELECT * FROM products 
        WHERE name LIKE ? 
        OR description LIKE ? 
        OR category LIKE ?
    `, [searchTerm, searchTerm, searchTerm]);
};

const filterProducts = async (filters) => {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (filters.category) {
        sql += ' AND category = ?';
        params.push(filters.category);
    }

    if (filters.minPrice) {
        sql += ' AND price >= ?';
        params.push(filters.minPrice);
    }

    if (filters.maxPrice) {
        sql += ' AND price <= ?';
        params.push(filters.maxPrice);
    }

    if (filters.inStock !== undefined) {
        sql += ' AND inStock = ?';
        params.push(filters.inStock);
    }

    return db.all(sql, params);
};

// Backup Functions
const createBackup = async () => {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.db`);

    return new Promise((resolve, reject) => {
        const backup = fs.createReadStream(path.join(__dirname, 'store.db'))
            .pipe(fs.createWriteStream(backupFile));

        backup.on('finish', () => {
            cleanOldBackups();
            resolve(backupFile);
        });

        backup.on('error', reject);
    });
};

const cleanOldBackups = () => {
    const backups = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.startsWith('backup-'))
        .map(file => ({
            name: file,
            path: path.join(BACKUP_DIR, file),
            time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

    // Keep only the latest MAX_BACKUPS
    backups.slice(MAX_BACKUPS).forEach(backup => {
        fs.unlinkSync(backup.path);
    });
};

// Security Functions
const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        // Remove SQL injection attempts
        return input.replace(/['";\\]/g, '');
    }
    return input;
};

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
};

// Analytics Functions
const getProductAnalytics = async () => {
    return db.all(`
        SELECT 
            p.id,
            p.name,
            COUNT(oi.id) as total_orders,
            SUM(oi.quantity) as total_quantity_sold,
            SUM(oi.quantity * oi.price) as total_revenue
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.productId
        GROUP BY p.id
        ORDER BY total_revenue DESC
    `);
};

const getUserAnalytics = async () => {
    return db.all(`
        SELECT 
            u.id,
            u.name,
            COUNT(o.id) as total_orders,
            SUM(o.totalAmount) as total_spent,
            MAX(o.createdAt) as last_order_date
        FROM users u
        LEFT JOIN orders o ON u.id = o.userId
        GROUP BY u.id
        ORDER BY total_spent DESC
    `);
};

// Export all functions
module.exports = {
    search: {
        searchProducts,
        filterProducts
    },
    backup: {
        createBackup,
        cleanOldBackups
    },
    security: {
        sanitizeInput,
        validateEmail,
        validatePassword
    },
    analytics: {
        getProductAnalytics,
        getUserAnalytics
    }
};
