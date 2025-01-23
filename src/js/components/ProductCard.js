class ProductCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['name', 'price', 'image', 'sale-price', 'is-new', 'is-featured'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const name = this.getAttribute('name');
        const price = this.getAttribute('price');
        const salePrice = this.getAttribute('sale-price');
        const image = this.getAttribute('image');
        const isNew = this.hasAttribute('is-new');
        const isFeatured = this.hasAttribute('is-featured');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 1rem;
                    position: relative;
                }
                
                .card {
                    background: var(--background);
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-sm);
                    transition: all 0.3s ease;
                    overflow: hidden;
                }
                
                .card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-md);
                }
                
                .image-container {
                    position: relative;
                    padding-top: 125%;
                }
                
                img {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .content {
                    padding: 1rem;
                }
                
                .name {
                    font-family: var(--font-primary);
                    font-size: 1.1rem;
                    margin: 0;
                    color: var(--text-primary);
                }
                
                .price {
                    font-family: var(--font-secondary);
                    color: var(--primary);
                    font-weight: bold;
                    margin-top: 0.5rem;
                }
                
                .sale-price {
                    color: var(--error);
                }
                
                .original-price {
                    text-decoration: line-through;
                    color: var(--text-light);
                    margin-left: 0.5rem;
                }
                
                .badge {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: var(--radius-sm);
                    font-size: 0.8rem;
                    font-weight: bold;
                    z-index: 1;
                }
                
                .new {
                    background: var(--primary);
                    color: white;
                }
                
                .featured {
                    background: var(--accent);
                    color: var(--text-primary);
                }
                
                .actions {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }
                
                button {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                button:hover {
                    background: var(--primary-dark);
                }
                
                .wishlist {
                    background: transparent;
                    border: 1px solid var(--primary);
                    color: var(--primary);
                }
                
                .wishlist:hover {
                    background: var(--primary);
                    color: white;
                }
            </style>
            
            <div class="card">
                ${isNew ? '<span class="badge new">New</span>' : ''}
                ${isFeatured ? '<span class="badge featured">Featured</span>' : ''}
                
                <div class="image-container">
                    <img src="${image}" alt="${name}">
                </div>
                
                <div class="content">
                    <h3 class="name">${name}</h3>
                    <div class="price">
                        ${salePrice ? `
                            <span class="sale-price">₹${salePrice}</span>
                            <span class="original-price">₹${price}</span>
                        ` : `
                            <span>₹${price}</span>
                        `}
                    </div>
                    
                    <div class="actions">
                        <button class="add-to-cart">Add to Cart</button>
                        <button class="wishlist">♥</button>
                    </div>
                </div>
            </div>
        `;

        this.addEventListeners();
    }

    addEventListeners() {
        const addToCartBtn = this.shadowRoot.querySelector('.add-to-cart');
        const wishlistBtn = this.shadowRoot.querySelector('.wishlist');

        addToCartBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('add-to-cart', {
                bubbles: true,
                composed: true,
                detail: {
                    name: this.getAttribute('name'),
                    price: this.getAttribute('price'),
                    image: this.getAttribute('image')
                }
            }));
        });

        wishlistBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('toggle-wishlist', {
                bubbles: true,
                composed: true,
                detail: {
                    name: this.getAttribute('name'),
                    price: this.getAttribute('price'),
                    image: this.getAttribute('image')
                }
            }));
        });
    }
}

customElements.define('product-card', ProductCard);
