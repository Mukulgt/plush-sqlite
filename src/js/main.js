// Import styles
import '../css/style.css';

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

function addToCart(productId, name, price, image) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name,
            price,
            image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = parseInt(quantity);
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        }
    }
}

// Toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast show position-fixed bottom-0 end-0 m-3';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="toast-body">
            ${message}
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuButton = document.getElementById('menuButton');
    const menu = document.getElementById('menu');

    menuButton.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });

    // Close menu on window resize if it's open (prevents menu from staying open when switching to desktop)
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024 && !menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
        }
    });

    // Hero section animations
    const heroImages = document.querySelectorAll('.hero-image');
    heroImages.forEach((img, index) => {
        img.classList.add('animate-fadeInUp');
        img.style.animationDelay = `${index * 0.2}s`;
    });

    // Product card hover effects
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('transform', '-translate-y-2', 'transition-transform');
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('transform', '-translate-y-2', 'transition-transform');
        });
    });

    // Category card hover effects
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        const overlay = card.querySelector('.category-overlay');
        card.addEventListener('mouseenter', () => {
            overlay.classList.remove('opacity-0');
            overlay.classList.add('opacity-100');
        });
        card.addEventListener('mouseleave', () => {
            overlay.classList.add('opacity-0');
            overlay.classList.remove('opacity-100');
        });
    });

    // Cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartCount = document.querySelector('.cart-count');
    let currentCartCount = 0;

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentCartCount++;
            if (cartCount) {
                cartCount.textContent = currentCartCount;
                
                // Show notification
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg transform transition-transform duration-500 translate-x-full';
                notification.textContent = 'Item added to cart!';
                document.body.appendChild(notification);
                
                // Animate notification
                setTimeout(() => {
                    notification.classList.remove('translate-x-full');
                }, 100);
                
                // Remove notification
                setTimeout(() => {
                    notification.classList.add('translate-x-full');
                    setTimeout(() => {
                        notification.remove();
                    }, 500);
                }, 3000);
            }
        });
    });

    updateCartCount();
});

// Export functions for use in other modules
export { addToCart, removeFromCart, updateQuantity, showToast };
