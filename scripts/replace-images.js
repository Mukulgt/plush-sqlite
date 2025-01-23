const fs = require('fs');
const path = require('path');

const optimizedDir = path.join(__dirname, '../src/images/products-optimized');
const productsDir = path.join(__dirname, '../src/images/products');

// Create backup of original images
const backupDir = path.join(__dirname, '../src/images/products-backup');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    
    // Move original files to backup
    const originalFiles = fs.readdirSync(productsDir);
    originalFiles.forEach(file => {
        const sourcePath = path.join(productsDir, file);
        const destPath = path.join(backupDir, file);
        fs.renameSync(sourcePath, destPath);
    });
    console.log('Created backup of original images in products-backup folder');
}

// Move optimized files to products directory
const optimizedFiles = fs.readdirSync(optimizedDir);
optimizedFiles.forEach(file => {
    const sourcePath = path.join(optimizedDir, file);
    const destPath = path.join(productsDir, file);
    fs.renameSync(sourcePath, destPath);
});

console.log('Replaced original images with optimized WebP versions');

// Create a mapping of old to new filenames for HTML updates
const fileMapping = {};
fs.readdirSync(backupDir).forEach(oldFile => {
    const baseName = path.parse(oldFile).name;
    const newFile = baseName + '.webp';
    if (fs.existsSync(path.join(productsDir, newFile))) {
        fileMapping[oldFile] = newFile;
    }
});

// Save the mapping to a JSON file for reference
fs.writeFileSync(
    path.join(__dirname, 'image-mapping.json'),
    JSON.stringify(fileMapping, null, 2)
);

console.log('Created image mapping file for HTML updates');
