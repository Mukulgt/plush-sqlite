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

app.get('/products/featured', async (req, res) => {
    try {
        const products = await db.all('SELECT * FROM products WHERE featured = 1');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products/new-arrivals', async (req, res) => {
    try {
        const products = await db.all('SELECT * FROM products WHERE newArrival = 1');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products/best-sellers', async (req, res) => {
    try {
        const products = await db.all('SELECT * FROM products WHERE bestSeller = 1');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products/category/:slug', async (req, res) => {
    try {
        const products = await db.all(`
            SELECT p.* FROM products p
            JOIN categories c ON p.categoryId = c.id
            WHERE c.slug = ?
        `, [req.params.slug]);
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

// Advanced Product Filters
app.get('/products/filter', async (req, res) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            colors,
            sizes,
            fabric,
            inStock,
            sort
        } = req.query;

        let sql = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (category) {
            sql += ' AND categoryId = ?';
            params.push(category);
        }

        if (minPrice) {
            sql += ' AND price >= ?';
            params.push(minPrice);
        }

        if (maxPrice) {
            sql += ' AND price <= ?';
            params.push(maxPrice);
        }

        if (colors) {
            sql += ' AND color IN (' + colors.split(',').map(() => '?').join(',') + ')';
            params.push(...colors.split(','));
        }

        if (sizes) {
            sql += ' AND size IN (' + sizes.split(',').map(() => '?').join(',') + ')';
            params.push(...sizes.split(','));
        }

        if (fabric) {
            sql += ' AND fabric = ?';
            params.push(fabric);
        }

        if (inStock) {
            sql += ' AND inStock = 1';
        }

        // Sorting
        if (sort) {
            switch (sort) {
                case 'price_asc':
                    sql += ' ORDER BY price ASC';
                    break;
                case 'price_desc':
                    sql += ' ORDER BY price DESC';
                    break;
                case 'newest':
                    sql += ' ORDER BY createdAt DESC';
                    break;
                case 'popular':
                    sql += ' ORDER BY bestSeller DESC, createdAt DESC';
                    break;
            }
        }

        const products = await db.all(sql, params);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Social Sharing
app.post('/products/:id/share', async (req, res) => {
    try {
        const { platform } = req.body;
        const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.SITE_URL}/products/${product.slug}`)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${product.name} at Plushoff!`)}&url=${encodeURIComponent(`${process.env.SITE_URL}/products/${product.slug}`)}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(`${process.env.SITE_URL}/products/${product.slug}`)}&media=${encodeURIComponent(product.image)}&description=${encodeURIComponent(product.description)}`,
            whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${product.name} at Plushoff: ${process.env.SITE_URL}/products/${product.slug}`)}`
        };

        // Track share analytics
        await db.run('INSERT INTO social_shares (productId, platform) VALUES (?, ?)', 
            [product.id, platform]);

        res.json({ url: shareUrls[platform] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Recently Viewed Products
app.post('/products/:id/view', authenticateToken, async (req, res) => {
    try {
        await db.run(`
            INSERT INTO product_views (userId, productId, viewedAt)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        `, [req.user.id, req.params.id]);
        res.status(200).json({ message: 'View recorded' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products/recently-viewed', authenticateToken, async (req, res) => {
    try {
        const products = await db.all(`
            SELECT p.*, v.viewedAt
            FROM products p
            JOIN product_views v ON p.id = v.productId
            WHERE v.userId = ?
            ORDER BY v.viewedAt DESC
            LIMIT 10
        `, [req.user.id]);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Product Reviews
app.post('/products/:id/reviews', authenticateToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        await db.run(`
            INSERT INTO product_reviews (productId, userId, rating, comment)
            VALUES (?, ?, ?, ?)
        `, [req.params.id, req.user.id, rating, comment]);
        res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products/:id/reviews', async (req, res) => {
    try {
        const reviews = await db.all(`
            SELECT r.*, u.name as userName
            FROM product_reviews r
            JOIN users u ON r.userId = u.id
            WHERE r.productId = ?
            ORDER BY r.createdAt DESC
        `, [req.params.id]);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Size Guide
app.get('/size-guide/:category', async (req, res) => {
    const sizeGuides = {
        'anarkali-suits': {
            'XS': { bust: '32"', waist: '26"', hip: '35"' },
            'S':  { bust: '34"', waist: '28"', hip: '37"' },
            'M':  { bust: '36"', waist: '30"', hip: '39"' },
            'L':  { bust: '38"', waist: '32"', hip: '41"' },
            'XL': { bust: '40"', waist: '34"', hip: '43"' }
        },
        'western-wear': {
            'XS': { bust: '32"', waist: '25"', hip: '35"' },
            'S':  { bust: '34"', waist: '27"', hip: '37"' },
            'M':  { bust: '36"', waist: '29"', hip: '39"' },
            'L':  { bust: '38"', waist: '31"', hip: '41"' },
            'XL': { bust: '40"', waist: '33"', hip: '43"' }
        }
    };
    
    res.json(sizeGuides[req.params.category] || {});
});

// Wishlist routes
app.post('/wishlist', authenticateToken, async (req, res) => {
    try {
        await db.run('INSERT INTO wishlists (userId, productId) VALUES (?, ?)', 
            [req.user.id, req.body.productId]);
        res.status(201).json({ message: 'Added to wishlist' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/wishlist', authenticateToken, async (req, res) => {
    try {
        const items = await db.all(`
            SELECT p.* FROM products p
            JOIN wishlists w ON p.id = w.productId
            WHERE w.userId = ?
        `, [req.user.id]);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Newsletter subscription
app.post('/newsletter', async (req, res) => {
    try {
        await db.run('INSERT INTO newsletter_subscribers (email) VALUES (?)', 
            [req.body.email]);
        res.status(201).json({ message: 'Subscribed successfully' });
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
