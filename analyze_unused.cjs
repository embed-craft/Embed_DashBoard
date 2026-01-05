
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');

// Helper to recursively get files
function getFiles(dir, ext = []) {
    let results = [];
    if (!fs.existsSync(dir)) return [];

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(filePath, ext));
        } else {
            if (ext.length === 0 || ext.includes(path.extname(file))) {
                results.push(filePath);
            }
        }
    });
    return results;
}

// Get all TSX/TS files in src
const allSourceFiles = getFiles(SRC_DIR, ['.tsx', '.ts']);
const allFilesContent = allSourceFiles.map(f => ({
    path: f,
    content: fs.readFileSync(f, 'utf-8')
}));

// Get all component files
const componentFiles = getFiles(COMPONENTS_DIR, ['.tsx']);

const unusedComponents = [];

console.log(`Scanning ${componentFiles.length} components against ${allSourceFiles.length} source files...`);

componentFiles.forEach(compPath => {
    const compName = path.basename(compPath, '.tsx');

    // Skip specific ignores
    if (compName === 'index' || compName.endsWith('.d') || compName === 'vite-env.d') return;

    let usageCount = 0;

    for (const file of allFilesContent) {
        if (file.path === compPath) continue;

        // Simple strict regex: boundary + name + boundary
        const regex = new RegExp(`\\b${compName}\\b`);

        if (regex.test(file.content)) {
            usageCount++;
            break;
        }
    }

    if (usageCount === 0) {
        unusedComponents.push(compPath);
    }
});

console.log('\n--- POTENTIALLY UNUSED COMPONENTS ---');
unusedComponents.forEach(c => console.log(path.relative(process.cwd(), c)));
console.log(`\nTotal potentially unused: ${unusedComponents.length}`);
