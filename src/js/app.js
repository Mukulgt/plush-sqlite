// Import components
import './components/ProductCard.js';
import './components/CategoryFilter.js';
import './components/Header.js';
import './components/CartSidebar.js';
import './components/QuickView.js';

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
        this.cartSidebar = document.querySelector('cart-sidebar');
        this.quickView = document.querySelector('quick-view');

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

        // Initialize components
        document.body.appendChild(this.cartSidebar);
        document.body.appendChild(this.quickView);

        // Cart functionality
        let cartItems = [];

        function updateCart(items) {
            cartItems = items;
            this.cartSidebar.updateCart(items);
            updateCartCount();
        }

        function updateCartCount() {
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.textContent = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            }
        }

        // Event listeners for cart
        this.cartSidebar.addEventListener('update-quantity', (e) => {
            const { id, action } = e.detail;
            const item = cartItems.find(item => item.id === id);
            if (item) {
                if (action === 'increase') {
                    item.quantity = Math.min(item.quantity + 1, 10);
                } else {
                    item.quantity = Math.max(item.quantity - 1, 1);
                }
                updateCart([...cartItems]);
            }
        });

        this.cartSidebar.addEventListener('remove-item', (e) => {
            const { id } = e.detail;
            cartItems = cartItems.filter(item => item.id !== id);
            updateCart(cartItems);
        });

        this.cartSidebar.addEventListener('checkout', () => {
            // Implement checkout logic
            console.log('Proceeding to checkout with items:', cartItems);
        });

        // Quick view functionality
        this.quickView.addEventListener('add-to-cart', (e) => {
            const { id, name, price, quantity, selectedSize, selectedColor, image } = e.detail;
            const existingItem = cartItems.find(item => 
                item.id === id && 
                item.selectedSize === selectedSize && 
                item.selectedColor === selectedColor
            );

            if (existingItem) {
                existingItem.quantity = Math.min(existingItem.quantity + quantity, 10);
            } else {
                cartItems.push({
                    id,
                    name,
                    price,
                    quantity,
                    selectedSize,
                    selectedColor,
                    image
                });
            }

            updateCart([...cartItems]);
            this.cartSidebar.open();
        });

        this.quickView.addEventListener('toggle-wishlist', (e) => {
            const product = e.detail;
            // Implement wishlist logic
            console.log('Toggle wishlist for product:', product);
        });

        // Add animation classes to elements
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.add('hover-lift');
            
            const quickViewBtn = card.querySelector('.quick-view-button');
            if (quickViewBtn) {
                quickViewBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const productData = {
                        id: card.dataset.id,
                        name: card.querySelector('.product-name').textContent,
                        price: parseFloat(card.querySelector('.product-price').dataset.price),
                        description: card.dataset.description,
                        images: JSON.parse(card.dataset.images),
                        colors: JSON.parse(card.dataset.colors)
                    };
                    this.quickView.open(productData);
                });
            }
        });

        // Add loading states
        function showLoading(element) {
            element.classList.add('loading');
        }

        function hideLoading(element) {
            element.classList.remove('loading');
        }

        // Add page transitions
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const currentPage = document.querySelector('.page.active');
                const nextPage = document.querySelector(link.getAttribute('href'));
                
                if (currentPage && nextPage) {
                    currentPage.classList.add('page-exit');
                    currentPage.classList.add('page-exit-active');
                    
                    setTimeout(() => {
                        currentPage.classList.remove('active', 'page-exit', 'page-exit-active');
                        nextPage.classList.add('active', 'page-enter');
                        
                        requestAnimationFrame(() => {
                            nextPage.classList.add('page-enter-active');
                            setTimeout(() => {
                                nextPage.classList.remove('page-enter', 'page-enter-active');
                            }, 300);
                        });
                    }, 300);
                }
            });
        });

        // Initialize animations
        document.querySelectorAll('.fade-in').forEach(element => {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animation = 'fadeIn 0.5s ease forwards';
                        observer.unobserve(entry.target);
                    }
                });
            });
            observer.observe(element);
        });

        // Add button animations
        document.querySelectorAll('button:not(.quantity-button):not(.close-button)').forEach(button => {
            button.classList.add('animated-button');
        });
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
