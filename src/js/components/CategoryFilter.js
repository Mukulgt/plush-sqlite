class CategoryFilter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.fetchCategories();
    }

    async fetchCategories() {
        try {
            const response = await fetch('/api/categories');
            const categories = await response.json();
            this.renderCategories(categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 1rem 0;
                }
                
                .filter-section {
                    background: var(--background);
                    border-radius: var(--radius-md);
                    padding: 1rem;
                    box-shadow: var(--shadow-sm);
                }
                
                h3 {
                    font-family: var(--font-primary);
                    color: var(--text-primary);
                    margin-top: 0;
                    margin-bottom: 1rem;
                }
                
                .categories {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                
                .category {
                    display: flex;
                    align-items: center;
                    padding: 0.5rem;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .category:hover {
                    background: var(--surface);
                }
                
                .category.active {
                    background: var(--primary);
                    color: white;
                }
                
                .category-count {
                    margin-left: auto;
                    font-size: 0.9rem;
                    color: var(--text-light);
                }
                
                .active .category-count {
                    color: white;
                }
                
                .price-range {
                    margin-top: 1rem;
                }
                
                input[type="range"] {
                    width: 100%;
                    margin: 0.5rem 0;
                }
                
                .price-inputs {
                    display: flex;
                    gap: 1rem;
                    margin-top: 0.5rem;
                }
                
                input[type="number"] {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-sm);
                }
                
                .filter-group {
                    margin-top: 1.5rem;
                }
                
                .color-options {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                
                .color-option {
                    width: 2rem;
                    height: 2rem;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid var(--border);
                    transition: all 0.3s ease;
                }
                
                .color-option.active {
                    transform: scale(1.1);
                    border-color: var(--primary);
                }
                
                .size-options {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                
                .size-option {
                    padding: 0.5rem 1rem;
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
            </style>
            
            <div class="filter-section">
                <h3>Categories</h3>
                <div class="categories"></div>
                
                <div class="filter-group">
                    <h3>Price Range</h3>
                    <div class="price-range">
                        <input type="range" min="0" max="10000" step="100">
                        <div class="price-inputs">
                            <input type="number" placeholder="Min" min="0">
                            <input type="number" placeholder="Max" min="0">
                        </div>
                    </div>
                </div>
                
                <div class="filter-group">
                    <h3>Colors</h3>
                    <div class="color-options">
                        <div class="color-option" style="background: #000000" data-color="black"></div>
                        <div class="color-option" style="background: #FFFFFF" data-color="white"></div>
                        <div class="color-option" style="background: #FF0000" data-color="red"></div>
                        <div class="color-option" style="background: #0000FF" data-color="blue"></div>
                        <div class="color-option" style="background: #FFD700" data-color="gold"></div>
                    </div>
                </div>
                
                <div class="filter-group">
                    <h3>Sizes</h3>
                    <div class="size-options">
                        <div class="size-option">XS</div>
                        <div class="size-option">S</div>
                        <div class="size-option">M</div>
                        <div class="size-option">L</div>
                        <div class="size-option">XL</div>
                    </div>
                </div>
            </div>
        `;

        this.addEventListeners();
    }

    renderCategories(categories) {
        const container = this.shadowRoot.querySelector('.categories');
        container.innerHTML = categories.map(category => `
            <div class="category" data-id="${category.id}">
                ${category.name}
                <span class="category-count">(${category.count || 0})</span>
            </div>
        `).join('');
    }

    addEventListeners() {
        // Category selection
        this.shadowRoot.querySelectorAll('.category').forEach(category => {
            category.addEventListener('click', () => {
                category.classList.toggle('active');
                this.dispatchFilterEvent();
            });
        });

        // Price range
        const rangeInput = this.shadowRoot.querySelector('input[type="range"]');
        const minInput = this.shadowRoot.querySelector('input[placeholder="Min"]');
        const maxInput = this.shadowRoot.querySelector('input[placeholder="Max"]');

        [rangeInput, minInput, maxInput].forEach(input => {
            input.addEventListener('change', () => this.dispatchFilterEvent());
        });

        // Color selection
        this.shadowRoot.querySelectorAll('.color-option').forEach(color => {
            color.addEventListener('click', () => {
                color.classList.toggle('active');
                this.dispatchFilterEvent();
            });
        });

        // Size selection
        this.shadowRoot.querySelectorAll('.size-option').forEach(size => {
            size.addEventListener('click', () => {
                size.classList.toggle('active');
                this.dispatchFilterEvent();
            });
        });
    }

    dispatchFilterEvent() {
        const activeCategories = Array.from(this.shadowRoot.querySelectorAll('.category.active'))
            .map(cat => cat.dataset.id);

        const activeColors = Array.from(this.shadowRoot.querySelectorAll('.color-option.active'))
            .map(color => color.dataset.color);

        const activeSizes = Array.from(this.shadowRoot.querySelectorAll('.size-option.active'))
            .map(size => size.textContent);

        const minPrice = this.shadowRoot.querySelector('input[placeholder="Min"]').value;
        const maxPrice = this.shadowRoot.querySelector('input[placeholder="Max"]').value;

        this.dispatchEvent(new CustomEvent('filter-change', {
            bubbles: true,
            composed: true,
            detail: {
                categories: activeCategories,
                colors: activeColors,
                sizes: activeSizes,
                priceRange: {
                    min: minPrice || 0,
                    max: maxPrice || null
                }
            }
        }));
    }
}

customElements.define('category-filter', CategoryFilter);
