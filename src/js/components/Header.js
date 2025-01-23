class Header extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    background: var(--background);
                    box-shadow: var(--shadow-sm);
                }
                
                .header {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .logo {
                    font-family: var(--font-primary);
                    font-size: 1.5rem;
                    color: var(--primary);
                    text-decoration: none;
                    font-weight: bold;
                }
                
                nav {
                    display: flex;
                    gap: 2rem;
                    align-items: center;
                }
                
                .nav-link {
                    color: var(--text-secondary);
                    text-decoration: none;
                    font-family: var(--font-secondary);
                    transition: color 0.3s ease;
                    position: relative;
                }
                
                .nav-link:hover {
                    color: var(--primary);
                }
                
                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: var(--primary);
                    transform: scaleX(0);
                    transition: transform 0.3s ease;
                }
                
                .nav-link:hover::after {
                    transform: scaleX(1);
                }
                
                .actions {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }
                
                .icon-button {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 1.25rem;
                    cursor: pointer;
                    position: relative;
                    padding: 0.5rem;
                    transition: color 0.3s ease;
                }
                
                .icon-button:hover {
                    color: var(--primary);
                }
                
                .badge {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: var(--primary);
                    color: white;
                    font-size: 0.75rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 1rem;
                    transform: translate(50%, -50%);
                }
                
                .search-container {
                    position: relative;
                    margin-right: 1rem;
                }
                
                .search-input {
                    padding: 0.5rem 1rem;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-sm);
                    font-family: var(--font-secondary);
                    width: 200px;
                    transition: all 0.3s ease;
                }
                
                .search-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    width: 300px;
                }
                
                .search-button {
                    position: absolute;
                    right: 0.5rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: var(--text-light);
                    cursor: pointer;
                }
                
                @media (max-width: 768px) {
                    nav {
                        display: none;
                    }
                    
                    .menu-button {
                        display: block;
                    }
                }
            </style>
            
            <header class="header">
                <a href="/" class="logo">Plushoff</a>
                
                <nav>
                    <a href="/new-arrivals" class="nav-link">New Arrivals</a>
                    <a href="/categories" class="nav-link">Categories</a>
                    <a href="/sale" class="nav-link">Sale</a>
                    <a href="/collections" class="nav-link">Collections</a>
                </nav>
                
                <div class="actions">
                    <div class="search-container">
                        <input type="text" class="search-input" placeholder="Search...">
                        <button class="search-button">🔍</button>
                    </div>
                    
                    <button class="icon-button">
                        ♥
                        <span class="badge wishlist-count">0</span>
                    </button>
                    
                    <button class="icon-button">
                        🛒
                        <span class="badge cart-count">0</span>
                    </button>
                    
                    <button class="icon-button">👤</button>
                </div>
            </header>
        `;

        this.addEventListeners();
    }

    addEventListeners() {
        const searchInput = this.shadowRoot.querySelector('.search-input');
        const searchButton = this.shadowRoot.querySelector('.search-button');
        const wishlistButton = this.shadowRoot.querySelector('.icon-button:nth-of-type(1)');
        const cartButton = this.shadowRoot.querySelector('.icon-button:nth-of-type(2)');
        const profileButton = this.shadowRoot.querySelector('.icon-button:nth-of-type(3)');

        searchButton.addEventListener('click', () => this.handleSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        wishlistButton.addEventListener('click', () => this.dispatchEvent(new CustomEvent('toggle-wishlist')));
        cartButton.addEventListener('click', () => this.dispatchEvent(new CustomEvent('toggle-cart')));
        profileButton.addEventListener('click', () => this.dispatchEvent(new CustomEvent('toggle-profile')));
    }

    handleSearch() {
        const searchTerm = this.shadowRoot.querySelector('.search-input').value;
        if (searchTerm.trim()) {
            this.dispatchEvent(new CustomEvent('search', {
                detail: { searchTerm }
            }));
        }
    }

    updateCartCount(count) {
        this.shadowRoot.querySelector('.cart-count').textContent = count;
    }

    updateWishlistCount(count) {
        this.shadowRoot.querySelector('.wishlist-count').textContent = count;
    }
}

customElements.define('site-header', Header);
