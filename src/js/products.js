// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const categoryFilter = document.getElementById('categoryFilter');

// State
let products = [];
let categories = [];
let currentCategory = 'all';

// Utility Functions
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

const showLoading = () => {
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
    }
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
};

const hideLoading = () => {
    if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
    }
};

const showError = () => {
    if (errorMessage) {
        errorMessage.classList.remove('hidden');
    }
    if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
    }
};

// Product Card Template
const createProductCard = (product) => {
    return `
        <div class="bg-white rounded-lg shadow-sm overflow-hidden group">
            <div class="relative">
                <img src="${product.image}" alt="${product.name}" 
                     class="w-full h-96 object-cover transition duration-300 group-hover:scale-105">
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-300"></div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2">${product.name}</h3>
                <p class="text-gray-600 mb-4">${formatPrice(product.price)}</p>
                <p class="text-gray-500 text-sm mb-4">${product.description}</p>
                <button onclick="addToCart(${product.id})" 
                        class="w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition duration-300 ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}">
                    ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    `;
};

// Fetch Products
const fetchProducts = async () => {
    showLoading();
    try {
        const response = await fetch('http://localhost:3000/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        
        products = await response.json();
        displayProducts();
        hideLoading();
    } catch (error) {
        console.error('Error fetching products:', error);
        showError();
    }
};

// Fetch Categories
const fetchCategories = async () => {
    try {
        const response = await fetch('http://localhost:3000/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        categories = await response.json();
        if (categoryFilter) {
            categoryFilter.innerHTML = `
                <option value="all">All Categories</option>
                ${categories.map(category => `
                    <option value="${category.name.toLowerCase()}">${category.name}</option>
                `).join('')}
            `;
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

// Display Products
const displayProducts = () => {
    if (!productsGrid) return;

    const filteredProducts = currentCategory === 'all'
        ? products
        : products.filter(product => 
            product.category.toLowerCase() === currentCategory.toLowerCase()
          );

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-span-3 text-center py-12">
                <p class="text-gray-500 text-lg">No products found in this category.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => 
        createProductCard(product)
    ).join('');
};

// Add to Cart
const addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.inStock) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Product added to cart!');
};

// Update Cart Count
const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
};

// Show Notification
const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-0';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('translate-y-full');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    fetchCategories();
    updateCartCount();

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            displayProducts();
        });
    }
});
