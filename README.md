# Plush Store with SQLite

A lightweight e-commerce platform built with Node.js, Express, and SQLite. Perfect for small to medium-sized online stores.

## Features

### Core Features
- 🛍️ Product management
- 👤 User authentication
- 🛒 Shopping cart
- 📦 Order management
- 🔐 Admin panel

### Advanced Features
- 🔍 Advanced product search and filtering
- 📊 Analytics dashboard for sales and user behavior
- 🔒 Enhanced security features
- 💾 Automatic database backups
- 📈 Performance optimizations

## Security Features
- SQL injection prevention
- Rate limiting
- Input sanitization
- JWT authentication
- Password hashing
- Security headers with Helmet
- Request size limiting

## Installation

```bash
# Clone the repository
git clone https://github.com/Mukulgt/plush-sqlite.git

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the server
npm start
```

## API Endpoints

### Authentication
- POST `/register` - Register new user
- POST `/login` - User login

### Products
- GET `/products` - List all products
- GET `/products/search` - Search products
- POST `/admin/products` - Add new product (Admin)

### Orders
- POST `/orders` - Create order
- GET `/orders` - Get user orders
- GET `/admin/orders` - Get all orders (Admin)

### Analytics (Admin)
- GET `/admin/analytics/products` - Product analytics
- GET `/admin/analytics/users` - User analytics

## Environment Variables

```env
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Database Backups
- Automatic backups every 6 hours
- Manual backup via `/admin/backup` endpoint
- Last 5 backups retained

## Contributing
Pull requests are welcome. For major changes, please open an issue first.

## License
[MIT](https://choosealicense.com/licenses/mit/)
