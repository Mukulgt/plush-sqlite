class CartSidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 0;
                    right: 0;
                    width: 400px;
                    height: 100vh;
                    background: var(--background);
                    box-shadow: var(--shadow-lg);
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    z-index: 1000;
                }
                
                :host(.open) {
                    transform: translateX(0);
                }
                
                .overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.5);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }
                
                :host(.open) .overlay {
                    opacity: 1;
                    visibility: visible;
                }
                
                .cart-content {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                .cart-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .cart-header h2 {
                    font-family: var(--font-primary);
                    margin: 0;
                }
                
                .close-button {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--text-primary);
                }
                
                .cart-items {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                }
                
                .cart-item {
                    display: grid;
                    grid-template-columns: 80px 1fr auto;
                    gap: 1rem;
                    padding: 1rem 0;
                    border-bottom: 1px solid var(--border);
                }
                
                .cart-item img {
                    width: 80px;
                    height: 100px;
                    object-fit: cover;
                    border-radius: var(--radius-sm);
                }
                
                .item-details h3 {
                    font-family: var(--font-primary);
                    margin: 0 0 0.5rem 0;
                    font-size: 1rem;
                }
                
                .item-price {
                    color: var(--primary);
                    font-weight: bold;
                }
                
                .quantity-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }
                
                .quantity-button {
                    background: var(--surface);
                    border: none;
                    width: 24px;
                    height: 24px;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .remove-button {
                    color: var(--error);
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem;
                }
                
                .cart-footer {
                    padding: 1.5rem;
                    border-top: 1px solid var(--border);
                    background: var(--surface);
                }
                
                .cart-total {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                    font-family: var(--font-primary);
                }
                
                .checkout-button {
                    width: 100%;
                    padding: 1rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: var(--radius-sm);
                    font-family: var(--font-secondary);
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.3s ease;
                }
                
                .checkout-button:hover {
                    background: var(--primary-dark);
                }
                
                .empty-cart {
                    text-align: center;
                    padding: 2rem;
                    color: var(--text-light);
                }
                
                @media (max-width: 480px) {
                    :host {
                        width: 100%;
                    }
                }
            </style>
            
            <div class="overlay"></div>
            <div class="cart-content">
                <div class="cart-header">
                    <h2>Shopping Cart</h2>
                    <button class="close-button">×</button>
                </div>
                
                <div class="cart-items">
                    <div class="empty-cart">
                        <p>Your cart is empty</p>
                    </div>
                </div>
                
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total</span>
                        <span class="total-amount">₹0</span>
                    </div>
                    <button class="checkout-button">Proceed to Checkout</button>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        const closeButton = this.shadowRoot.querySelector('.close-button');
        const overlay = this.shadowRoot.querySelector('.overlay');
        const checkoutButton = this.shadowRoot.querySelector('.checkout-button');

        closeButton.addEventListener('click', () => this.close());
        overlay.addEventListener('click', () => this.close());
        checkoutButton.addEventListener('click', () => this.checkout());
    }

    open() {
        this.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.classList.remove('open');
        document.body.style.overflow = '';
    }

    updateCart(items) {
        const cartItems = this.shadowRoot.querySelector('.cart-items');
        const totalAmount = this.shadowRoot.querySelector('.total-amount');
        
        if (items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty</p>
                </div>
            `;
            totalAmount.textContent = '₹0';
            return;
        }

        cartItems.innerHTML = items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <div class="item-price">₹${item.price}</div>
                    <div class="quantity-controls">
                        <button class="quantity-button decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-button increase">+</button>
                    </div>
                </div>
                <button class="remove-button">×</button>
            </div>
        `).join('');

        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalAmount.textContent = `₹${total.toFixed(2)}`;

        // Add event listeners for quantity controls
        cartItems.querySelectorAll('.cart-item').forEach(item => {
            const id = item.dataset.id;
            const decreaseBtn = item.querySelector('.decrease');
            const increaseBtn = item.querySelector('.increase');
            const removeBtn = item.querySelector('.remove-button');

            decreaseBtn.addEventListener('click', () => this.updateQuantity(id, 'decrease'));
            increaseBtn.addEventListener('click', () => this.updateQuantity(id, 'increase'));
            removeBtn.addEventListener('click', () => this.removeItem(id));
        });
    }

    updateQuantity(id, action) {
        this.dispatchEvent(new CustomEvent('update-quantity', {
            detail: { id, action }
        }));
    }

    removeItem(id) {
        this.dispatchEvent(new CustomEvent('remove-item', {
            detail: { id }
        }));
    }

    checkout() {
        this.dispatchEvent(new CustomEvent('checkout'));
    }
}

customElements.define('cart-sidebar', CartSidebar);
