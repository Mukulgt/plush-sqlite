const fs = require('fs');
const path = require('path');

// Get list of available product images
const productsDir = path.join(__dirname, '../src/images/products');
const availableImages = fs.readdirSync(productsDir)
    .filter(file => file.endsWith('.webp'))
    .map(file => `images/products/${file}`);

// Get a random image, optionally filtered by keyword
function getRandomImage(keyword = '') {
    const filtered = keyword 
        ? availableImages.filter(img => img.toLowerCase().includes(keyword.toLowerCase()))
        : availableImages;
    return filtered[Math.floor(Math.random() * filtered.length)] || availableImages[0];
}

// Template for hero sections
const heroTemplate = `
    <div class="relative h-[400px] overflow-hidden">
        <img src="IMAGE_SRC" alt="Hero Image" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="text-center text-white">
                CONTENT
            </div>
        </div>
    </div>`;

// Update specific pages
const pageUpdates = {
    'blog.html': (content) => {
        return content.replace(
            /<section class="blog-hero[^>]*>[\s\S]*?<\/section>/,
            heroTemplate
                .replace('IMAGE_SRC', getRandomImage('coord'))
                .replace('CONTENT', `
                    <h1 class="text-4xl font-bold mb-4">Plushoff Blog</h1>
                    <p class="text-xl">Discover the Latest in Luxury Fashion</p>`)
        );
    },
    'contact.html': (content) => {
        return content.replace(
            /<section class="contact-hero[^>]*>[\s\S]*?<\/section>/,
            heroTemplate
                .replace('IMAGE_SRC', getRandomImage('anarkali'))
                .replace('CONTENT', `
                    <h1 class="text-4xl font-bold mb-4">Contact Us</h1>
                    <p class="text-xl">We're Here to Help You</p>`)
        );
    },
    'faq.html': (content) => {
        return content.replace(
            /<section class="faq-hero[^>]*>[\s\S]*?<\/section>/,
            heroTemplate
                .replace('IMAGE_SRC', getRandomImage('suit'))
                .replace('CONTENT', `
                    <h1 class="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
                    <p class="text-xl">Find Answers to Your Questions</p>`)
        );
    },
    'products.html': (content) => {
        let updated = content.replace(
            /<section class="products-hero[^>]*>[\s\S]*?<\/section>/,
            heroTemplate
                .replace('IMAGE_SRC', getRandomImage('velvet'))
                .replace('CONTENT', `
                    <h1 class="text-4xl font-bold mb-4">Our Collections</h1>
                    <p class="text-xl">Discover Luxury Fashion</p>`)
        );

        // Replace product grid images
        const productTemplate = `
            <div class="product-card">
                <img src="IMAGE_SRC" alt="TITLE" class="w-full h-96 object-cover rounded-lg">
                <h3 class="text-xl font-semibold mt-4">TITLE</h3>
                <p class="text-gray-600">₹PRICE</p>
            </div>`;

        let productGrid = '';
        for (let i = 0; i < 9; i++) {
            const img = getRandomImage();
            const title = img.split('/').pop().replace('.webp', '').split('-').join(' ');
            const price = Math.floor(Math.random() * (25000 - 8000) + 8000);
            productGrid += productTemplate
                .replace('IMAGE_SRC', img)
                .replace(/TITLE/g, title)
                .replace('PRICE', price.toLocaleString('en-IN'));
        }

        updated = updated.replace(
            /<div class="grid[^>]*>[\s\S]*?<\/div>/,
            `<div class="grid grid-cols-1 md:grid-cols-3 gap-8">${productGrid}</div>`
        );

        return updated;
    }
};

// Process all HTML files
const srcDir = path.join(__dirname, '../src');
fs.readdirSync(srcDir).forEach(file => {
    if (file.endsWith('.html')) {
        const filePath = path.join(srcDir, file);
        console.log(`Processing ${file}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Apply specific updates if available
        if (pageUpdates[file]) {
            content = pageUpdates[file](content);
        }
        
        // Replace any remaining images
        content = content.replace(
            /<img[^>]+src=["'](?!images\/products)[^"']+["'][^>]*>/g,
            match => match.replace(/src=["'][^"']+["']/, `src="${getRandomImage()}"`)
        );
        
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
});

console.log('All pages have been updated with product images');
