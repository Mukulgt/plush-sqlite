// Orders Management Features
document.addEventListener('DOMContentLoaded', () => {
    initializeOrdersDashboard();
    initializeOrderFilters();
    initializeOrderActions();
    initializeOrderAnalytics();
});

// Initialize Orders Dashboard
function initializeOrdersDashboard() {
    updateOrderStats();
    setInterval(updateOrderStats, 300000); // Update every 5 minutes
}

function updateOrderStats() {
    // Fetch and update order statistics
    const stats = {
        totalOrders: 156,
        pendingOrders: 12,
        completedOrders: 142,
        totalRevenue: '₹7,49,999'
    };

    // Update DOM elements
    document.querySelectorAll('[data-order-stat]').forEach(element => {
        const stat = element.getAttribute('data-order-stat');
        if (stats[stat]) {
            element.textContent = stats[stat];
        }
    });
}

// Initialize Order Filters
function initializeOrderFilters() {
    const filterForm = document.querySelector('#orderFilters');
    if (!filterForm) return;

    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        applyOrderFilters(new FormData(filterForm));
    });

    // Initialize date range picker
    initializeDateRangePicker();
}

function applyOrderFilters(formData) {
    // Apply filters to orders table
    const filters = {
        status: formData.get('status'),
        dateRange: formData.get('dateRange'),
        paymentStatus: formData.get('paymentStatus')
    };

    // Update orders table based on filters
    updateOrdersTable(filters);
}

// Initialize Order Actions
function initializeOrderActions() {
    const actionsContainer = document.querySelector('#orderActions');
    if (!actionsContainer) return;

    actionsContainer.addEventListener('click', async (e) => {
        const action = e.target.closest('button')?.getAttribute('data-action');
        const orderId = e.target.closest('[data-order-id]')?.getAttribute('data-order-id');

        if (!action || !orderId) return;

        switch (action) {
            case 'view':
                showOrderDetails(orderId);
                break;
            case 'update':
                showStatusUpdateModal(orderId);
                break;
            case 'invoice':
                generateInvoice(orderId);
                break;
            case 'delete':
                if (confirm('Are you sure you want to delete this order?')) {
                    await deleteOrder(orderId);
                }
                break;
        }
    });
}

// Initialize Order Analytics
function initializeOrderAnalytics() {
    const analyticsContainer = document.querySelector('#orderAnalytics');
    if (!analyticsContainer) return;

    // Update analytics periodically
    updateOrderAnalytics();
    setInterval(updateOrderAnalytics, 300000); // Update every 5 minutes
}

function updateOrderAnalytics() {
    // Fetch and update analytics data
    const data = {
        dailyOrders: [12, 15, 8, 20, 18, 25, 22],
        revenue: [15000, 18000, 12000, 25000, 22000, 30000, 28000],
        topProducts: [
            { name: 'Black Velvet Coord Set', orders: 45 },
            { name: 'Pink Anarkali Set', orders: 32 },
            { name: 'Blue Sequence Set', orders: 28 }
        ]
    };

    // Update charts and metrics
    updateAnalyticsCharts(data);
}

// Order Action Functions
async function showOrderDetails(orderId) {
    try {
        // Fetch order details
        const order = await fetchOrderDetails(orderId);
        
        // Show modal with order details
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Order #${order.id}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="ri-close-line text-xl"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <h4 class="font-medium">Customer Details</h4>
                            <p class="text-sm text-gray-600">${order.customer.name}</p>
                            <p class="text-sm text-gray-600">${order.customer.email}</p>
                            <p class="text-sm text-gray-600">${order.customer.phone}</p>
                        </div>
                        <div>
                            <h4 class="font-medium">Shipping Address</h4>
                            <p class="text-sm text-gray-600">${order.shipping.address}</p>
                            <p class="text-sm text-gray-600">${order.shipping.city}, ${order.shipping.state}</p>
                            <p class="text-sm text-gray-600">${order.shipping.pincode}</p>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-medium mb-2">Order Items</h4>
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-2 text-left">Product</th>
                                    <th class="px-4 py-2 text-left">Quantity</th>
                                    <th class="px-4 py-2 text-left">Price</th>
                                    <th class="px-4 py-2 text-left">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr class="border-t">
                                        <td class="px-4 py-2">${item.name}</td>
                                        <td class="px-4 py-2">${item.quantity}</td>
                                        <td class="px-4 py-2">₹${item.price}</td>
                                        <td class="px-4 py-2">₹${item.quantity * item.price}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot class="border-t font-medium">
                                <tr>
                                    <td colspan="3" class="px-4 py-2 text-right">Subtotal:</td>
                                    <td class="px-4 py-2">₹${order.subtotal}</td>
                                </tr>
                                <tr>
                                    <td colspan="3" class="px-4 py-2 text-right">Shipping:</td>
                                    <td class="px-4 py-2">₹${order.shipping.cost}</td>
                                </tr>
                                <tr>
                                    <td colspan="3" class="px-4 py-2 text-right">Total:</td>
                                    <td class="px-4 py-2">₹${order.total}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button class="px-4 py-2 border rounded-lg hover:bg-gray-50" onclick="generateInvoice('${order.id}')">
                            Generate Invoice
                        </button>
                        <button class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800" onclick="showStatusUpdateModal('${order.id}')">
                            Update Status
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        showNotification('Failed to load order details.', 'error');
    }
}

function showStatusUpdateModal(orderId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-96">
            <h3 class="text-lg font-semibold mb-4">Update Order Status</h3>
            <form id="statusUpdateForm" class="space-y-4">
                <div>
                    <label class="block text-sm text-gray-600 mb-1">Status</label>
                    <select class="w-full px-3 py-2 border rounded-lg">
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm text-gray-600 mb-1">Comments</label>
                    <textarea class="w-full px-3 py-2 border rounded-lg" rows="3"></textarea>
                </div>
                <div class="flex space-x-2">
                    <button type="submit" class="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg">Update</button>
                    <button type="button" class="flex-1 px-4 py-2 border rounded-lg" onclick="this.closest('.fixed').remove()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    const form = modal.querySelector('#statusUpdateForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            showNotification('Order status updated successfully!', 'success');
            modal.remove();
            updateOrderStats();
        } catch (error) {
            showNotification('Failed to update order status.', 'error');
        }
    });
}

async function generateInvoice(orderId) {
    try {
        // Simulate API call to generate invoice
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showNotification('Invoice generated successfully!', 'success');
        
        // Simulate downloading PDF
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,JVBERi0...`; // Base64 encoded PDF
        link.download = `invoice-${orderId}.pdf`;
        link.click();
    } catch (error) {
        showNotification('Failed to generate invoice.', 'error');
    }
}

async function deleteOrder(orderId) {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        showNotification('Order deleted successfully!', 'success');
        updateOrderStats();
    } catch (error) {
        showNotification('Failed to delete order.', 'error');
    }
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function updateAnalyticsCharts(data) {
    // Update order trend chart
    const trendChart = document.querySelector('#orderTrendChart');
    if (trendChart) {
        // Implement chart update logic
    }

    // Update revenue chart
    const revenueChart = document.querySelector('#revenueChart');
    if (revenueChart) {
        // Implement chart update logic
    }

    // Update top products
    const topProductsList = document.querySelector('#topProductsList');
    if (topProductsList) {
        topProductsList.innerHTML = data.topProducts.map(product => `
            <div class="flex justify-between items-center p-2">
                <span>${product.name}</span>
                <span class="text-gray-500">${product.orders} orders</span>
            </div>
        `).join('');
    }
}

// Mock API Functions
async function fetchOrderDetails(orderId) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
        id: orderId,
        customer: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+91 9876543210'
        },
        shipping: {
            address: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            cost: 99
        },
        items: [
            { name: 'Black Velvet Coord Set', quantity: 1, price: 4999 },
            { name: 'Pink Anarkali Set', quantity: 1, price: 5999 }
        ],
        subtotal: 10998,
        total: 11097
    };
}

// Export module
export {
    initializeOrdersDashboard,
    initializeOrderFilters,
    initializeOrderActions,
    initializeOrderAnalytics
};
