// Inventory Management Features
document.addEventListener('DOMContentLoaded', () => {
    initializeInventoryDashboard();
    initializeStockAlerts();
    initializeInventoryFilters();
    initializeQuickActions();
});

// Initialize Inventory Dashboard
function initializeInventoryDashboard() {
    updateInventoryStats();
    setInterval(updateInventoryStats, 300000); // Update every 5 minutes
}

function updateInventoryStats() {
    // Fetch and update inventory statistics
    const stats = {
        totalStock: 520,
        lowStock: 15,
        outOfStock: 3,
        recentUpdates: 8
    };

    // Update DOM elements
    document.querySelectorAll('[data-inventory-stat]').forEach(element => {
        const stat = element.getAttribute('data-inventory-stat');
        if (stats[stat]) {
            element.textContent = stats[stat];
        }
    });
}

// Initialize Stock Alerts
function initializeStockAlerts() {
    const alertsContainer = document.querySelector('#stockAlerts');
    if (!alertsContainer) return;

    // Fetch and display stock alerts
    updateStockAlerts();
}

function updateStockAlerts() {
    const alerts = [
        { product: 'Black Velvet Coord Set', stock: 2, threshold: 5 },
        { product: 'Pink Anarkali Set', stock: 3, threshold: 5 },
        { product: 'Blue Sequence Set', stock: 1, threshold: 5 }
    ];

    const alertsContainer = document.querySelector('#stockAlerts');
    if (!alertsContainer) return;

    alerts.forEach(alert => {
        const alertElement = createAlertElement(alert);
        alertsContainer.appendChild(alertElement);
    });
}

function createAlertElement(alert) {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between p-3 bg-red-50 rounded-lg';
    div.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="bg-red-100 p-2 rounded-lg">
                <i class="ri-alert-line text-red-500"></i>
            </div>
            <div>
                <h4 class="font-medium">${alert.product}</h4>
                <p class="text-sm text-red-500">Stock: ${alert.stock} (Below ${alert.threshold})</p>
            </div>
        </div>
        <button class="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
            Restock
        </button>
    `;
    return div;
}

// Initialize Inventory Filters
function initializeInventoryFilters() {
    const filterForm = document.querySelector('#inventoryFilters');
    if (!filterForm) return;

    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        applyFilters(new FormData(filterForm));
    });

    // Initialize range sliders if any
    initializeRangeSliders();
}

function applyFilters(formData) {
    // Apply filters to inventory table
    const filters = {
        category: formData.get('category'),
        stock: formData.get('stock'),
        status: formData.get('status')
    };

    // Update inventory table based on filters
    updateInventoryTable(filters);
}

// Initialize Quick Actions
function initializeQuickActions() {
    const actionsContainer = document.querySelector('#quickActions');
    if (!actionsContainer) return;

    actionsContainer.addEventListener('click', async (e) => {
        const action = e.target.closest('button')?.getAttribute('data-action');
        if (!action) return;

        switch (action) {
            case 'bulkUpdate':
                showBulkUpdateModal();
                break;
            case 'export':
                await exportInventory();
                break;
            case 'printLabels':
                printInventoryLabels();
                break;
        }
    });
}

// Utility Functions
function showBulkUpdateModal() {
    // Show modal for bulk inventory update
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-96">
            <h3 class="text-lg font-semibold mb-4">Bulk Update Inventory</h3>
            <form id="bulkUpdateForm" class="space-y-4">
                <div>
                    <label class="block text-sm text-gray-600 mb-1">Update Type</label>
                    <select class="w-full px-3 py-2 border rounded-lg">
                        <option value="add">Add Stock</option>
                        <option value="subtract">Subtract Stock</option>
                        <option value="set">Set Stock</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm text-gray-600 mb-1">Quantity</label>
                    <input type="number" class="w-full px-3 py-2 border rounded-lg" min="1">
                </div>
                <div class="flex space-x-2">
                    <button type="submit" class="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg">Update</button>
                    <button type="button" class="flex-1 px-4 py-2 border rounded-lg" onclick="this.closest('.fixed').remove()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function exportInventory() {
    try {
        // Simulate API call to export inventory
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create and download CSV
        const csv = 'Product,SKU,Category,Stock,Status\n' +
                   'Black Velvet Coord Set,BVC-001,Coord Sets,2,Low Stock\n' +
                   'Pink Anarkali Set,PAS-001,Ethnic Wear,3,Low Stock';
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        
        showNotification('Inventory exported successfully!', 'success');
    } catch (error) {
        showNotification('Failed to export inventory.', 'error');
    }
}

function printInventoryLabels() {
    // Implement label printing functionality
    window.print();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Export module
export {
    initializeInventoryDashboard,
    initializeStockAlerts,
    initializeInventoryFilters,
    initializeQuickActions
};
