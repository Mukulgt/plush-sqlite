class QuickView extends HTMLElement {
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
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }
                
                :host(.open) {
                    opacity: 1;
                    visibility: visible;
                }
                
                .overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                }
                
                .modal {
                    position: relative;
                    width: 90%;
                    max-width: 1000px;
                    background: var(--background);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    transform: translateY(20px);
                    opacity: 0;
                    transition: all 0.3s ease;
                }
                
                :host(.open) .modal {
                    transform: translateY(0);
                    opacity: 1;
                }
                
                .close-button {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: var(--text-primary);
                    cursor: pointer;
                    z-index: 1;
                }
                
                .product-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    min-height: 500px;
                }
                
                .product-gallery {
                    position: relative;
                    background: var(--surface);
                }
                
                .main-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .thumbnail-list {
                    position: absolute;
                    bottom: 1rem;
                    left: 1rem;
                    right: 1rem;
                    display: flex;
                    gap: 0.5rem;
                    justify-content: center;
                }
                
                .thumbnail {
                    width: 60px;
                    height: 60px;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.3s ease;
                }
                
                .thumbnail.active {
                    border-color: var(--primary);
                }
                
                .product-info {
                    padding: 2rem;
                }
                
                .product-name {
                    font-family: var(--font-primary);
                    font-size: 1.5rem;
                    margin: 0 0 1rem;
                }
                
                .product-price {
                    font-size: 1.25rem;
                    color: var(--primary);
                    font-weight: bold;
                    margin-bottom: 1rem;
                }
                
                .sale-price {
                    color: var(--error);
                    margin-right: 0.5rem;
                }
                
                .original-price {
                    text-decoration: line-through;
                    color: var(--text-light);
                }
                
                .product-description {
                    color: var(--text-secondary);
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }
                
                .product-options {
                    margin-bottom: 2rem;
                }
                
                .option-label {
                    display: block;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }
                
                .size-options {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                
                .size-option {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .size-option.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
                
                .color-options {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                
                .color-option {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid var(--border);
                    transition: all 0.3s ease;
                }
                
                .color-option.active {
                    transform: scale(1.1);
                    border-color: var(--primary);
                }
                
                .quantity-selector {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                
                .quantity-button {
                    width: 36px;
                    height: 36px;
                    border: 1px solid var(--border);
                    background: none;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .quantity-button:hover {
                    background: var(--surface);
                }
                
                .quantity-display {
                    width: 50px;
                    text-align: center;
                }
                
                .action-buttons {
                    display: flex;
                    gap: 1rem;
                }
                
                .add-to-cart {
                    flex: 1;
                    padding: 1rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    transition: background 0.3s ease;
                }
                
                .add-to-cart:hover {
                    background: var(--primary-dark);
                }
                
                .wishlist-button {
                    width: 48px;
                    height: 48px;
                    border: 1px solid var(--primary);
                    background: none;
                    color: var(--primary);
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .wishlist-button:hover {
                    background: var(--primary);
                    color: white;
                }
                
                @media (max-width: 768px) {
                    .product-content {
                        grid-template-columns: 1fr;
                    }
                    
                    .product-gallery {
                        min-height: 300px;
                    }
                }
            </style>
            
            <div class="overlay"></div>
            <div class="modal">
                <button class="close-button">×</button>
                <div class="product-content">
                    <div class="product-gallery">
                        <img class="main-image" src="" alt="">
                        <div class="thumbnail-list"></div>
                    </div>
                    
                    <div class="product-info">
                        <h2 class="product-name"></h2>
                        <div class="product-price"></div>
                        <p class="product-description"></p>
                        
                        <div class="product-options">
                            <label class="option-label">Size</label>
                            <div class="size-options">
                                <div class="size-option" data-size="XS">XS</div>
                                <div class="size-option" data-size="S">S</div>
                                <div class="size-option" data-size="M">M</div>
                                <div class="size-option" data-size="L">L</div>
                                <div class="size-option" data-size="XL">XL</div>
                            </div>
                            
                            <label class="option-label">Color</label>
                            <div class="color-options"></div>
                        </div>
                        
                        <div class="quantity-selector">
                            <button class="quantity-button decrease">-</button>
                            <span class="quantity-display">1</span>
                            <button class="quantity-button increase">+</button>
                        </div>
                        
                        <div class="action-buttons">
                            <button class="add-to-cart">Add to Cart</button>
                            <button class="wishlist-button">♥</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        const closeButton = this.shadowRoot.querySelector('.close-button');
        const overlay = this.shadowRoot.querySelector('.overlay');
        const decreaseBtn = this.shadowRoot.querySelector('.decrease');
        const increaseBtn = this.shadowRoot.querySelector('.increase');
        const addToCartBtn = this.shadowRoot.querySelector('.add-to-cart');
        const wishlistBtn = this.shadowRoot.querySelector('.wishlist-button');
        const sizeOptions = this.shadowRoot.querySelectorAll('.size-option');

        closeButton.addEventListener('click', () => this.close());
        overlay.addEventListener('click', () => this.close());
        
        decreaseBtn.addEventListener('click', () => this.updateQuantity('decrease'));
        increaseBtn.addEventListener('click', () => this.updateQuantity('increase'));
        
        addToCartBtn.addEventListener('click', () => this.addToCart());
        wishlistBtn.addEventListener('click', () => this.toggleWishlist());
        
        sizeOptions.forEach(option => {
            option.addEventListener('click', () => this.selectSize(option));
        });
    }

    open(product) {
        this.product = product;
        this.updateUI();
        this.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.classList.remove('open');
        document.body.style.overflow = '';
    }

    updateUI() {
        const {
            name,
            price,
            salePrice,
            description,
            images,
            colors
        } = this.product;

        this.shadowRoot.querySelector('.product-name').textContent = name;
        
        const priceElement = this.shadowRoot.querySelector('.product-price');
        if (salePrice) {
            priceElement.innerHTML = `
                <span class="sale-price">₹${salePrice}</span>
                <span class="original-price">₹${price}</span>
            `;
        } else {
            priceElement.innerHTML = `₹${price}`;
        }

        this.shadowRoot.querySelector('.product-description').textContent = description;
        this.shadowRoot.querySelector('.main-image').src = images[0];

        // Update thumbnails
        const thumbnailList = this.shadowRoot.querySelector('.thumbnail-list');
        thumbnailList.innerHTML = images.map((image, index) => `
            <img src="${image}" 
                alt="Product thumbnail" 
                class="thumbnail ${index === 0 ? 'active' : ''}"
                onclick="this.getRootNode().host.setMainImage('${image}', this)">
        `).join('');

        // Update color options
        const colorOptions = this.shadowRoot.querySelector('.color-options');
        colorOptions.innerHTML = colors.map(color => `
            <div class="color-option" 
                style="background-color: ${color}"
                onclick="this.getRootNode().host.selectColor('${color}', this)">
            </div>
        `).join('');
    }

    setMainImage(src, thumbnail) {
        this.shadowRoot.querySelector('.main-image').src = src;
        this.shadowRoot.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
    }

    selectColor(color, element) {
        this.shadowRoot.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
        element.classList.add('active');
        this.selectedColor = color;
    }

    selectSize(element) {
        this.shadowRoot.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('active'));
        element.classList.add('active');
        this.selectedSize = element.dataset.size;
    }

    updateQuantity(action) {
        const quantityDisplay = this.shadowRoot.querySelector('.quantity-display');
        let quantity = parseInt(quantityDisplay.textContent);

        if (action === 'increase') {
            quantity = Math.min(quantity + 1, 10);
        } else {
            quantity = Math.max(quantity - 1, 1);
        }

        quantityDisplay.textContent = quantity;
    }

    addToCart() {
        const quantity = parseInt(this.shadowRoot.querySelector('.quantity-display').textContent);
        
        if (!this.selectedSize) {
            alert('Please select a size');
            return;
        }
        
        if (!this.selectedColor) {
            alert('Please select a color');
            return;
        }

        this.dispatchEvent(new CustomEvent('add-to-cart', {
            detail: {
                ...this.product,
                quantity,
                selectedSize: this.selectedSize,
                selectedColor: this.selectedColor
            }
        }));

        this.close();
    }

    toggleWishlist() {
        const wishlistButton = this.shadowRoot.querySelector('.wishlist-button');
        wishlistButton.classList.toggle('active');
        
        this.dispatchEvent(new CustomEvent('toggle-wishlist', {
            detail: this.product
        }));
    }
}

customElements.define('quick-view', QuickView);
