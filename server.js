const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const db = require('./src/database/db');
const dbUtils = require('./src/database/dbUtils');
const path = require('path');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '10kb' })); // Body size limit
app.use(express.static('dist'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5 // limit each IP to 5 login attempts per hour
});

// Automatic database backup every 6 hours
setInterval(async () => {
    try {
        await dbUtils.backup.createBackup();
        console.log('Database backup created successfully');
    } catch (error) {
        console.error('Backup failed:', error);
    }
}, 6 * 60 * 60 * 1000);

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// Admin middleware
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Input sanitization middleware
const sanitizeInputs = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            req.body[key] = dbUtils.security.sanitizeInput(req.body[key]);
        });
    }
    next();
};

app.use(sanitizeInputs);

// Auth routes
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validate input
        if (!dbUtils.security.validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        if (!dbUtils.security.validatePassword(password)) {
            return res.status(400).json({ 
                error: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers' 
            });
        }
        
        // Check if user exists
        const existingUser = await db.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.createUser({
            name,
            email,
            password: hashedPassword,
            role: 'user'
        });
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.findUserByEmail(email);
        
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                role: user.role 
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Product routes
app.get('/products', async (req, res) => {
    try {
        const products = await db.getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products/search', async (req, res) => {
    try {
        const { query, category, minPrice, maxPrice, inStock } = req.query;
        let products;
        
        if (query) {
            products = await dbUtils.search.searchProducts(query);
        } else {
            products = await dbUtils.search.filterProducts({
                category,
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                inStock: inStock === 'true'
            });
        }
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/admin/products', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await db.createProduct(req.body);
        res.status(201).json({ id: result.lastID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Order routes
app.post('/orders', authenticateToken, async (req, res) => {
    try {
        const orderId = await db.createOrder({
            userId: req.user.id,
            totalAmount: req.body.totalAmount,
            status: 'pending',
            products: req.body.products
        });
        
        res.status(201).json({ message: 'Order created successfully', orderId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await db.getOrders(req.user.role === 'admin' ? null : req.user.id);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Analytics routes (admin only)
app.get('/admin/analytics/products', authenticateToken, isAdmin, async (req, res) => {
    try {
        const analytics = await dbUtils.analytics.getProductAnalytics();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/admin/analytics/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const analytics = await dbUtils.analytics.getUserAnalytics();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manual backup endpoint (admin only)
app.post('/admin/backup', authenticateToken, isAdmin, async (req, res) => {
    try {
        const backupFile = await dbUtils.backup.createBackup();
        res.json({ message: 'Backup created successfully', file: backupFile });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
