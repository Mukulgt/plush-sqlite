// Import components
import './components/ProductCard.js';
import './components/CategoryFilter.js';
import './components/Header.js';

class PlushoffApp {
    constructor() {
        this.init();
        this.cart = [];
        this.wishlist = [];
    }

    async init() {
        this.header = document.querySelector('site-header');
        this.productGrid = document.querySelector('.product-grid');
        this.categoryFilter = document.querySelector('category-filter');

        // Add event listeners
        this.header.addEventListener('search', (e) => this.handleSearch(e.detail.searchTerm));
        this.header.addEventListener('toggle-cart', () => this.toggleCart());
        this.header.addEventListener('toggle-wishlist', () => this.toggleWishlist());
        this.header.addEventListener('toggle-profile', () => this.toggleProfile());

        this.categoryFilter?.addEventListener('filter-change', (e) => this.handleFilterChange(e.detail));

        // Load initial data
        await this.loadProducts();
        this.loadCart();
        this.loadWishlist();
    }

    async loadProducts(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/products/filter?${queryParams}`);
            const products = await response.json();
            this.renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    renderProducts(products) {
        if (!this.productGrid) return;

        this.productGrid.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('product-card');
            card.setAttribute('name', product.name);
            card.setAttribute('price', product.price);
            card.setAttribute('image', product.image);
            if (product.salePrice) card.setAttribute('sale-price', product.salePrice);
            if (product.newArrival) card.setAttribute('is-new', '');
            if (product.featured) card.setAttribute('is-featured', '');
            
            card.addEventListener('add-to-cart', () => this.addToCart(product));
            card.addEventListener('toggle-wishlist', () => this.toggleWishlistItem(product));
            
            this.productGrid.appendChild(card);
        });
    }

    async handleSearch(searchTerm) {
        await this.loadProducts({ search: searchTerm });
    }

    async handleFilterChange(filters) {
        await this.loadProducts(filters);
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        
        this.saveCart();
        this.header.updateCartCount(this.getCartCount());
        this.showNotification('Added to cart');
    }

    toggleWishlistItem(product) {
        const index = this.wishlist.findIndex(item => item.id === product.id);
        
        if (index === -1) {
            this.wishlist.push(product);
            this.showNotification('Added to wishlist');
        } else {
            this.wishlist.splice(index, 1);
            this.showNotification('Removed from wishlist');
        }
        
        this.saveWishlist();
        this.header.updateWishlistCount(this.wishlist.length);
    }

    getCartCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            this.header.updateCartCount(this.getCartCount());
        }
    }

    saveWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    }

    loadWishlist() {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            this.wishlist = JSON.parse(savedWishlist);
            this.header.updateWishlistCount(this.wishlist.length);
        }
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'var(--primary)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            transform: 'translateY(100%)',
            opacity: '0',
            transition: 'all 0.3s ease',
            zIndex: '1000'
        });
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateY(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    toggleCart() {
        // Implement cart sidebar toggle
    }

    toggleWishlist() {
        // Implement wishlist sidebar toggle
    }

    toggleProfile() {
        // Implement profile menu toggle
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PlushoffApp();
});
