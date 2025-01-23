const fs = require('fs');
const path = require('path');

// Read the image mapping
const imageMapping = require('./image-mapping.json');

// Function to update HTML content
function updateHtmlContent(content) {
    let updatedContent = content;
    Object.entries(imageMapping).forEach(([oldFile, newFile]) => {
        const regex = new RegExp(oldFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        updatedContent = updatedContent.replace(regex, newFile);
    });
    return updatedContent;
}

// Update all HTML files in src directory
function updateHtmlFiles(directory) {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            updateHtmlFiles(filePath); // Recursively process subdirectories
        } else if (path.extname(file).toLowerCase() === '.html') {
            console.log(`Processing ${file}...`);
            const content = fs.readFileSync(filePath, 'utf8');
            const updatedContent = updateHtmlContent(content);
            
            // Add picture element for better browser support
            const finalContent = updatedContent.replace(
                /<img([^>]*)src="([^"]*\.webp)"([^>]*)>/g,
                (match, before, src, after) => {
                    const oldSrc = src.replace('.webp', path.extname(Object.keys(imageMapping).find(key => imageMapping[key] === path.basename(src))));
                    return `<picture>
    <source srcset="${src}" type="image/webp">
    <img${before}src="${oldSrc}"${after}>
</picture>`;
                }
            );
            
            fs.writeFileSync(filePath, finalContent);
            console.log(`Updated ${file}`);
        }
    });
}

// Start processing from src directory
const srcDir = path.join(__dirname, '../src');
updateHtmlFiles(srcDir);
console.log('All HTML files have been updated to use WebP images with fallback support');
