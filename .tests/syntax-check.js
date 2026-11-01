/**
 * syntax-check.js
 * Source code syntax integrity validation for KanTanMarkdown
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');

const filesToCheck = [
    'Gruntfile.js',
    path.join('src', 'kantanUpdate.js'),
    path.join('src', 'js', 'flowchart.min.js'),
    path.join('src', 'js', 'github-alerts.js'),
    path.join('src', 'js', 'highlight.min.js'),
    path.join('src', 'js', 'js-sequence-diagrams.min.js'),
    path.join('src', 'js', 'kantanDrawer.js'),
    path.join('src', 'js', 'kantanEditor.js'),
    path.join('src', 'js', 'kantanMarkdown.js'),
    path.join('src', 'js', 'marked.min.js'),
    path.join('src', 'js', 'mermaid.min.js'),
    path.join('src', 'js', 'raphael.min.js'),
    path.join('src', 'js', 'underscore.min.js')
];

let passCount = 0;
let failCount = 0;
const errors = [];

console.log('--- Checking JavaScript Syntax ---');

for (const relPath of filesToCheck) {
    const fullPath = path.join(rootDir, relPath);
    if (!fs.existsSync(fullPath)) {
        console.error(`  [FAIL] Missing file: ${relPath}`);
        failCount++;
        errors.push({ file: relPath, error: 'File not found' });
        continue;
    }

    try {
        let code = fs.readFileSync(fullPath, 'utf-8');
        // Handle template inline markers in src/kantanUpdate.js if present
        if (relPath.includes('kantanUpdate.js') && code.includes('<inline')) {
            code = code.replace(/"<inline\s+src="[^"]*"\s*\/>"/g, '""')
                       .replace(/<inline\s+src="[^"]*"\s*\/>/g, '""');
        }
        new vm.Script(code, { filename: relPath });
        console.log(`  [PASS] ${relPath}`);
        passCount++;
    } catch (err) {
        console.error(`  [FAIL] Syntax error in ${relPath}: ${err.message}`);
        failCount++;
        errors.push({ file: relPath, error: err.message });
    }
}

console.log(`\nSyntax Check Summary: ${passCount} passed, ${failCount} failed`);

if (failCount > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
