// Admin Portal JavaScript

// Handle login form submission
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Initialize inventory management
    initInventoryManagement();

    // Initialize order management
    initOrderManagement();
});

// Login handling
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Demo credentials - In production, this should be handled securely
    if (email === 'admin@plushoff.com' && password === 'admin123') {
        window.location.href = 'index.html';
    } else {
        alert('Invalid credentials. Please try again.');
    }
}

// Inventory Management
function initInventoryManagement() {
    const stockUpdateForm = document.querySelector('.quick-stock-update');
    if (stockUpdateForm) {
        stockUpdateForm.addEventListener('submit', handleStockUpdate);
    }

    // Initialize stock quantity inputs
    const stockInputs = document.querySelectorAll('.stock-input');
    stockInputs.forEach(input => {
        input.addEventListener('change', handleStockChange);
    });
}

function handleStockUpdate(e) {
    e.preventDefault();
    const product = document.querySelector('#product-select').value;
    const quantity = document.querySelector('#quantity-input').value;
    
    // Update stock logic here
    console.log(`Updating stock for product ${product}: ${quantity}`);
    alert('Stock updated successfully!');
}

function handleStockChange(e) {
    const newQuantity = e.target.value;
    const productId = e.target.dataset.productId;
    
    // Update stock logic here
    console.log(`Stock changed for product ${productId}: ${newQuantity}`);
}

// Order Management
function initOrderManagement() {
    const orderStatusSelects = document.querySelectorAll('.order-status-select');
    if (orderStatusSelects) {
        orderStatusSelects.forEach(select => {
            select.addEventListener('change', handleOrderStatusChange);
        });
    }

    // Initialize order filters
    const orderFilters = document.querySelector('.order-filters');
    if (orderFilters) {
        orderFilters.addEventListener('submit', handleOrderFilter);
    }
}

function handleOrderStatusChange(e) {
    const newStatus = e.target.value;
    const orderId = e.target.dataset.orderId;
    
    // Update order status logic here
    console.log(`Order ${orderId} status changed to: ${newStatus}`);
    alert('Order status updated successfully!');
}

function handleOrderFilter(e) {
    e.preventDefault();
    const status = document.querySelector('#status-filter').value;
    const dateRange = document.querySelector('#date-range-filter').value;
    const search = document.querySelector('#search-input').value;
    
    // Filter orders logic here
    console.log('Filtering orders:', { status, dateRange, search });
}

// Export functionality
function exportData(type) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `plushoff-${type}-${timestamp}.csv`;
    
    // Export logic here
    console.log(`Exporting ${type} data to ${filename}`);
    alert(`${type} data exported successfully!`);
}

// Print functionality
function printDocument(type, id) {
    // Print logic here
    console.log(`Printing ${type} ${id}`);
    window.print();
}

// Modal Functions
window.openAddProductModal = function() {
    document.getElementById('addProductModal').classList.remove('hidden');
    // Load categories into select
    const categorySelect = document.querySelector('#addProductForm [name="category"]');
    categorySelect.innerHTML = categories.map(cat => 
        `<option value="${cat.name}">${cat.name}</option>`
    ).join('');
};

window.closeAddProductModal = function() {
    document.getElementById('addProductModal').classList.add('hidden');
    document.getElementById('addProductForm').reset();
};

window.openAddCategoryModal = function() {
    document.getElementById('addCategoryModal').classList.remove('hidden');
};

window.closeAddCategoryModal = function() {
    document.getElementById('addCategoryModal').classList.add('hidden');
    document.getElementById('addCategoryForm').reset();
};

window.editProduct = function(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const form = document.getElementById('editProductForm');
    form.querySelector('[name="productId"]').value = product.id;
    form.querySelector('[name="name"]').value = product.name;
    form.querySelector('[name="category"]').value = product.category;
    form.querySelector('[name="price"]').value = product.price;
    form.querySelector('[name="description"]').value = product.description;
    form.querySelector('[name="inStock"]').checked = product.inStock;
    document.getElementById('currentProductImage').src = product.image;

    document.getElementById('editProductModal').classList.remove('hidden');
};

window.closeEditProductModal = function() {
    document.getElementById('editProductModal').classList.add('hidden');
    document.getElementById('editProductForm').reset();
};

window.editCategory = function(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    const form = document.getElementById('editCategoryForm');
    form.querySelector('[name="categoryId"]').value = category.id;
    form.querySelector('[name="name"]').value = category.name;
    form.querySelector('[name="description"]').value = category.description;

    document.getElementById('editCategoryModal').classList.remove('hidden');
};

window.closeEditCategoryModal = function() {
    document.getElementById('editCategoryModal').classList.add('hidden');
    document.getElementById('editCategoryForm').reset();
};

window.deleteProduct = function(id) {
    showDeleteConfirm(
        'Are you sure you want to delete this product? This action cannot be undone.',
        async (productId) => {
            try {
                await api.deleteProduct(productId);
                loadProducts();
                showNotification('Product deleted successfully');
            } catch (error) {
                console.error('Error deleting product:', error);
                showNotification('Error deleting product', 'error');
            }
        },
        id
    );
};

window.deleteCategory = function(id) {
    const category = categories.find(c => c.id === id);
    const productCount = products.filter(p => p.category === category.name).length;
    
    if (productCount > 0) {
        showNotification(`Cannot delete category with ${productCount} products`, 'error');
        return;
    }

    showDeleteConfirm(
        'Are you sure you want to delete this category? This action cannot be undone.',
        async (categoryId) => {
            try {
                await api.deleteCategory(categoryId);
                loadCategories();
                showNotification('Category deleted successfully');
            } catch (error) {
                console.error('Error deleting category:', error);
                showNotification('Error deleting category', 'error');
            }
        },
        id
    );
};

window.viewOrder = function(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const customer = customers.find(c => c.id === order.customerId);

    // Fill order details
    document.getElementById('orderDetailId').textContent = `#${order.id}`;
    document.getElementById('orderDetailDate').textContent = new Date(order.date).toLocaleString();
    document.getElementById('orderDetailStatus').textContent = order.status;
    document.getElementById('orderDetailPayment').textContent = order.paymentMethod;
    document.getElementById('orderDetailCustomer').textContent = order.customerName;
    document.getElementById('orderDetailEmail').textContent = customer?.email || 'N/A';
    document.getElementById('orderDetailPhone').textContent = customer?.phone || 'N/A';
    document.getElementById('orderDetailAddress').textContent = order.shippingAddress;
    document.getElementById('orderDetailTotal').textContent = order.total;

    // Fill order items
    document.getElementById('orderItemsTable').innerHTML = order.items.map(item => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${item.name}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">₹${item.price}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${item.quantity}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">₹${item.price * item.quantity}</div>
            </td>
        </tr>
    `).join('');

    document.getElementById('viewOrderModal').classList.remove('hidden');
};

window.closeViewOrderModal = function() {
    document.getElementById('viewOrderModal').classList.add('hidden');
};

window.viewCustomer = function(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    const customerOrders = orders.filter(o => o.customerId === customer.id);

    // Fill customer details
    document.getElementById('customerDetailName').textContent = customer.name;
    document.getElementById('customerDetailEmail').textContent = customer.email;
    document.getElementById('customerDetailPhone').textContent = customer.phone;
    document.getElementById('customerDetailAddress').textContent = customer.address;
    document.getElementById('customerDetailId').textContent = `#${customer.id}`;
    document.getElementById('customerDetailRegistered').textContent = new Date(customer.registeredDate).toLocaleDateString();
    document.getElementById('customerDetailOrders').textContent = customer.orderCount;
    document.getElementById('customerDetailSpent').textContent = customer.totalSpent;

    // Fill order history
    document.getElementById('customerOrdersTable').innerHTML = customerOrders.map(order => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">#${order.id}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${new Date(order.date).toLocaleDateString()}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}">
                    ${order.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">₹${order.total}</div>
            </td>
        </tr>
    `).join('');

    document.getElementById('viewCustomerModal').classList.remove('hidden');
};

window.closeViewCustomerModal = function() {
    document.getElementById('viewCustomerModal').classList.add('hidden');
};

window.closeDeleteConfirmModal = function() {
    document.getElementById('deleteConfirmModal').classList.add('hidden');
    deleteCallback = null;
    deleteItemId = null;
};

window.confirmDelete = function() {
    if (deleteCallback && deleteItemId) {
        deleteCallback(deleteItemId);
    }
    closeDeleteConfirmModal();
};

// API Functions
const api = {
    async getProducts() {
        const response = await fetch('http://localhost:3000/products');
        return response.json();
    },
    async getCategories() {
        const response = await fetch('http://localhost:3000/categories');
        return response.json();
    },
    async getOrders() {
        const response = await fetch('http://localhost:3000/orders');
        return response.json();
    },
    async getCustomers() {
        const response = await fetch('http://localhost:3000/customers');
        return response.json();
    },
    async addProduct(product) {
        const response = await fetch('http://localhost:3000/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        return response.json();
    },
    async updateProduct(id, product) {
        const response = await fetch(`http://localhost:3000/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        return response.json();
    },
    async deleteProduct(id) {
        await fetch(`http://localhost:3000/products/${id}`, {
            method: 'DELETE'
        });
    },
    async addCategory(category) {
        const response = await fetch('http://localhost:3000/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category)
        });
        return response.json();
    },
    async updateCategory(id, category) {
        const response = await fetch(`http://localhost:3000/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category)
        });
        return response.json();
    },
    async deleteCategory(id) {
        await fetch(`http://localhost:3000/categories/${id}`, {
            method: 'DELETE'
        });
    },
    async updateOrderStatus(id, status) {
        const response = await fetch(`http://localhost:3000/orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return response.json();
    }
};

// Data Storage
let products = [];
let categories = [];
let orders = [];
let customers = [];

// Load Data Functions
async function loadProducts() {
    try {
        products = await api.getProducts();
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
    }
}

async function loadCategories() {
    try {
        categories = await api.getCategories();
        displayCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
        showNotification('Error loading categories', 'error');
    }
}

async function loadOrders() {
    try {
        orders = await api.getOrders();
        displayOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Error loading orders', 'error');
    }
}

async function loadCustomers() {
    try {
        customers = await api.getCustomers();
        displayCustomers();
    } catch (error) {
        console.error('Error loading customers:', error);
        showNotification('Error loading customers', 'error');
    }
}

// Display Functions
function displayProducts() {
    const productsTable = document.querySelector('#products-table tbody');
    if (!productsTable) return;

    productsTable.innerHTML = products.map(product => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                        <img class="h-10 w-10 rounded-full object-cover" src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${product.name}</div>
                        <div class="text-sm text-gray-500">${product.category}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">₹${product.price}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editProduct(${product.id})" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    `).join('');
}

function displayCategories() {
    const categoriesTable = document.querySelector('#categories-table tbody');
    if (!categoriesTable) return;

    categoriesTable.innerHTML = categories.map(category => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${category.name}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900">${category.description}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${products.filter(p => p.category === category.name).length} products</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editCategory(${category.id})" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                <button onclick="deleteCategory(${category.id})" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    `).join('');
}

function displayOrders() {
    const ordersTable = document.querySelector('#orders-table tbody');
    if (!ordersTable) return;

    ordersTable.innerHTML = orders.map(order => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">#${order.id}</div>
                <div class="text-sm text-gray-500">${new Date(order.date).toLocaleDateString()}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${order.customerName}</div>
                <div class="text-sm text-gray-500">${order.shippingAddress}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}">
                    ${order.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ₹${order.total}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="viewOrder(${order.id})" class="text-indigo-600 hover:text-indigo-900">View</button>
            </td>
        </tr>
    `).join('');
}

function displayCustomers() {
    const customersTable = document.querySelector('#customers-table tbody');
    if (!customersTable) return;

    customersTable.innerHTML = customers.map(customer => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${customer.name}</div>
                <div class="text-sm text-gray-500">${customer.email}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${customer.phone}</div>
                <div class="text-sm text-gray-500">${customer.address}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${customer.orderCount} orders
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ₹${customer.totalSpent}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="viewCustomer(${customer.id})" class="text-indigo-600 hover:text-indigo-900">View</button>
            </td>
        </tr>
    `).join('');
}

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function getStatusColor(status) {
    const colors = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'processing': 'bg-blue-100 text-blue-800',
        'shipped': 'bg-purple-100 text-purple-800',
        'delivered': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${sectionId}-section`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active-nav-item', 'bg-gray-800');
    });
    document.querySelector(`[href="#${sectionId}"]`).classList.add('active-nav-item', 'bg-gray-800');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadProducts();
    loadCategories();
    loadOrders();
    loadCustomers();

    // Set up navigation
    const hash = window.location.hash.slice(1) || 'dashboard';
    showSection(hash);

    // Navigation event listeners
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = e.currentTarget.getAttribute('href').slice(1);
            window.location.hash = sectionId;
            showSection(sectionId);
        });
    });

    // Update navigation on hash change
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1);
        showSection(hash);
    });
});
