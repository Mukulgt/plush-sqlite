const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../src/images/products');
const outputDir = path.join(__dirname, '../src/images/products-optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Get all image files from input directory
const imageFiles = fs.readdirSync(inputDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
});

// Process each image
async function optimizeImages() {
    console.log(`Found ${imageFiles.length} images to optimize...`);
    
    for (const file of imageFiles) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, `${path.parse(file).name}.webp`);
        
        try {
            await sharp(inputPath)
                .resize(800, 1200, { // Set maximum dimensions while maintaining aspect ratio
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ // Convert to WebP format with quality setting
                    quality: 80
                })
                .toFile(outputPath);
            
            const inputStats = fs.statSync(inputPath);
            const outputStats = fs.statSync(outputPath);
            const savedSize = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(2);
            
            console.log(`✓ ${file}: Reduced by ${savedSize}%`);
        } catch (error) {
            console.error(`✗ Error processing ${file}:`, error.message);
        }
    }
}

optimizeImages().then(() => {
    console.log('\nImage optimization complete! Optimized images are in the products-optimized folder.');
    console.log('Please review the optimized images and if they look good, you can replace the originals.');
});
