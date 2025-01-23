// Product Management Features
document.addEventListener('DOMContentLoaded', () => {
    initializeProductStats();
    initializeProductForm();
    initializeCategoryManagement();
    initializeBulkActions();
    initializeProductAnalytics();
});

// Initialize Product Statistics
function initializeProductStats() {
    // Update stats periodically
    updateStats();
    setInterval(updateStats, 300000); // Update every 5 minutes
}

function updateStats() {
    // Fetch and update product statistics
    const stats = {
        totalProducts: 26,
        lowStock: 5,
        topSelling: 'Black Velvet Set',
        revenue: '₹7,49,999'
    };
    
    // Update DOM elements
    document.querySelectorAll('[data-stat]').forEach(element => {
        const stat = element.getAttribute('data-stat');
        if (stats[stat]) {
            element.textContent = stats[stat];
        }
    });
}

// Initialize Product Form
function initializeProductForm() {
    const form = document.querySelector('#productForm');
    if (!form) return;

    // Image upload preview
    const imageUpload = form.querySelector('input[type="file"]');
    const previewContainer = document.createElement('div');
    previewContainer.className = 'grid grid-cols-3 gap-2 mt-2';
    imageUpload.parentNode.appendChild(previewContainer);

    imageUpload.addEventListener('change', (e) => {
        previewContainer.innerHTML = '';
        [...e.target.files].forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('img');
                preview.src = e.target.result;
                preview.className = 'w-full h-24 object-cover rounded';
                previewContainer.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        try {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            showNotification('Product added successfully!', 'success');
            form.reset();
            previewContainer.innerHTML = '';
        } catch (error) {
            showNotification('Failed to add product. Please try again.', 'error');
        }
    });
}

// Initialize Category Management
function initializeCategoryManagement() {
    const categoryList = document.querySelector('#categoryList');
    if (!categoryList) return;

    // Category actions
    categoryList.addEventListener('click', async (e) => {
        const action = e.target.closest('button')?.getAttribute('data-action');
        const category = e.target.closest('[data-category]')?.getAttribute('data-category');

        if (!action || !category) return;

        switch (action) {
            case 'edit':
                // Show edit modal
                break;
            case 'delete':
                if (confirm('Are you sure you want to delete this category?')) {
                    try {
                        // Simulated API call
                        await new Promise(resolve => setTimeout(resolve, 500));
                        showNotification('Category deleted successfully!', 'success');
                    } catch (error) {
                        showNotification('Failed to delete category.', 'error');
                    }
                }
                break;
        }
    });
}

// Initialize Bulk Actions
function initializeBulkActions() {
    const bulkActions = document.querySelector('#bulkActions');
    if (!bulkActions) return;

    bulkActions.addEventListener('click', async (e) => {
        const action = e.target.closest('button')?.getAttribute('data-action');
        if (!action) return;

        switch (action) {
            case 'import':
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv';
                input.click();
                input.addEventListener('change', handleImport);
                break;
            case 'export':
                await handleExport();
                break;
            case 'bulkPrice':
                showBulkPriceModal();
                break;
            case 'bulkStock':
                showBulkStockModal();
                break;
        }
    });
}

// Initialize Product Analytics
function initializeProductAnalytics() {
    const analyticsContainer = document.querySelector('#productAnalytics');
    if (!analyticsContainer) return;

    // Update analytics periodically
    updateAnalytics();
    setInterval(updateAnalytics, 300000); // Update every 5 minutes
}

function updateAnalytics() {
    // Fetch and update analytics data
    const data = {
        topProducts: [
            { name: 'Black Velvet Coord Set', sales: 142, percentage: 85 },
            { name: 'Pink Anarkali Set', sales: 98, percentage: 65 },
            { name: 'Blue Sequence Set', sales: 76, percentage: 45 }
        ]
    };

    // Update charts and metrics
    updateAnalyticsCharts(data);
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
    // Update product performance charts
    data.topProducts.forEach((product, index) => {
        const chart = document.querySelector(`[data-chart="product-${index + 1}"]`);
        if (chart) {
            chart.querySelector('.progress-bar').style.width = `${product.percentage}%`;
            chart.querySelector('.product-name').textContent = product.name;
            chart.querySelector('.product-sales').textContent = `${product.sales} sold`;
        }
    });
}

// Export module
export {
    initializeProductStats,
    initializeProductForm,
    initializeCategoryManagement,
    initializeBulkActions,
    initializeProductAnalytics
};
