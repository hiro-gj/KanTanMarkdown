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
        assert(content.includes('a[href*="/dist/"]') && content.includes('"?t=" + Date.now()'),
            'ktm-new.html must append cache-busting timestamp parameter on edition link click');
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

    // Test 4: Repository link and release/preview version alignment in built artifacts
    test('Generated HTML and update files contain updated repository link and match kantanVersion.txt', () => {
        const expectedVersion = fs.readFileSync(path.join(rootDir, 'src', 'kantanVersion.txt'), 'utf-8').trim();
        const pkgVersion = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')).version;
        const majorVersion = String(pkgVersion).split('.')[0];
        assert(expectedVersion.length > 0, 'src/kantanVersion.txt must not be empty');
        assert(new RegExp('^v' + majorVersion + '\\.\\d{8}\\.\\d+$').test(expectedVersion),
            'src/kantanVersion.txt (' + expectedVersion + ') must align with package.json major version and follow v' + majorVersion + '.YYYYMMDD.N format');

        const previewHtmlFiles = [
            path.join('dist', 'preview', 'ktm-dev.html'),
            path.join('dist', 'preview', 'ktm-lite.html'),
            path.join('dist', 'preview', 'ktm-std.html'),
            path.join('dist', 'preview', 'ktm-full.html')
        ];

        for (const relPath of previewHtmlFiles) {
            const content = fs.readFileSync(path.join(rootDir, relPath), 'utf-8');
            assert(content.includes('href="https://github.com/hiro-gj/KanTanMarkdown"'),
                `${relPath} must link to https://github.com/hiro-gj/KanTanMarkdown`);
            assert(content.includes(`id="kantanVersion" value="${expectedVersion}"`),
                `${relPath} must embed version ${expectedVersion}`);
        }

        const previewUpdateJsContent = fs.readFileSync(path.join(rootDir, 'dist', 'preview', 'kantanUpdate.js'), 'utf-8');
        assert(previewUpdateJsContent.includes(`"newVersion": "${expectedVersion}"`),
            `dist/preview/kantanUpdate.js must embed newVersion ${expectedVersion}`);

        const releaseHtmlFiles = [
            path.join('dist', 'ktm-dev.html'),
            path.join('dist', 'ktm-lite.html'),
            path.join('dist', 'ktm-std.html'),
            path.join('dist', 'ktm-full.html')
        ];

        for (const relPath of releaseHtmlFiles) {
            const content = fs.readFileSync(path.join(rootDir, relPath), 'utf-8');
            assert(content.includes('href="https://github.com/hiro-gj/KanTanMarkdown"'),
                `${relPath} must link to https://github.com/hiro-gj/KanTanMarkdown`);
            assert(content.includes(`id="kantanVersion" value="${expectedVersion}"`),
                `${relPath} must embed release version ${expectedVersion}`);
            const editionMatch = path.basename(relPath).match(/^ktm-(.+)\.html$/);
            if (editionMatch) {
                assert(content.includes(`<span class="version">${expectedVersion}_${editionMatch[1]}</span>`),
                    `${relPath} must embed version label ${expectedVersion}_${editionMatch[1]} in .version span`);
            }
        }

        const releaseUpdateJsContent = fs.readFileSync(path.join(rootDir, 'dist', 'kantanUpdate.js'), 'utf-8');
        assert(releaseUpdateJsContent.includes(`"newVersion": "${expectedVersion}"`),
            `dist/kantanUpdate.js must embed release newVersion ${expectedVersion}`);
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

    // Test 7: GitHub Actions workflows and esbuild build pipeline configuration
    test('GitHub Actions workflows configure dist/preview deployment, release promotion, and reproducible npm ci', () => {
        const deployWorkflowPath = path.join(rootDir, '.github', 'workflows', 'deploy-pages.yml');
        assert(fs.existsSync(deployWorkflowPath), '.github/workflows/deploy-pages.yml must exist');
        const deployYaml = fs.readFileSync(deployWorkflowPath, 'utf-8');

        // Release trigger and master push trigger with functional paths filter
        assert(deployYaml.includes('release:') && deployYaml.includes('types: [published]'),
            'deploy-pages.yml must trigger on release published');
        assert(deployYaml.includes('push:') && deployYaml.includes('- master') && deployYaml.includes('paths:'),
            'deploy-pages.yml must trigger on master push with paths filter');
        assert(deployYaml.includes("'src/**'") && deployYaml.includes("'scripts/**'") && deployYaml.includes("'package.json'") && deployYaml.includes("'package-lock.json'"),
            'deploy-pages.yml push paths must include functional build targets and lockfile');
        assert(!deployYaml.includes("'README.md'") && !deployYaml.includes("'.gear/**'"),
            'deploy-pages.yml push paths must not trigger on non-functional documentation files');

        assert(deployYaml.includes('npm ci'),
            'deploy-pages.yml must install dependencies reproducibly via npm ci');
        assert(deployYaml.includes('npm run build'),
            'deploy-pages.yml must run npm run build on master push to update dist/preview/ while preserving dist/');
        const promoteCmd = deployYaml.match(/node scripts\/promote-release\.js[^\r\n]*/);
        assert(promoteCmd, 'deploy-pages.yml must invoke scripts/promote-release.js on release');
        for (const flag of ['--version "$TARGET_TAG"', '--source-sha "$TAG_COMMIT"', '--require-manifest', '--artifact-dir "$ARTIFACT_DIR"', '--cross-check-dir dist/preview', '--sync-root "$MASTER_SYNC_DIR"']) {
            assert(promoteCmd[0].includes(flag),
                `deploy-pages.yml promote-release invocation must include ${flag}`);
        }
        assert(!deployYaml.includes('gh run download') || !deployYaml.includes('|| true'),
            'deploy-pages.yml must not ignore verified artifact download failures with || true');
        assert(/gh run download[^\n]*--dir "\$VERIFIED_ARTIFACT_ROOT"/.test(deployYaml) && !/gh run download[^\n]*--dir \.(\s|$)/m.test(deployYaml),
            'deploy-pages.yml must download verified artifacts into a dedicated directory outside the working tree, never into the repository root');
        assert(deployYaml.includes('${{ runner.temp }}/verified-artifacts') && deployYaml.includes('${{ runner.temp }}/master-sync'),
            'deploy-pages.yml must keep verified artifacts and the master sync worktree outside the repository checkout');
        const beforeStepsYaml = deployYaml.slice(0, deployYaml.indexOf('steps:'));
        assert(!beforeStepsYaml.includes('runner.'),
            'deploy-pages.yml must not reference the runner context in job-level env (GitHub Actions only allows runner.* inside steps)');
        assert(!deployYaml.includes('git pull --rebase'),
            'deploy-pages.yml must not mutate the verified working tree via git pull --rebase after verification');
        assert(/^\s+actions:\s*read\s*$/m.test(deployYaml),
            'deploy-pages.yml must grant actions: read so gh run list / gh run download can fetch verified CI artifacts');

        // R2: the verification tree must be the tag commit itself (not the moving origin/master head),
        // checked out exactly once before npm ci so lockfile, build, promote, and tests share one commit.
        assert(!deployYaml.includes('git checkout -B master origin/master'),
            'deploy-pages.yml must not verify or promote on the moving origin/master head instead of the tag commit');
        const alignIdx = deployYaml.indexOf('git checkout --detach "$VERIFY_COMMIT"');
        const npmCiIdx = deployYaml.indexOf('run: npm ci');
        const buildIdx = deployYaml.indexOf('npm run build');
        assert(alignIdx !== -1 && npmCiIdx !== -1 && alignIdx < npmCiIdx && npmCiIdx < buildIdx,
            'deploy-pages.yml must check out the verification commit before npm ci and all build/promote/test steps');
        assert((deployYaml.match(/git checkout /g) || []).length === 1,
            'deploy-pages.yml must switch commits exactly once, before dependency installation');
        assert(deployYaml.includes('VERIFY_COMMIT="$TAG_COMMIT"') && deployYaml.includes('VERIFY_COMMIT="$EVENT_SHA"'),
            'deploy-pages.yml must verify the tag commit on release and the pushed commit on master push');
        assert(deployYaml.includes('git merge-base --is-ancestor "$TAG_COMMIT" origin/master'),
            'deploy-pages.yml must require the release tag commit to be part of origin/master history');
        assert(deployYaml.includes('git worktree add --detach "$MASTER_SYNC_DIR" origin/master'),
            'deploy-pages.yml must sync promoted artifacts to origin/master via a separate worktree');
        assert(deployYaml.includes('--prepare-pages --root-dir "$MASTER_SYNC_DIR"'),
            'deploy-pages.yml must publish _site from the master worktree so release promotion never rolls preview back to the tag state');
        assert(deployYaml.includes('chore(preview): update dist/preview from master [skip ci]'),
            'deploy-pages.yml must commit dist/preview updates with [skip ci]');
        assert(deployYaml.includes('ktm-new.html') && deployYaml.includes('chore(release): sync version to ${TARGET_TAG} [skip ci]'),
            'deploy-pages.yml must commit ktm-new.html on release publish');
        assert(!deployYaml.includes('git tag -f') && !deployYaml.includes('/home/runner/work/_actions/actions/deploy-pages'),
            'deploy-pages.yml must not force-move published tags or patch internal Actions JS');
        assert(deployYaml.includes('node scripts/build.js --prepare-pages') && deployYaml.includes("path: '_site'"),
            'deploy-pages.yml must stage only public files into _site for GitHub Pages deployment');

        const testWorkflowPath = path.join(rootDir, '.github', 'workflows', 'test.yml');
        assert(fs.existsSync(testWorkflowPath), '.github/workflows/test.yml must exist');
        const testYaml = fs.readFileSync(testWorkflowPath, 'utf-8');
        assert(testYaml.includes('npm ci') && testYaml.includes('npm run build') && testYaml.includes('npm test'),
            'test.yml must run npm ci, npm run build, and npm test');
        assert(testYaml.includes('paths-ignore:') && testYaml.includes("'README.md'") && testYaml.includes("'.gear/**'") && testYaml.includes("'dist/preview/**'"),
            'test.yml must ignore non-functional and preview artifact paths');
        const uploadBlock = testYaml.slice(testYaml.indexOf('upload-artifact'));
        assert(uploadBlock.includes('dist/preview/ktm-*.html') && uploadBlock.includes('dist/preview/kantanUpdate.js') && uploadBlock.includes('dist/preview/build-manifest.json'),
            'test.yml must upload the verified dist/preview artifacts and build-manifest.json');
        assert(!/^\s+(ktm-new\.html|src\/kantanVersion\.txt|dist\/ktm-\*\.html|dist\/kantanUpdate\.js)\s*$/m.test(uploadBlock),
            'test.yml artifact must contain only dist/preview artifacts so release promotion cannot overwrite dist/, ktm-new.html, or src/kantanVersion.txt');
        assert(uploadBlock.includes('if-no-files-found: error'),
            'test.yml must fail when verified artifacts are missing');
        assert(fs.existsSync(path.join(rootDir, 'package-lock.json')),
            'package-lock.json must be tracked in the repository');
        assert(!fs.existsSync(path.join(rootDir, 'Gruntfile.js')) && !fs.existsSync(path.join(rootDir, '.npmrc')),
            'Legacy Gruntfile.js and .npmrc must be removed');
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

        // Verify print scaling (zoom: 0.5 for flowchart, sequence, class, state) and async mindmap support in source
        const previewerCss = fs.readFileSync(path.join(rootDir, 'src', 'css', 'previewer.css'), 'utf-8');
        const kantanCss = fs.readFileSync(path.join(rootDir, 'src', 'css', 'kantan.css'), 'utf-8');
        const kantanMdJs = fs.readFileSync(path.join(rootDir, 'src', 'js', 'kantanMarkdown.js'), 'utf-8');

        assert(!/\.mermaid\s+svg,\s*\.mermaid-rendered\s+svg\s*\{\s*max-width:\s*100%\s*!important/.test(previewerCss),
            'previewer.css must not force max-width: 100% !important on .mermaid svg in @media print');
        assert(previewerCss.includes('svg[aria-roledescription^="flowchart"]') &&
            previewerCss.includes('svg[aria-roledescription="sequence"]') &&
            previewerCss.includes('svg[aria-roledescription^="class"]') &&
            previewerCss.includes('svg[aria-roledescription^="state"]') &&
            previewerCss.includes('zoom: 0.5;'),
            'previewer.css must apply zoom: 0.5 in @media print for flowchart, sequence, class, and state diagrams');
        assert(kantanCss.includes('svg[aria-roledescription^="flowchart"]') && kantanCss.includes('zoom: 0.5;'),
            'kantan.css must apply zoom: 0.5 in @media print for target Mermaid diagrams');
        assert(kantanMdJs.includes('mermaid.renderAsync') && kantanMdJs.includes('mindmap'),
            'kantanMarkdown.js must support mermaid.renderAsync for mindmap diagrams');
    });

    // Test 9: Multi-page print preview layout and page-break indicator logic
    test('Multi-page print preview layout and page-break indicator are defined and functional', () => {
        const kantanCss = fs.readFileSync(path.join(rootDir, 'src', 'css', 'kantan.css'), 'utf-8');
        const kantanMdJs = fs.readFileSync(path.join(rootDir, 'src', 'js', 'kantanMarkdown.js'), 'utf-8');

        assert(kantanCss.includes('--page-aspect-ratio: 210 / 297;'),
            'kantan.css must maintain A4 ratio reference via --page-aspect-ratio: 210 / 297;');
        assert(kantanCss.includes('.page-break-indicator {') && kantanCss.includes('margin: 28px -40px 20px;'),
            'kantan.css must define .page-break-indicator styling');
        assert(kantanCss.includes('.page-break-indicator::after') && kantanCss.includes('attr(data-page)'),
            'kantan.css must display page indicator badge with data-page attribute');
        assert(kantanCss.includes('@media print') && kantanCss.includes('.page-break-indicator') &&
            kantanCss.includes('display: none !important;'),
            'kantan.css must hide .page-break-indicator during printing');

        assert(kantanMdJs.includes('function updatePageBreaks()'),
            'kantanMarkdown.js must implement updatePageBreaks function');
        assert(kantanMdJs.includes('pageHeight = pWidth * (297 / 210);'),
            'kantanMarkdown.js must calculate pageHeight based on A4 210/297 ratio');
        assert(kantanMdJs.includes('ind.className = "page-break-indicator";') &&
            kantanMdJs.includes('ind.setAttribute("data-page", "Page " + currentPage);'),
            'kantanMarkdown.js must insert page-break-indicator element with Page N label');
        assert(kantanMdJs.includes('updatePageBreaks();'),
            'kantanMarkdown.js must hook updatePageBreaks on previewed and resize events');

        const ktmHtml = fs.readFileSync(path.join(rootDir, 'src', 'ktm.html'), 'utf-8');
        assert(ktmHtml.includes('href="https://hiro-gj.github.io/KanTanMarkdown/dist/kantanUpdate.js" id="updateButton"'),
            'src/ktm.html #updateButton must point to remote kantanUpdate.js URL instead of relative "#"');
        assert(!ktmHtml.includes('href="#"'),
            'src/ktm.html must not contain relative href="#" links that resolve to local file:/// paths');

        const leakRegex = /file:\/\/\/|c:\/users|c:\\users|h\.matsumoto|ctd\.co\.jp/i;
        const filesToCheckForLeaks = [
            'ktm-new.html',
            path.join('src', 'ktm.html'),
            path.join('src', 'kantanUpdate.js'),
            path.join('src', 'js', 'kantanMarkdown.js'),
            path.join('src', 'css', 'kantan.css'),
            path.join('dist', 'ktm-dev.html'),
            path.join('dist', 'ktm-lite.html'),
            path.join('dist', 'ktm-std.html'),
            path.join('dist', 'ktm-full.html'),
            path.join('dist', 'kantanUpdate.js'),
            path.join('dist', 'preview', 'ktm-dev.html'),
            path.join('dist', 'preview', 'ktm-lite.html'),
            path.join('dist', 'preview', 'ktm-std.html'),
            path.join('dist', 'preview', 'ktm-full.html'),
            path.join('dist', 'preview', 'kantanUpdate.js')
        ];
        for (const rel of filesToCheckForLeaks) {
            const p = path.join(rootDir, rel);
            if (fs.existsSync(p)) {
                const c = fs.readFileSync(p, 'utf-8');
                assert(!leakRegex.test(c), `${rel} must not contain any local file:/// paths or user directory information`);
            }
        }

        const editions = ['ktm-dev.html', 'ktm-lite.html', 'ktm-std.html', 'ktm-full.html'];
        for (const edition of editions) {
            const distPath = path.join(rootDir, 'dist', edition);
            const previewPath = path.join(rootDir, 'dist', 'preview', edition);
            const distContent = fs.existsSync(distPath) ? fs.readFileSync(distPath, 'utf-8') : '';
            const previewContent = fs.existsSync(previewPath) ? fs.readFileSync(previewPath, 'utf-8') : '';
            const hasInDist = distContent.includes('page-break-indicator') && distContent.includes('updatePageBreaks') &&
                distContent.includes('href="https://hiro-gj.github.io/KanTanMarkdown/dist/kantanUpdate.js" id="updateButton"');
            const hasInPreview = previewContent.includes('page-break-indicator') && previewContent.includes('updatePageBreaks') &&
                previewContent.includes('href="https://hiro-gj.github.io/KanTanMarkdown/dist/kantanUpdate.js" id="updateButton"');
            assert(hasInDist || hasInPreview,
                `Built artifact for ${edition} (in dist/ or dist/preview/) must embed page-break-indicator, updatePageBreaks, and remote #updateButton URL`);
        }
    });

    // Test 10: Inline code (code, tt) line-wrapping and underscore padding in previewer.css and built artifacts
    test('Inline code (code, tt) enables line wrapping and vertical padding so long commands wrap and underscores do not collide with border', () => {
        const previewerCss = fs.readFileSync(path.join(rootDir, 'src', 'css', 'previewer.css'), 'utf-8');
        const ktmNewHtml = fs.readFileSync(path.join(rootDir, 'ktm-new.html'), 'utf-8');

        const inlineCodeRuleRegex = /code,\s*tt\s*\{([^}]+)\}/;
        const previewerMatch = previewerCss.match(inlineCodeRuleRegex);
        assert(previewerMatch, 'previewer.css must define code, tt style block');
        const previewerRuleBody = previewerMatch[1];
        assert(!/white-space:\s*nowrap/.test(previewerRuleBody),
            'previewer.css code, tt must not set white-space: nowrap');
        assert(/white-space:\s*normal/.test(previewerRuleBody),
            'previewer.css code, tt must set white-space: normal');
        assert(/word-wrap:\s*break-word/.test(previewerRuleBody) && /overflow-wrap:\s*break-word/.test(previewerRuleBody),
            'previewer.css code, tt must set word-wrap: break-word and overflow-wrap: break-word');
        assert(/padding:\s*2px\s+5px/.test(previewerRuleBody),
            'previewer.css code, tt must set padding: 2px 5px to prevent underscore border overlap');

        const ktmNewMatch = ktmNewHtml.match(inlineCodeRuleRegex);
        assert(ktmNewMatch, 'ktm-new.html must define code, tt style block');
        const ktmNewRuleBody = ktmNewMatch[1];
        assert(!/white-space:\s*nowrap/.test(ktmNewRuleBody) &&
            /white-space:\s*normal/.test(ktmNewRuleBody) &&
            /word-wrap:\s*break-word/.test(ktmNewRuleBody) &&
            /overflow-wrap:\s*break-word/.test(ktmNewRuleBody) &&
            /padding:\s*2px\s+5px/.test(ktmNewRuleBody),
            'ktm-new.html code, tt must match previewer.css wrapping and padding rules');

        const previewEditions = ['ktm-dev.html', 'ktm-lite.html', 'ktm-std.html', 'ktm-full.html'];
        for (const edition of previewEditions) {
            const previewPath = path.join(rootDir, 'dist', 'preview', edition);
            const content = fs.readFileSync(previewPath, 'utf-8');
            const m = content.match(inlineCodeRuleRegex);
            assert(m, `dist/preview/${edition} must contain code, tt style block`);
            assert(!/white-space:\s*nowrap/.test(m[1]) &&
                /white-space:\s*normal/.test(m[1]) &&
                /padding:\s*2px\s+5px/.test(m[1]),
                `dist/preview/${edition} must embed updated code, tt wrapping and padding rules`);
        }
    });

    // Test 11: Video attachment player, print thumbnail, and responsive CSS embedded across all preview editions
    test('All preview editions and kantanUpdate.js embed video attachment handling and responsive/print CSS', () => {
        const kantanCss = fs.readFileSync(path.join(rootDir, 'src', 'css', 'kantan.css'), 'utf-8');
        assert(kantanCss.includes('#previewer video') && kantanCss.includes('max-width: 100%'),
            'kantan.css must define responsive #previewer video rule');
        assert(kantanCss.includes('#previewer img.kantan-video-print-thumb'),
            'kantan.css must define #previewer img.kantan-video-print-thumb rule for print thumbnail');

        const previewTargets = ['ktm-dev.html', 'ktm-lite.html', 'ktm-std.html', 'ktm-full.html', 'kantanUpdate.js'];
        for (const target of previewTargets) {
            const targetPath = path.join(rootDir, 'dist', 'preview', target);
            const content = fs.readFileSync(targetPath, 'utf-8');
            assert(content.includes('isVideoAttachment'), `dist/preview/${target} must embed isVideoAttachment`);
            assert(content.includes('getCachedVideoBlobUrl'), `dist/preview/${target} must embed getCachedVideoBlobUrl`);
            assert(content.includes('uncacheVideoUrl'), `dist/preview/${target} must embed uncacheVideoUrl`);
            assert(content.includes('ensureVideoPlayerAttrs'), `dist/preview/${target} must embed ensureVideoPlayerAttrs`);
            assert(content.includes('kantan-video-print-thumb'), `dist/preview/${target} must embed kantan-video-print-thumb support`);
            assert(content.includes('#previewer video'), `dist/preview/${target} must embed #previewer video CSS`);
        }
    });

    // Test 12: Qiita Note syntax plugin, scoped CSS, and third-party notices embedded across all preview editions
    test('All preview editions and kantanUpdate.js embed Qiita Note syntax plugin, scoped CSS, and license notices', () => {
        const noticesPath = path.join(rootDir, 'THIRD_PARTY_NOTICES.md');
        assert(fs.existsSync(noticesPath), 'THIRD_PARTY_NOTICES.md must exist in repository root');
        const noticesContent = fs.readFileSync(noticesPath, 'utf-8');
        assert(noticesContent.includes('qiita_marker') && noticesContent.includes('qiita-markdown'),
            'THIRD_PARTY_NOTICES.md must describe qiita_marker and qiita-markdown');
        assert(noticesContent.includes('Copyright (c) 2015 Garen J. Torikian') &&
            noticesContent.includes('Copyright (c) 2021 Qiita Inc.') &&
            noticesContent.includes('Copyright (c) 2014 Ryo Nakamura'),
            'THIRD_PARTY_NOTICES.md must include upstream copyrights');

        const previewerCss = fs.readFileSync(path.join(rootDir, 'src', 'css', 'previewer.css'), 'utf-8');
        assert(previewerCss.includes('.note.info') && previewerCss.includes('.note.warn') && previewerCss.includes('.note.alert'),
            'src/css/previewer.css must define .note.info, .note.warn, and .note.alert');

        const previewTargets = ['ktm-dev.html', 'ktm-lite.html', 'ktm-std.html', 'ktm-full.html', 'kantanUpdate.js'];
        for (const target of previewTargets) {
            const targetPath = path.join(rootDir, 'dist', 'preview', target);
            const content = fs.readFileSync(targetPath, 'utf-8');
            assert(content.includes('QiitaMarker'), `dist/preview/${target} must embed QiitaMarker`);
            assert(content.includes('Copyright (c) 2015 Garen J. Torikian'),
                `dist/preview/${target} must embed qiita_marker copyright header`);
            assert(content.includes('Copyright (c) 2021 Qiita Inc.'),
                `dist/preview/${target} must embed Qiita Inc. copyright header`);
            assert(content.includes('Copyright (c) 2014 Ryo Nakamura'),
                `dist/preview/${target} must embed qiita-markdown copyright header`);
            if (target.endsWith('.html')) {
                assert(content.includes('id="qiitaMarkerJs"'), `dist/preview/${target} must embed script id="qiitaMarkerJs"`);
                assert(content.includes('.note.info'), `dist/preview/${target} must embed .note.info CSS`);
            }
        }
    });

    console.log(`\nBuild Integrity Test Summary: ${passCount} passed, ${failCount} failed`);
    if (failCount > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests();
