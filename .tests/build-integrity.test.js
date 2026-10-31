/**
 * build-integrity.test.js
 * Integrity verification for built artifacts (dist/) and ktm-new.html
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function runTests() {
    console.log('--- Running Build Integrity Tests ---');
    let passCount = 0;
    let failCount = 0;

    function test(name, fn) {
        try {
            fn();
            console.log(`  [PASS] ${name}`);
            passCount++;
        } catch (err) {
            console.error(`  [FAIL] ${name}: ${err.message}`);
            failCount++;
        }
    }

    const requiredArtifacts = [
        { file: 'ktm-new.html', minSizeKb: 8, maxSizeKb: 30 },
        { file: path.join('dist', 'ktm-dev.html'), minSizeKb: 300, maxSizeKb: 600 },
        { file: path.join('dist', 'ktm-lite.html'), minSizeKb: 80, maxSizeKb: 200 },
        { file: path.join('dist', 'ktm-std.html'), minSizeKb: 120, maxSizeKb: 250 },
        { file: path.join('dist', 'ktm-full.html'), minSizeKb: 300, maxSizeKb: 500 },
        { file: path.join('dist', 'kantanUpdate.js'), minSizeKb: 300, maxSizeKb: 550 }
    ];

    // Test 1: Existence and file size bounds
    test('All required distribution artifacts and entry files exist with expected size ranges', () => {
        for (const item of requiredArtifacts) {
            const filePath = path.join(rootDir, item.file);
            assert(fs.existsSync(filePath), `Required artifact ${item.file} must exist`);

            const stat = fs.statSync(filePath);
            const sizeKb = stat.size / 1024;
            assert(stat.size > 0, `${item.file} must not be empty`);
            assert(sizeKb >= item.minSizeKb, `${item.file} size (${sizeKb.toFixed(1)} KB) should be >= ${item.minSizeKb} KB`);
            assert(sizeKb <= item.maxSizeKb, `${item.file} size (${sizeKb.toFixed(1)} KB) should be <= ${item.maxSizeKb} KB`);
        }
    });

    // Test 2: ktm-new.html links integrity
    test('ktm-new.html contains valid links to each distribution edition', () => {
        const ktmNewPath = path.join(rootDir, 'ktm-new.html');
        const content = fs.readFileSync(ktmNewPath, 'utf-8');

        assert(content.includes('https://hiro-gj.github.io/KanTanMarkdown/dist/ktm-lite.html'),
            'ktm-new.html must link to dist/ktm-lite.html');
        assert(content.includes('https://hiro-gj.github.io/KanTanMarkdown/dist/ktm-std.html'),
            'ktm-new.html must link to dist/ktm-std.html');
        assert(content.includes('https://hiro-gj.github.io/KanTanMarkdown/dist/ktm-full.html'),
            'ktm-new.html must link to dist/ktm-full.html');
    });

    // Test 3: HTML distribution files structure
    test('Generated HTML files have valid doctype and html closing structure', () => {
        const htmlFiles = [
            path.join('dist', 'ktm-dev.html'),
            path.join('dist', 'ktm-lite.html'),
            path.join('dist', 'ktm-std.html'),
            path.join('dist', 'ktm-full.html')
        ];

        for (const relPath of htmlFiles) {
            const content = fs.readFileSync(path.join(rootDir, relPath), 'utf-8');
            assert(content.toLowerCase().includes('<!doctype html>'), `${relPath} must contain doctype`);
            assert(content.toLowerCase().includes('</html>'), `${relPath} must contain closing html tag`);
        }
    });

    // Test 4: Repository link and release version alignment in built artifacts
    test('Generated HTML and update files contain updated repository link and match kantanVersion.txt', () => {
        const expectedVersion = fs.readFileSync(path.join(rootDir, 'src', 'kantanVersion.txt'), 'utf-8').trim();
        assert(expectedVersion.length > 0, 'src/kantanVersion.txt must not be empty');

        const htmlFiles = [
            path.join('dist', 'ktm-dev.html'),
            path.join('dist', 'ktm-lite.html'),
            path.join('dist', 'ktm-std.html'),
            path.join('dist', 'ktm-full.html')
        ];

        for (const relPath of htmlFiles) {
            const content = fs.readFileSync(path.join(rootDir, relPath), 'utf-8');
            assert(content.includes('href="https://github.com/hiro-gj/KanTanMarkdown"'),
                `${relPath} must link to https://github.com/hiro-gj/KanTanMarkdown`);
            assert(content.includes(`id="kantanVersion" value="${expectedVersion}"`),
                `${relPath} must embed version ${expectedVersion}`);
        }

        const updateJsContent = fs.readFileSync(path.join(rootDir, 'dist', 'kantanUpdate.js'), 'utf-8');
        assert(updateJsContent.includes(`"newVersion": "${expectedVersion}"`),
            `dist/kantanUpdate.js must embed newVersion ${expectedVersion}`);
    });

    console.log(`\nBuild Integrity Test Summary: ${passCount} passed, ${failCount} failed`);
    if (failCount > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests();
