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
        { file: path.join('dist', 'ktm-dev.html'), minSizeKb: 300, maxSizeKb: 4500 },
        { file: path.join('dist', 'ktm-lite.html'), minSizeKb: 80, maxSizeKb: 200 },
        { file: path.join('dist', 'ktm-std.html'), minSizeKb: 120, maxSizeKb: 250 },
        { file: path.join('dist', 'ktm-full.html'), minSizeKb: 300, maxSizeKb: 4500 },
        { file: path.join('dist', 'kantanUpdate.js'), minSizeKb: 300, maxSizeKb: 4500 }
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

    // Test 2: ktm-new.html links and size table integrity
    test('ktm-new.html contains valid links and auto-updated size table for each edition', () => {
        const ktmNewPath = path.join(rootDir, 'ktm-new.html');
        const content = fs.readFileSync(ktmNewPath, 'utf-8');

        assert(content.includes('https://hiro-gj.github.io/KanTanMarkdown/dist/ktm-lite.html'),
            'ktm-new.html must link to dist/ktm-lite.html');
        assert(content.includes('https://hiro-gj.github.io/KanTanMarkdown/dist/ktm-std.html'),
            'ktm-new.html must link to dist/ktm-std.html');
        assert(content.includes('https://hiro-gj.github.io/KanTanMarkdown/dist/ktm-full.html'),
            'ktm-new.html must link to dist/ktm-full.html');
        assert(content.includes('https://hiro-gj.github.io/KanTanMarkdown/dist/preview/ktm-lite.html'),
            'ktm-new.html must link to dist/preview/ktm-lite.html');
        assert(content.includes('https://hiro-gj.github.io/KanTanMarkdown/dist/preview/ktm-std.html'),
            'ktm-new.html must link to dist/preview/ktm-std.html');
        assert(content.includes('https://hiro-gj.github.io/KanTanMarkdown/dist/preview/ktm-full.html'),
            'ktm-new.html must link to dist/preview/ktm-full.html');

        // Check "空の容量" size table structure (release table and preview table)
        assert(content.includes('<td>空の容量</td>'), 'ktm-new.html must have "空の容量" row');
        const sizeRegex = /<td>空の容量<\/td>[\s\S]*?<td[^>]*>(約\d+(?:kb|MB))<\/td>[\s\S]*?<td[^>]*>(約\d+(?:kb|MB))<\/td>[\s\S]*?<td[^>]*>(約[\d\.]+(?:kb|MB))<\/td>/;
        const match = content.match(sizeRegex);
        assert(match, 'ktm-new.html "空の容量" row must match size format (e.g. 約121kb, 約165kb, 約3.1MB)');
        const previewSizeRegex = /dist\/preview\/ktm-full\.html[\s\S]*?<td>空の容量<\/td>[\s\S]*?<td[^>]*>(約\d+(?:kb|MB))<\/td>[\s\S]*?<td[^>]*>(約\d+(?:kb|MB))<\/td>[\s\S]*?<td[^>]*>(約[\d\.]+(?:kb|MB))<\/td>/;
        const previewMatch = content.match(previewSizeRegex);
        assert(previewMatch, 'ktm-new.html preview table must also have "空の容量" row with valid size format');
        assert(content.includes('<td>Mermaid</td>'), 'ktm-new.html feature comparison must include Mermaid row');
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

    // Test 5: Updated license header, A4 layout CSS, 2-pane zoom, zoom buttons, and scroll sync
    test('Generated HTML files include updated license, A4 layout rules, edit-mode zoom/controls, and scroll sync', () => {
        const licenseText = fs.readFileSync(path.join(rootDir, 'LICENSE'), 'utf-8');
        assert(licenseText.includes('Copyright (c) 2016 tatesuke') && licenseText.includes('Copyright (c) 2026 hiro-gj'),
            'LICENSE must include both 2016 tatesuke and 2026 hiro-gj copyright notices');

        const htmlFiles = [
            path.join('dist', 'ktm-dev.html'),
            path.join('dist', 'ktm-lite.html'),
            path.join('dist', 'ktm-std.html'),
            path.join('dist', 'ktm-full.html')
        ];

        for (const relPath of htmlFiles) {
            const content = fs.readFileSync(path.join(rootDir, relPath), 'utf-8');
            assert(content.includes('Copyright (c) 2026 hiro-gj'),
                `${relPath} must include Copyright (c) 2026 hiro-gj`);
            assert(content.includes('https://github.com/hiro-gj/KanTanMarkdown/blob/master/LICENSE'),
                `${relPath} must link to hiro-gj LICENSE URL`);
            assert(content.includes('id="btn-editor-zoom-in"') && content.includes('id="btn-editor-zoom-reset"'),
                `${relPath} must contain editor zoom-in and zoom-reset buttons`);
            assert(content.includes('300mm') && content.includes('424mm') && content.includes('210'),
                `${relPath} must contain A4 aspect-ratio and 300mm/424mm previewer layout rules`);
            assert(content.includes('--editor-zoom') && content.includes('.67'),
                `${relPath} must contain editMode 67% zoom rules`);
            assert(content.includes('syncEditorPreviewScroll') && content.includes('applyEditorZoom'),
                `${relPath} must contain bidirectional scroll sync and editor zoom functions`);
        }
    });

    // Test 6: dist/preview/ subfolder artifacts existence, size bounds, and HTML structure
    test('dist/preview subfolder contains valid preview distribution artifacts', () => {
        const previewArtifacts = [
            { file: path.join('dist', 'preview', 'ktm-dev.html'), minSizeKb: 300, maxSizeKb: 4500, isHtml: true },
            { file: path.join('dist', 'preview', 'ktm-lite.html'), minSizeKb: 80, maxSizeKb: 200, isHtml: true },
            { file: path.join('dist', 'preview', 'ktm-std.html'), minSizeKb: 120, maxSizeKb: 250, isHtml: true },
            { file: path.join('dist', 'preview', 'ktm-full.html'), minSizeKb: 2500, maxSizeKb: 4500, isHtml: true },
            { file: path.join('dist', 'preview', 'kantanUpdate.js'), minSizeKb: 2500, maxSizeKb: 4500, isHtml: false }
        ];

        for (const item of previewArtifacts) {
            const filePath = path.join(rootDir, item.file);
            assert(fs.existsSync(filePath), `Preview artifact ${item.file} must exist`);

            const stat = fs.statSync(filePath);
            const sizeKb = stat.size / 1024;
            assert(stat.size > 0, `${item.file} must not be empty`);
            assert(sizeKb >= item.minSizeKb, `${item.file} size (${sizeKb.toFixed(1)} KB) should be >= ${item.minSizeKb} KB`);
            assert(sizeKb <= item.maxSizeKb, `${item.file} size (${sizeKb.toFixed(1)} KB) should be <= ${item.maxSizeKb} KB`);

            const content = fs.readFileSync(filePath, 'utf-8');
            if (item.isHtml) {
                assert(content.toLowerCase().includes('<!doctype html>'), `${item.file} must contain doctype`);
                assert(content.toLowerCase().includes('</html>'), `${item.file} must contain closing html tag`);
                assert(content.includes('href="https://github.com/hiro-gj/KanTanMarkdown"'),
                    `${item.file} must link to https://github.com/hiro-gj/KanTanMarkdown`);
                assert(content.includes('Copyright (c) 2026 hiro-gj'),
                    `${item.file} must include Copyright (c) 2026 hiro-gj`);
            } else {
                assert(content.includes('"newVersion":'),
                    `${item.file} must contain newVersion metadata`);
            }
        }
    });

    // Test 7: GitHub Actions workflows configuration for release (dist/) and master push (dist/preview/)
    test('GitHub Actions workflows configure dist/preview deployment on master push while protecting release dist/', () => {
        const deployWorkflowPath = path.join(rootDir, '.github', 'workflows', 'deploy-pages.yml');
        assert(fs.existsSync(deployWorkflowPath), '.github/workflows/deploy-pages.yml must exist');
        const deployYaml = fs.readFileSync(deployWorkflowPath, 'utf-8');

        // Release trigger and master push trigger with functional paths filter
        assert(deployYaml.includes('release:') && deployYaml.includes('types: [published]'),
            'deploy-pages.yml must trigger on release published');
        assert(deployYaml.includes('push:') && deployYaml.includes('- master') && deployYaml.includes('paths:'),
            'deploy-pages.yml must trigger on master push with paths filter');
        assert(deployYaml.includes("'src/**'") && deployYaml.includes("'Gruntfile.js'") && deployYaml.includes("'package.json'"),
            'deploy-pages.yml push paths must include functional build targets');
        assert(!deployYaml.includes("'README.md'") && !deployYaml.includes("'.gear/**'"),
            'deploy-pages.yml push paths must not trigger on non-functional documentation files');

        // Preview subfolder deployment and release dist/ restoration on push
        assert(deployYaml.includes('mkdir -p dist/preview') && deployYaml.includes('dist/preview/'),
            'deploy-pages.yml must populate dist/preview/');
        assert(deployYaml.includes('git checkout "$LATEST_TAG" -- src/kantanVersion.txt dist/kantanUpdate.js dist/ktm-dev.html dist/ktm-lite.html dist/ktm-std.html dist/ktm-full.html'),
            'deploy-pages.yml must restore root dist/ files from LATEST_TAG during push preview deployment');
        assert(deployYaml.includes('cp -p /tmp/release-backup/ktm-new.html ./ktm-new.html'),
            'deploy-pages.yml must preserve ktm-new.html pre-build state during push preview deployment');
        assert(deployYaml.includes('cp -p dist/preview/kantanUpdate.js dist/preview/ktm-dev.html dist/preview/ktm-lite.html dist/preview/ktm-std.html dist/preview/ktm-full.html dist/'),
            'deploy-pages.yml must copy artifacts from dist/preview/ to root dist/ on release publish');
        assert(deployYaml.includes('chore(preview): update dist/preview from master [skip ci]'),
            'deploy-pages.yml must commit dist/preview updates with [skip ci]');
        assert(deployYaml.includes('ktm-new.html') && deployYaml.includes('chore(release): sync version to ${TARGET_TAG} [skip ci]'),
            'deploy-pages.yml must commit ktm-new.html on release publish');
        assert(deployYaml.indexOf('Commit synced artifacts back to master') < deployYaml.indexOf('Deploy to GitHub Pages') &&
            deployYaml.includes('echo "DEPLOY_SHA=$(git rev-parse HEAD)" >> "$GITHUB_ENV"'),
            'deploy-pages.yml must commit synced release artifacts and set DEPLOY_SHA before deploying to GitHub Pages');

        const testWorkflowPath = path.join(rootDir, '.github', 'workflows', 'test.yml');
        assert(fs.existsSync(testWorkflowPath), '.github/workflows/test.yml must exist');
        const testYaml = fs.readFileSync(testWorkflowPath, 'utf-8');
        assert(testYaml.includes('paths-ignore:') && testYaml.includes("'README.md'") && testYaml.includes("'.gear/**'") && testYaml.includes("'dist/preview/**'"),
            'test.yml must ignore non-functional and preview artifact paths');
    });

    // Test 8: Mermaid inclusion in full edition and exclusion from lite / std editions
    test('Mermaid is bundled in full/dev editions and excluded from lite/std editions', () => {
        // Verify in dist/preview (latest built artifacts) and dist/ if bundled
        const previewFull = fs.readFileSync(path.join(rootDir, 'dist', 'preview', 'ktm-full.html'), 'utf-8');
        const previewDev = fs.readFileSync(path.join(rootDir, 'dist', 'preview', 'ktm-dev.html'), 'utf-8');
        const previewLite = fs.readFileSync(path.join(rootDir, 'dist', 'preview', 'ktm-lite.html'), 'utf-8');
        const previewStd = fs.readFileSync(path.join(rootDir, 'dist', 'preview', 'ktm-std.html'), 'utf-8');

        assert(previewFull.includes('id="mermaidJs"') && previewFull.includes('mermaid'),
            'dist/preview/ktm-full.html must bundle mermaidJs');
        assert(previewDev.includes('id="mermaidJs"') && previewDev.includes('mermaid'),
            'dist/preview/ktm-dev.html must bundle mermaidJs');
        assert(!previewLite.includes('id="mermaidJs"'),
            'dist/preview/ktm-lite.html must not include mermaidJs');
        assert(!previewStd.includes('id="mermaidJs"'),
            'dist/preview/ktm-std.html must not include mermaidJs');
    });

    console.log(`\nBuild Integrity Test Summary: ${passCount} passed, ${failCount} failed`);
    if (failCount > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests();
