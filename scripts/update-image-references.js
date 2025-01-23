const fs = require('fs');
const path = require('path');

// Get list of available product images
const productsDir = path.join(__dirname, '../src/images/products');
const availableImages = fs.readdirSync(productsDir)
    .filter(file => file.endsWith('.webp'))
    .map(file => `images/products/${file}`);

// Helper function to get a random image from available images
function getRandomImage() {
    return availableImages[Math.floor(Math.random() * availableImages.length)];
}

// Function to update HTML content
function updateHtmlContent(content) {
    // Replace image sources in img tags
    let updatedContent = content.replace(
        /<img[^>]+src=["']([^"']+)["'][^>]*>/g,
        (match, src) => {
            if (src.includes('products/')) return match; // Skip if already a product image
            return match.replace(src, getRandomImage());
        }
    );

    // Replace background images in style attributes
    updatedContent = updatedContent.replace(
        /background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/g,
        (match, src) => {
            if (src.includes('products/')) return match;
            return `background-image: url('${getRandomImage()}')`;
        }
    );

    return updatedContent;
}

// Update all HTML files in src directory
function updateFiles(directory) {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            updateFiles(filePath);
        } else if (file.endsWith('.html') || file.endsWith('.css')) {
            console.log(`Processing ${file}...`);
            const content = fs.readFileSync(filePath, 'utf8');
            const updatedContent = updateHtmlContent(content);
            fs.writeFileSync(filePath, updatedContent);
            console.log(`Updated ${file}`);
        }
    });
}

// Start processing from src directory
const srcDir = path.join(__dirname, '../src');
updateFiles(srcDir);
console.log('All image references have been updated to use product images');
