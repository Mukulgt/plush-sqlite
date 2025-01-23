import { isAuthenticated, isAdmin, logout, getAuthHeaders } from '../utils/auth.js';

// Authentication check
if (!isAuthenticated() || !isAdmin()) {
    window.location.href = '/login.html';
}

// DOM Elements
const menuItems = document.querySelectorAll('.admin-menu li');
const sections = document.querySelectorAll('.admin-section');
const logoutBtn = document.getElementById('logoutBtn');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const addProductBtn = document.getElementById('addProductBtn');

// Event Listeners
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const section = item.dataset.section;
        switchSection(section);
    });
});

logoutBtn.addEventListener('click', logout);

// Section switching
function switchSection(sectionId) {
    menuItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });
    
    sections.forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
    
    loadSectionData(sectionId);
}

// Data loading functions
async function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            await loadDashboardStats();
            break;
        case 'products':
            await loadProducts();
            break;
        case 'orders':
            await loadOrders();
            break;
        case 'customers':
            await loadCustomers();
            break;
    }
}

// Dashboard Stats
async function loadDashboardStats() {
    try {
        const [products, orders, customers] = await Promise.all([
            fetch('/products').then(res => res.json()),
            fetch('/orders').then(res => res.json()),
            fetch('/customers').then(res => res.json())
        ]);
        
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalCustomers').textContent = customers.length;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Products Management
async function loadProducts() {
    try {
        const response = await fetch('/products');
        const products = await response.json();
        
        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>₹${product.price}</td>
                <td>${product.category}</td>
                <td>${product.inStock ? 'Yes' : 'No'}</td>
                <td>
                    <button onclick="editProduct(${product.id})" class="btn-secondary">Edit</button>
                    <button onclick="deleteProduct(${product.id})" class="btn-danger">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Product Modal
addProductBtn.addEventListener('click', () => {
    productModal.style.display = 'block';
});

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        price: Number(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        inStock: document.getElementById('productStock').checked
    };
    
    try {
        await fetch('/admin/products', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(productData)
        });
        
        productModal.style.display = 'none';
        loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Failed to save product');
    }
});

// Orders Management
async function loadOrders() {
    try {
        const response = await fetch('/orders');
        const orders = await response.json();
        
        const tbody = document.querySelector('#ordersTable tbody');
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.customerName}</td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>₹${order.total}</td>
                <td>${order.status}</td>
                <td>
                    <button onclick="updateOrderStatus(${order.id})" class="btn-secondary">Update Status</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Customers Management
async function loadCustomers() {
    try {
        const response = await fetch('/customers');
        const customers = await response.json();
        
        const tbody = document.querySelector('#customersTable tbody');
        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.orderCount}</td>
                <td>₹${customer.totalSpent}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Initial load
loadDashboardStats();
