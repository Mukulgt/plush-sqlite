import { removeFromCart, updateQuantity, showToast } from './main';

const SHIPPING_THRESHOLD = 50; // Free shipping for orders over $50
const SHIPPING_COST = 5.99;

function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    
    if (!cartItems) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-5">
                <h4>Your cart is empty</h4>
                <p>Browse our products and add some items to your cart!</p>
                <a href="products.html" class="btn btn-primary">View Products</a>
            </div>
        `;
        subtotalElement.textContent = '$0.00';
        shippingElement.textContent = '$0.00';
        totalElement.textContent = '$0.00';
        return;
    }

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;

    cartItems.innerHTML = cart.map(item => `
        <div class="card mb-3 cart-item">
            <div class="row g-0">
                <div class="col-md-2">
                    <img src="${item.image}" class="img-fluid rounded-start" alt="${item.name}">
                </div>
                <div class="col-md-10">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="card-title">${item.name}</h5>
                            <button onclick="removeFromCart('${item.id}')" class="btn btn-sm btn-outline-danger">
                                Remove
                            </button>
                        </div>
                        <p class="card-text">Price: $${item.price.toFixed(2)}</p>
                        <div class="d-flex align-items-center">
                            <label class="me-2">Quantity:</label>
                            <input type="number" 
                                   class="form-control form-control-sm" 
                                   style="width: 70px"
                                   value="${item.quantity}"
                                   min="1"
                                   onchange="updateQuantity('${item.id}', this.value)">
                        </div>
                        <p class="card-text mt-2">
                            <strong>Subtotal: $${(item.price * item.quantity).toFixed(2)}</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    shippingElement.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    // Check if user is logged in
    const isLoggedIn = false; // This should be replaced with actual authentication check
    
    if (!isLoggedIn) {
        window.location.href = 'login.html?redirect=checkout';
    } else {
        window.location.href = 'checkout.html';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayCart();
});
