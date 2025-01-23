# Plushoff - Luxury Women's Fashion

Plushoff is your premier destination for luxury women's clothing, offering a curated collection of sophisticated, trendy, and high-quality fashion pieces. Our platform combines elegant design with a seamless shopping experience to bring you the best in women's fashion.

## Features

### Shopping Experience
- 🛍️ Curated luxury fashion collection
- 🔍 Advanced product search with filters
- 👗 Detailed product categorization
- 📱 Responsive design for all devices
- 💫 Real-time stock updates

### Customer Features
- 👤 Personalized user accounts
- 🛒 Seamless shopping cart
- 💝 Wishlist functionality
- 📦 Order tracking
- 💳 Secure checkout process

### Admin Dashboard
- 📊 Sales analytics
- 📈 Customer insights
- 📦 Inventory management
- 🎯 Product management
- 📨 Order processing

### Technical Features
- 🔒 Enhanced security
- 💾 Automatic backups
- ⚡ Performance optimizations
- 📱 Mobile-responsive design
- 🔍 SEO optimization

## Technology Stack

- **Backend**: Node.js, Express
- **Database**: SQLite
- **Security**: JWT, bcrypt, Helmet
- **Frontend**: HTML5, CSS3, JavaScript
- **Tools**: Webpack, Tailwind CSS

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Mukulgt/plush-sqlite.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the development server
npm run dev

# For production
npm run build
npm start
```

## API Documentation

### Authentication
- POST `/register` - Create new account
- POST `/login` - User login
- GET `/profile` - Get user profile

### Products
- GET `/products` - List all products
- GET `/products/search` - Search products
- GET `/products/:id` - Get product details

### Orders
- POST `/orders` - Create order
- GET `/orders` - List user orders
- GET `/orders/:id` - Get order details

### Admin Routes
- POST `/admin/products` - Add product
- GET `/admin/analytics` - View analytics
- POST `/admin/backup` - Create backup

## Security Features

- Rate limiting
- SQL injection prevention
- Input validation
- JWT authentication
- Password hashing
- Security headers
- Request size limiting

## Environment Variables

```env
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Database Management

- Automatic backups every 6 hours
- Manual backup option
- Data validation
- Transaction support
- Foreign key constraints

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Support

For support, email support@plushoff.com or open an issue on GitHub.
