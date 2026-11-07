/**
 * modules-unit.test.js
 * Unit tests for modularized KanTanMarkdown logic (PreviewMermaid, AttachmentManager,
 * SaveExport, SettingsUi, UpdateInit), 4-stage save pipeline, event deduplication,
 * and removal of legacy IE browser branches.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const PreviewMermaid = require('../src/js/modules/preview-mermaid');
const AttachmentManager = require('../src/js/modules/attachment-manager');
const SaveExport = require('../src/js/modules/save-export');
const SettingsUi = require('../src/js/modules/settings-ui');
const UpdateInit = require('../src/js/modules/update-init');
const BuildScript = require('../scripts/build');

function runTests() {
    console.log('--- Running Modules & Save/Update Unit Tests ---');
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

    // 1. PreviewMermaid module tests
    test('PreviewMermaid.replaceAttachUrlInCss resolves attach: URLs and preserves unresolved ones', () => {
        const css = 'body { background: url("attach:bg.png"); } .icon { background: url("attach:missing.png"); }';
        const resolved = PreviewMermaid.replaceAttachUrlInCss(css, (name) => {
            if (name === 'bg.png') return { blobOrBase64: 'blob:https://example.com/1234' };
            return null;
        });
        assert(resolved.includes('url("blob:https://example.com/1234")'));
        assert(resolved.includes('url("attach:missing.png")'));
    });

    test('PreviewMermaid.parseLinesForHeadingSync identifies ATX, Setext, and HTML headings while ignoring code fences', () => {
        const md = [
            '# Heading 1',
            'Paragraph',
            '```',
            '# Not a heading inside fence',
            '```',
            'Setext H2',
            '---------',
            '<h3>HTML H3</h3>'
        ].join('\n');
        const lines = PreviewMermaid.parseLinesForHeadingSync(md, md.length, 4);
        assert.strictEqual(lines[0], '# Heading 1');
        assert.strictEqual(lines[3], '');
        assert.strictEqual(lines[5], '# Setext H2');
        assert.strictEqual(lines[7], '# HTML H3</h3>');
    });

    // 2. AttachmentManager module tests
    test('AttachmentManager.resolveUniqueAttachName avoids collisions with _2, _3 suffixes', () => {
        const existing = new Set(['image.png', 'image_2.png', 'archive']);
        assert.strictEqual(AttachmentManager.resolveUniqueAttachName('new.png', (n) => existing.has(n)), 'new.png');
        assert.strictEqual(AttachmentManager.resolveUniqueAttachName('image.png', (n) => existing.has(n)), 'image_3.png');
        assert.strictEqual(AttachmentManager.resolveUniqueAttachName('archive', (n) => existing.has(n)), 'archive_2');
    });

    test('AttachmentManager.validateAttachmentRename rejects empty or duplicate names and accepts valid ones', () => {
        const existing = new Set(['a.png', 'b.png']);
        assert.deepStrictEqual(AttachmentManager.validateAttachmentRename('a.png', 'a.png', (n) => existing.has(n)), { valid: true, unchanged: true });
        assert.deepStrictEqual(AttachmentManager.validateAttachmentRename('   ', 'a.png', (n) => existing.has(n)), { valid: false, reason: 'empty' });
        assert.deepStrictEqual(AttachmentManager.validateAttachmentRename('b.png', 'a.png', (n) => existing.has(n)), { valid: false, reason: 'duplicate' });
        assert.deepStrictEqual(AttachmentManager.validateAttachmentRename('c.png', 'a.png', (n) => existing.has(n)), { valid: true, unchanged: false });
    });

    test('AttachmentManager.base64ToBlob and buildAttachmentInsertTag handle image and binary attachments', () => {
        const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
        const blob = AttachmentManager.base64ToBlob(dataUrl);
        assert.strictEqual(blob.type, 'image/png');
        assert(blob.size > 0);
        assert.strictEqual(AttachmentManager.buildAttachmentInsertTag('pic.png', dataUrl, 'markdown'), '<img src="attach:pic.png">');
        assert.strictEqual(AttachmentManager.buildAttachmentInsertTag('pic.png', dataUrl, 'css'), 'url("attach:pic.png")');
        assert.strictEqual(AttachmentManager.buildAttachmentInsertTag('doc.pdf', 'data:application/pdf;base64,JVBERi0=', 'markdown'), '<a href="attach:doc.pdf">doc.pdf</a>');
    });

    test('AttachmentManager.isVideoAttachment, buildAttachmentInsertTag, and extractAttachName handle video MIME, fallback extensions, empty data, malformed URLs, and special characters', () => {
        const mp4DataUrl = 'data:video/mp4;base64,AAAAIGZ0eXBpc29t';
        const webmDataUrl = 'data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC';
        const octetDataUrl = 'data:application/octet-stream;base64,AAAAIGZ0eXBpc29t';
        const emptyMimeDataUrl = 'data:;base64,AAAAIGZ0eXBpc29t';
        const pngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
        const pdfDataUrl = 'data:application/pdf;base64,JVBERi0=';

        // Video MIME detection
        assert.strictEqual(AttachmentManager.isVideoAttachment('_autounattend.xml_.mp4', mp4DataUrl), true);
        assert.strictEqual(AttachmentManager.isVideoAttachment('clip.bin', webmDataUrl), true);

        // Extension fallback only when MIME is application/octet-stream or empty
        assert.strictEqual(AttachmentManager.isVideoAttachment('movie.mp4', octetDataUrl), true);
        assert.strictEqual(AttachmentManager.isVideoAttachment('movie.webm', emptyMimeDataUrl), true);
        assert.strictEqual(AttachmentManager.isVideoAttachment('movie.mov', octetDataUrl), true);
        assert.strictEqual(AttachmentManager.isVideoAttachment('readme.txt', octetDataUrl), false);

        // Explicit non-video MIME must not be treated as video even with .mp4 extension
        assert.strictEqual(AttachmentManager.isVideoAttachment('fake.mp4', pngDataUrl), false);
        assert.strictEqual(AttachmentManager.isVideoAttachment('fake.mp4', pdfDataUrl), false);

        // Empty data or missing attachment must return false
        assert.strictEqual(AttachmentManager.isVideoAttachment('empty.mp4', ''), false);
        assert.strictEqual(AttachmentManager.isVideoAttachment('empty.mp4', 'data:video/mp4;base64,'), false);
        assert.strictEqual(AttachmentManager.isVideoAttachment('empty.mp4', null), false);

        // Video insert tag generation for markdown and css tabs
        assert.strictEqual(
            AttachmentManager.buildAttachmentInsertTag('_autounattend.xml_.mp4', mp4DataUrl, 'markdown'),
            '<a href="attach:_autounattend.xml_.mp4">_autounattend.xml_.mp4</a><br>\n<video controls preload="metadata" playsinline src="attach:_autounattend.xml_.mp4"></video>'
        );
        assert.strictEqual(AttachmentManager.buildAttachmentInsertTag('_autounattend.xml_.mp4', mp4DataUrl, 'css'), '');

        // Special characters (Japanese, spaces, quotes, ampersand) in filename
        const specialName = '日本語 動画 "1" & 2.mp4';
        const tagWithSpecial = AttachmentManager.buildAttachmentInsertTag(specialName, mp4DataUrl, 'markdown');
        assert(tagWithSpecial.includes('href="attach:日本語 動画 &quot;1&quot; &amp; 2.mp4"'));
        assert(tagWithSpecial.includes('>日本語 動画 "1" &amp; 2.mp4</a><br>\n<video controls preload="metadata" playsinline src="attach:日本語 動画 &quot;1&quot; &amp; 2.mp4"></video>'));

        // Safe attach: target extraction and malformed percent-encoding handling
        assert.strictEqual(AttachmentManager.extractAttachName('attach:_autounattend.xml_.mp4'), '_autounattend.xml_.mp4');
        assert.strictEqual(AttachmentManager.extractAttachName('attach:%E6%97%A5%E6%9C%AC%E8%AA%9E%20%E5%8B%95%E7%94%BB.mp4'), '日本語 動画.mp4');
        assert.strictEqual(AttachmentManager.extractAttachName('attach:%E0%A4%A'), '%E0%A4%A');
        assert.strictEqual(AttachmentManager.extractAttachName('https://example.com/video.mp4'), null);
        assert.strictEqual(AttachmentManager.extractAttachName(''), null);
    });

    // 4. SettingsUi module tests
    test('SettingsUi handles storage keys, zoom steps, A4 page breaks, and scroll ratio sync', () => {
        const mem = {};
        const mockStorage = {
            getItem: (k) => (k in mem ? mem[k] : null),
            setItem: (k, v) => { mem[k] = v; }
        };
        assert.strictEqual(SettingsUi.setStorageItem('dark-mode', true, mockStorage), true);
        assert.strictEqual(SettingsUi.getStorageItem('dark-mode', 'false', mockStorage), 'true');
        assert.strictEqual(SettingsUi.getNextEditorZoom(0.67), 1);
        assert.strictEqual(SettingsUi.getNextEditorZoom(2), 2);
        assert.strictEqual(SettingsUi.clampPaneWidthPercent(10), 20);
        assert.strictEqual(SettingsUi.clampPaneWidthPercent(95), 80);

        const pageHeight = SettingsUi.calculateA4PageHeight(210);
        assert(Math.abs(pageHeight - 297) < 0.01);
        assert.strictEqual(SettingsUi.shouldInsertPageBreak({
            elTop: 290, elBottom: 320, elHeight: 30, tagName: 'H2', nextBreak: 297, pageHeight: 297, index: 2
        }), true);
        assert.strictEqual(SettingsUi.calculateSyncedScrollTop(
            { scrollTop: 50, scrollHeight: 200, clientHeight: 100 },
            { scrollHeight: 500, clientHeight: 100 }
        ), 200);

        const w190Px = SettingsUi.mmToCssPx(190);
        const h277Px = SettingsUi.mmToCssPx(277);
        assert(Math.abs(w190Px - (190 * 96 / 25.4)) < 1e-6);
        assert(Math.abs(h277Px - (277 * 96 / 25.4)) < 1e-6);
        assert(Math.abs(SettingsUi.cssPxToMm(w190Px) - 190) < 1e-6);
        assert.strictEqual(SettingsUi.mmToCssPx(0), 0);
        assert.strictEqual(SettingsUi.mmToCssPx(-10), 0);
        assert.strictEqual(SettingsUi.mmToCssPx(NaN), 0);
        assert.strictEqual(SettingsUi.mmToCssPx(null), 0);
        assert.strictEqual(SettingsUi.cssPxToMm('invalid'), 0);

        const adoptedRes = SettingsUi.validateAndNormalizePrintProfile(SettingsUi.ADOPTED_PRINT_PROFILE);
        assert.strictEqual(adoptedRes.valid, true);
        assert.strictEqual(adoptedRes.measurementReady, true);
        assert.deepStrictEqual(adoptedRes.contentAreaMm, { width: 190, height: 277 });
        assert(SettingsUi.formatPrintProfileStatusText(adoptedRes).statusLabel.includes('準備完了'));

        const defaultMarginRes = SettingsUi.validateAndNormalizePrintProfile({
            schemaVersion: 1,
            source: { browser: 'Chrome' },
            paper: { widthMm: 210, heightMm: 297, landscape: false },
            margins: { mode: 'default', effectiveMm: null, storedCustomMarginsRaw: { marginTop: 28 }, storedCustomMarginsActive: false },
            scaling: { mode: 'custom', percent: 100 },
            headerFooterEnabled: false,
            backgroundsEnabled: true
        });
        assert.strictEqual(defaultMarginRes.valid, true);
        assert.strictEqual(defaultMarginRes.measurementReady, false);
        assert.strictEqual(defaultMarginRes.profile.margins.effectiveMm, null);
        assert(defaultMarginRes.reasons.includes('missing-effective-margins'));

        const landscapeRes = SettingsUi.validateAndNormalizePrintProfile({
            schemaVersion: 1,
            source: { browser: 'Chrome' },
            paper: { widthMm: 210, heightMm: 297, landscape: true },
            margins: { mode: 'custom', effectiveMm: { top: 10, right: 10, bottom: 10, left: 10 } },
            scaling: { mode: 'custom', percent: 100 },
            headerFooterEnabled: false,
            backgroundsEnabled: true
        });
        assert.strictEqual(landscapeRes.measurementReady, false);
        assert(landscapeRes.reasons.includes('landscape-orientation'));

        const invalidJsonRes = SettingsUi.validateAndNormalizePrintProfile('{ broken json');
        assert.strictEqual(invalidJsonRes.valid, false);
        assert.strictEqual(invalidJsonRes.measurementReady, false);
    });

    // 5. UpdateInit event registry deduplication and cleanup tests
    test('UpdateInit.createEventRegistry prevents duplicate event registration and cleanly removes all handlers on update', () => {
        let added = 0;
        let removed = 0;
        const mockEl = {
            addEventListener() { added++; },
            removeEventListener() { removed++; }
        };
        const registry = UpdateInit.createEventRegistry();
        const handler = () => {};

        registry.register(mockEl, 'click', handler);
        registry.register(mockEl, 'click', handler);
        assert.strictEqual(registry.count(), 1);
        assert.strictEqual(added, 1);

        registry.removeAll();
        assert.strictEqual(registry.count(), 0);
        assert.strictEqual(removed, 1);

        // Version comparison and downgrade prevention
        assert(UpdateInit.compareVersions('v3.20261102.1', 'v2.20261102.3') > 0);
        assert(UpdateInit.compareVersions('v2.20261102.3', 'v3.20261102.1') < 0);
        assert.strictEqual(UpdateInit.compareVersions('v3.20261102.1', 'v3.20261102.1'), 0);
        assert.strictEqual(UpdateInit.shouldUpdateDisplayedVersion('v3.20261102.1', 'v2.20261102.3'), false,
            'shouldUpdateDisplayedVersion must not downgrade v3.20261102.1 with stale v2.20261102.3');
        assert.strictEqual(UpdateInit.shouldUpdateDisplayedVersion('v2.20261102.3', 'v3.20261102.1'), true);
        assert.strictEqual(UpdateInit.shouldUpdateDisplayedVersion('v3.20261102.1', 'v3.20261102.1'), true);
        assert.strictEqual(UpdateInit.shouldUpdateDisplayedVersion('v3.20261102.1', ''), false);
    });

    // 6. Phase 5 verification: Legacy IE browser branches removed from custom JS
    test('Custom JS sources no longer contain legacy IE msSaveBlob, currentStyle, or webkitURL branches', () => {
        const kantanMdCode = fs.readFileSync(path.join(rootDir, 'src', 'js', 'kantanMarkdown.js'), 'utf-8');
        assert(!kantanMdCode.includes('msSaveBlob'), 'kantanMarkdown.js must not contain msSaveBlob');
        assert(!kantanMdCode.includes('currentStyle'), 'kantanMarkdown.js must not contain IE currentStyle');
        assert(!kantanMdCode.includes('webkitURL'), 'kantanMarkdown.js must not contain legacy webkitURL fallback');
    });

    // 7. Build pipeline script safety and Pages staging verification
    test('BuildScript.validateScriptSafety rejects raw closing </script tags and preparePagesSite stages only public files', () => {
        assert.throws(() => {
            BuildScript.validateScriptSafety('var a = "</script>";', 'test.js');
        }, /Unsafe closing <\/script tag/);

        const siteDir = BuildScript.preparePagesSite(rootDir, '_site_test_tmp');
        try {
            assert(fs.existsSync(path.join(siteDir, 'ktm-new.html')));
            assert(fs.existsSync(path.join(siteDir, 'dist', 'ktm-full.html')));
            assert(fs.existsSync(path.join(siteDir, 'dist', 'preview', 'ktm-full.html')));
            assert(!fs.existsSync(path.join(siteDir, 'node_modules')));
            assert(!fs.existsSync(path.join(siteDir, '.git')));
            assert(!fs.existsSync(path.join(siteDir, '.gear')));
        } finally {
            fs.rmSync(siteDir, { recursive: true, force: true });
        }
    });

    // 3. SaveExport 4-stage pipeline tests
    test('SaveExport 4-stage pipeline collects state, escapes markdown, serializes single HTML, and triggers download without data loss', () => {
        const mockDoc = {
            title: '* テスト文書',
            getElementById(id) {
                const map = {
                    editor: { value: '# テスト文書\n<html>タグと添付画像 <img src="attach:sample.png">' },
                    cssEditor: { value: 'body { color: #111; }' },
                    kantanVersion: { value: 'v2.20261102.3' },
                    kantanEdition: { value: 'full' }
                };
                return map[id] || null;
            },
            querySelectorAll(sel) {
                if (sel === '#fileList li') {
                    return [{
                        querySelector(q) {
                            if (q === 'script') return { title: 'sample.png', innerHTML: 'data:image/png;base64,AAAA' };
                            if (q === 'script.layerContent') return { innerHTML: 'data:image/png;base64,BBBB' };
                            if (q === 'script.trimInfo') return { innerHTML: '{"x":0,"y":0,"w":10,"h":10}' };
                            return null;
                        }
                    }];
                }
                if (sel === '#settings-panel input[type=checkbox]') {
                    return [
                        { id: 'setting-auto-sync', checked: true },
                        { id: 'setting-expand-tab', checked: true }
                    ];
                }
                return [];
            }
        };

        const state = SaveExport.collectDocumentSaveState(mockDoc);
        assert.strictEqual(state.title, 'テスト文書');
        assert.strictEqual(state.attachments.length, 1);
        assert.strictEqual(state.attachments[0].fileName, 'sample.png');
        assert.strictEqual(state.attachments[0].layerContent, 'data:image/png;base64,BBBB');
        assert.strictEqual(state.attachments[0].trimInfo, '{"x":0,"y":0,"w":10,"h":10}');
        assert.strictEqual(state.settings['setting-expand-tab'], true);

        const payload = SaveExport.prepareSavePayload(state, { isPreviewPath: true });
        assert.strictEqual(payload.cleanTitle, 'テスト文書');
        assert(payload.escapedMarkdown.includes('&lt;html>タグ'));
        assert(!payload.escapedMarkdown.includes('<html>'));
        assert.strictEqual(payload.updateScriptUrl, 'https://hiro-gj.github.io/KanTanMarkdown/dist/preview/kantanUpdate.js');

        const html = SaveExport.serializeSingleHtmlDocument(
            '<head><title>' + payload.cleanTitle + '</title></head><body><textarea id="editor">' +
            payload.escapedMarkdown + '</textarea><script id="kantanMarkdownJs">console.log(1);</script><div class="stray"></div>'
        );
        assert(html.startsWith('<!doctype html>\n<html>\n'));
        assert(html.endsWith('</script>\n</body>\n</html>'));
        assert(!html.includes('<div class="stray">'));

        let clickedDownload = null;
        const downloadOk = SaveExport.triggerBlobDownload(
            new Blob([html], { type: 'text/html;charset=utf-8' }),
            payload.cleanTitle + '.html',
            {
                createElement() {
                    return {
                        download: '',
                        href: '',
                        click() { clickedDownload = { download: this.download, href: this.href }; }
                    };
                }
            },
            {
                URL: { createObjectURL() { return 'blob:mock-save-url'; } }
            }
        );
        assert.strictEqual(downloadOk, true);
        assert.deepStrictEqual(clickedDownload, { download: 'テスト文書.html', href: 'blob:mock-save-url' });

        // Save exclusion of measurement iframe and page-break overlay
        let removedCount = 0;
        let attrClearedCount = 0;
        SaveExport.cleanupTemporaryDomForSave({
            querySelectorAll(sel) {
                if (sel.includes('#kantan-print-measure-frame')) {
                    return [{ parentNode: { removeChild() { removedCount++; } } }, { parentNode: { removeChild() { removedCount++; } } }];
                }
                if (sel.includes('[data-kantan-block-id]')) {
                    return [{ removeAttribute() { attrClearedCount++; } }];
                }
                return [];
            },
            getElementById() { return { value: 'profile.json' }; }
        });
        assert.strictEqual(removedCount, 2);
        assert.strictEqual(attrClearedCount, 2);

        const serializedClean = SaveExport.serializeSingleHtmlDocument(
            '<head></head><body><div id="previewer"><div id="kantan-page-break-overlay"><div class="page-break-indicator"></div></div></div>' +
            '<iframe id="kantan-print-measure-frame"></iframe><script id="kantanMarkdownJs">1;</script>'
        );
        assert(!serializedClean.includes('kantan-print-measure-frame'));
        assert(!serializedClean.includes('kantan-page-break-overlay'));

        // Boundary model calculation & screen coordinate mapping tests
        const emptyModel = SettingsUi.computePageBreakModel([], { pageHeightPx: 1000, pageWidthPx: 700 });
        assert.strictEqual(emptyModel.totalPages, 1);
        assert.strictEqual(emptyModel.breaks.length, 0);

        const complexBlocks = [
            { blockIndex: 0, tagName: 'H1', top: 0, bottom: 50, height: 50, isHeading: true },
            { blockIndex: 1, tagName: 'P', top: 60, bottom: 1000, height: 940 },
            { blockIndex: 2, tagName: 'DIV', top: 1010, bottom: 1300, height: 290, avoidBreakInside: true },
            { blockIndex: 3, tagName: 'DIV', top: 1850, bottom: 2250, height: 400, avoidBreakInside: true },
            { blockIndex: 4, tagName: 'H2', top: 2800, bottom: 2840, height: 40, isHeading: true, avoidBreakAfter: true },
            { blockIndex: 5, tagName: 'DIV', top: 2845, bottom: 3000, height: 155, avoidBreakInside: true },
            { blockIndex: 6, tagName: 'TABLE', top: 3010, bottom: 3950, height: 940, subItems: [
                { subIndex: 0, top: 3010, bottom: 3500, height: 490 },
                { subIndex: 1, top: 3500, bottom: 3950, height: 450 }
            ] },
            { blockIndex: 7, tagName: 'P', top: 3960, bottom: 4100, height: 140, forceBreakBefore: true },
            { blockIndex: 8, tagName: 'PRE', top: 4110, bottom: 6500, height: 2390 }
        ];
        const model1 = SettingsUi.computePageBreakModel(complexBlocks, { pageHeightPx: 1000, pageWidthPx: 700 });
        const model2 = SettingsUi.computePageBreakModel(complexBlocks, { pageHeightPx: 1000, pageWidthPx: 700 });
        assert.deepStrictEqual(model1, model2);
        assert(model1.breaks.some(b => b.blockIndex === 2 && b.anchorType === 'before-block' && b.pageNumber === 2));
        assert(model1.breaks.some(b => b.blockIndex === 3 && b.reason === 'avoid-break-inside' && b.pageNumber === 3));
        assert(model1.breaks.some(b => b.blockIndex === 4 && b.reason === 'heading-keep-with-next' && b.pageNumber === 4));
        assert(model1.breaks.some(b => b.blockIndex === 6 && b.anchorType === 'inside-block' && b.subIndex === 1 && b.pageNumber === 5));
        assert(model1.breaks.some(b => b.blockIndex === 7 && b.reason === 'explicit-break-before' && b.pageNumber === 6));
        assert(model1.breaks.filter(b => b.blockIndex === 8 && b.anchorType === 'inside-block').length >= 2);

        const screenBlocks = complexBlocks.map(b => ({
            blockIndex: b.blockIndex, isToc: false, top: b.top * 1.2, bottom: b.bottom * 1.2, height: b.height * 1.2,
            subItems: b.subItems ? b.subItems.map(s => ({ subIndex: s.subIndex, top: s.top * 1.2, bottom: s.bottom * 1.2 })) : []
        }));
        const snapshotBefore = JSON.stringify(screenBlocks);
        const mapped = SettingsUi.mapBreaksToScreenPositions(model1.breaks, screenBlocks);
        assert.strictEqual(JSON.stringify(screenBlocks), snapshotBefore);
        assert.strictEqual(mapped.length, model1.breaks.length);
    });

    // 8. Core kantanMarkdown.js delegation to all 5 modules (R3)
    test('kantanMarkdown.js delegates core preview, attachment, settings, update, and 4-stage save logic to KantanModules', () => {
        const kantanMdCode = fs.readFileSync(path.join(rootDir, 'src', 'js', 'kantanMarkdown.js'), 'utf-8');
        assert(kantanMdCode.includes('SaveExport.collectDocumentSaveState(document)'),
            'getHTMLForSave must call SaveExport.collectDocumentSaveState');
        assert(kantanMdCode.includes('SaveExport.prepareSavePayload(saveState'),
            'getHTMLForSave must call SaveExport.prepareSavePayload');
        assert(kantanMdCode.includes('SaveExport.serializeSingleHtmlDocument('),
            'getHTMLForSave must call SaveExport.serializeSingleHtmlDocument');
        assert(kantanMdCode.includes('SaveExport.triggerBlobDownload('),
            'save/download must call SaveExport.triggerBlobDownload');
        assert(kantanMdCode.includes('PreviewMermaid.normalizeMermaidText('),
            'normalizeMermaidText must delegate to PreviewMermaid.normalizeMermaidText');
        assert(kantanMdCode.includes('PreviewMermaid.replaceAttachUrlInCss('),
            'replaceAttachURL must delegate to PreviewMermaid.replaceAttachUrlInCss');
        assert(kantanMdCode.includes('PreviewMermaid.parseLinesForHeadingSync('),
            'processForHeadingSync must delegate to PreviewMermaid.parseLinesForHeadingSync');
        assert(kantanMdCode.includes('AttachmentManager.resolveUniqueAttachName('),
            'addAttachFileElement must delegate to AttachmentManager.resolveUniqueAttachName');
        assert(kantanMdCode.includes('AttachmentManager.validateAttachmentRename('),
            'onFileNameChanged must delegate to AttachmentManager.validateAttachmentRename');
        assert(kantanMdCode.includes('validateAndNormalizePrintProfile(') &&
            kantanMdCode.includes('computePageBreakModel(') &&
            kantanMdCode.includes('mapBreaksToScreenPositions('),
            'updatePageBreaks must delegate to SettingsUi');
        assert(kantanMdCode.includes('SaveExport.cleanupTemporaryDomForSave(document)'),
            'getHTMLForSave must call SaveExport.cleanupTemporaryDomForSave');
        assert(kantanMdCode.includes('UpdateInit.createEventRegistry(') &&
            kantanMdCode.includes('UpdateInit.resolveUpdateScriptUrl('),
            'event registration and update URL resolution must delegate to UpdateInit');
    });

    // 9. Release promotion immutability, manifest verification, and version mismatch rejection (R1, R2, R4)
    test('promoteRelease copies verified preview artifacts without mutation and rejects version or manifest mismatches', () => {
        const { promoteRelease, ARTIFACT_FILES, computeSha256 } = require('../scripts/promote-release');
        const tmpDir = fs.mkdtempSync(path.join(rootDir, 'dist', 'promo-test-'));
        try {
            fs.mkdirSync(path.join(tmpDir, 'dist', 'preview'), { recursive: true });
            fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
            fs.copyFileSync(path.join(rootDir, 'ktm-new.html'), path.join(tmpDir, 'ktm-new.html'));
            fs.copyFileSync(path.join(rootDir, 'src', 'kantanVersion.txt'), path.join(tmpDir, 'src', 'kantanVersion.txt'));
            const manifestSrc = path.join(rootDir, 'dist', 'preview', 'build-manifest.json');
            if (fs.existsSync(manifestSrc)) {
                fs.copyFileSync(manifestSrc, path.join(tmpDir, 'dist', 'preview', 'build-manifest.json'));
            }

            const expectedVer = fs.readFileSync(path.join(tmpDir, 'src', 'kantanVersion.txt'), 'utf-8').trim();
            const beforeHashes = {};
            for (const f of ARTIFACT_FILES) {
                const buf = fs.readFileSync(path.join(rootDir, 'dist', 'preview', f));
                beforeHashes[f] = computeSha256(buf);
                fs.writeFileSync(path.join(tmpDir, 'dist', 'preview', f), buf);
            }

            // Mismatched version tag must be rejected without mutating any preview file
            assert.throws(() => {
                promoteRelease({ rootDir: tmpDir, versionTag: 'v9.9.9-invalid', requireManifest: true });
            }, /does not match verified/);

            const manifestPath = path.join(tmpDir, 'dist', 'preview', 'build-manifest.json');
            const originalManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

            // Mismatched sourceSha must be rejected without mutating any preview file
            assert.throws(() => {
                promoteRelease({
                    rootDir: tmpDir,
                    versionTag: expectedVer,
                    expectedSourceSha: '0000000000000000000000000000000000000000',
                    requireManifest: true
                });
            }, /sourceSha/);

            // Missing or empty sourceSha in manifest must be rejected even when version and file hashes match
            const manifestWithoutSha = { ...originalManifest };
            delete manifestWithoutSha.sourceSha;
            fs.writeFileSync(manifestPath, JSON.stringify(manifestWithoutSha, null, 2), 'utf-8');
            assert.throws(() => {
                promoteRelease({
                    rootDir: tmpDir,
                    versionTag: expectedVer,
                    expectedSourceSha: originalManifest.sourceSha,
                    requireManifest: true
                });
            }, /missing a valid sourceSha/);

            // Restore valid manifest
            fs.writeFileSync(manifestPath, JSON.stringify(originalManifest, null, 2), 'utf-8');

            for (const f of ARTIFACT_FILES) {
                assert.strictEqual(computeSha256(fs.readFileSync(path.join(tmpDir, 'dist', 'preview', f))), beforeHashes[f],
                    `Rejected promotion must not mutate dist/preview/${f}`);
            }

            // Matching version tag and sourceSha must promote byte-for-byte with 100% SHA-256 identity
            const res = promoteRelease({
                rootDir: tmpDir,
                versionTag: expectedVer,
                expectedSourceSha: originalManifest.sourceSha,
                requireManifest: true
            });
            assert.strictEqual(res.ok, true);
            for (const f of ARTIFACT_FILES) {
                const afterPrev = computeSha256(fs.readFileSync(path.join(tmpDir, 'dist', 'preview', f)));
                const afterRel = computeSha256(fs.readFileSync(path.join(tmpDir, 'dist', f)));
                assert.strictEqual(afterPrev, beforeHashes[f], `dist/preview/${f} must remain unchanged after promotion`);
                assert.strictEqual(afterRel, beforeHashes[f], `dist/${f} must match verified preview SHA-256`);
            }
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    // 10. Release promotion from a dedicated verified-artifact directory with rebuild cross-check and master worktree sync (R2)
    test('promoteRelease verifies external artifacts against a rebuild, syncs a master worktree byte-for-byte, and never rewrites preview files', () => {
        const { promoteRelease, ARTIFACT_FILES, computeSha256 } = require('../scripts/promote-release');
        const tmpDir = fs.mkdtempSync(path.join(rootDir, 'dist', 'promo-r2-test-'));
        try {
            const tagTree = path.join(tmpDir, 'tag-commit');      // checked-out release commit (verification tree)
            const masterTree = path.join(tmpDir, 'master');       // worktree of origin/master, advanced beyond the tag
            const artifactDir = path.join(tmpDir, 'verified', 'dist', 'preview'); // downloaded CI artifact
            for (const dir of [path.join(tagTree, 'dist', 'preview'), path.join(tagTree, 'src'), path.join(masterTree, 'dist', 'preview'), path.join(masterTree, 'src'), artifactDir]) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const version = fs.readFileSync(path.join(rootDir, 'src', 'kantanVersion.txt'), 'utf-8').trim();
            fs.writeFileSync(path.join(tagTree, 'src', 'kantanVersion.txt'), version + '\n');
            fs.writeFileSync(path.join(masterTree, 'src', 'kantanVersion.txt'), 'v9.99999999.9\n');
            fs.copyFileSync(path.join(rootDir, 'ktm-new.html'), path.join(tagTree, 'ktm-new.html'));
            fs.copyFileSync(path.join(rootDir, 'ktm-new.html'), path.join(masterTree, 'ktm-new.html'));

            const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'dist', 'preview', 'build-manifest.json'), 'utf-8'));
            const verifiedHashes = {};
            const masterPreviewHashes = {};
            for (const f of ARTIFACT_FILES) {
                const buf = fs.readFileSync(path.join(rootDir, 'dist', 'preview', f));
                verifiedHashes[f] = computeSha256(buf);
                fs.writeFileSync(path.join(artifactDir, f), buf);        // CI artifact of the tag commit
                fs.writeFileSync(path.join(tagTree, 'dist', 'preview', f), buf); // rebuilt from the tag commit
                const newerPreview = Buffer.concat([buf, Buffer.from('\n<!-- newer master preview -->\n')]);
                fs.writeFileSync(path.join(masterTree, 'dist', 'preview', f), newerPreview); // master moved on
                masterPreviewHashes[f] = computeSha256(newerPreview);
            }
            fs.writeFileSync(path.join(artifactDir, 'build-manifest.json'), JSON.stringify(manifest, null, 2));
            fs.writeFileSync(path.join(tagTree, 'dist', 'preview', 'build-manifest.json'), JSON.stringify(manifest, null, 2));

            // Rebuild mismatch (artifact does not belong to the checked-out commit) must be rejected before any copy
            const tamperedRebuild = path.join(tmpDir, 'tampered-rebuild');
            fs.mkdirSync(tamperedRebuild, { recursive: true });
            for (const f of ARTIFACT_FILES) {
                fs.writeFileSync(path.join(tamperedRebuild, f), fs.readFileSync(path.join(artifactDir, f)) + ' ');
            }
            assert.throws(() => promoteRelease({
                rootDir: tagTree,
                versionTag: version,
                expectedSourceSha: manifest.sourceSha,
                requireManifest: true,
                artifactDir,
                crossCheckDir: tamperedRebuild,
                syncRoots: [masterTree]
            }), /cross-check failure/);
            assert(!fs.existsSync(path.join(tagTree, 'dist', 'ktm-full.html')), 'rejected promotion must not copy anything into dist/');
            assert(!fs.existsSync(path.join(masterTree, 'dist', 'ktm-full.html')), 'rejected promotion must not touch the sync root');

            // Misconfiguration guards
            assert.throws(() => promoteRelease({ rootDir: tagTree, versionTag: version, artifactDir: path.join(tagTree, 'dist') }), /must not be the production dist/);
            assert.throws(() => promoteRelease({ rootDir: tagTree, versionTag: version, artifactDir, syncRoots: [tagTree] }), /sync root must differ/);

            const res = promoteRelease({
                rootDir: tagTree,
                versionTag: version,
                expectedSourceSha: manifest.sourceSha,
                requireManifest: true,
                artifactDir,
                crossCheckDir: path.join(tagTree, 'dist', 'preview'),
                syncRoots: [masterTree]
            });
            assert.strictEqual(res.ok, true);
            assert.strictEqual(res.targetDirs.length, 2);

            for (const f of ARTIFACT_FILES) {
                assert.strictEqual(computeSha256(fs.readFileSync(path.join(artifactDir, f))), verifiedHashes[f], `verified artifact ${f} must stay unchanged`);
                assert.strictEqual(computeSha256(fs.readFileSync(path.join(tagTree, 'dist', f))), verifiedHashes[f], `tag tree dist/${f} must match verified SHA-256`);
                assert.strictEqual(computeSha256(fs.readFileSync(path.join(masterTree, 'dist', f))), verifiedHashes[f], `master worktree dist/${f} must match verified SHA-256`);
                assert.strictEqual(computeSha256(fs.readFileSync(path.join(masterTree, 'dist', 'preview', f))), masterPreviewHashes[f],
                    `master worktree dist/preview/${f} must keep the newer preview (release must not roll preview back)`);
            }
            assert.strictEqual(fs.readFileSync(path.join(masterTree, 'src', 'kantanVersion.txt'), 'utf-8').trim(), 'v9.99999999.9',
                'promotion must never rewrite src/kantanVersion.txt of the sync root');
            assert(fs.existsSync(path.join(masterTree, 'dist', 'build-manifest.json')), 'manifest must accompany promoted artifacts in the sync root');

            // Only the production size row is rewritten in the sync root; the preview row keeps the newer preview sizes
            const ktmNew = fs.readFileSync(path.join(masterTree, 'ktm-new.html'), 'utf-8');
            const previewIdx = ktmNew.indexOf('dist/preview/ktm-full.html');
            assert(previewIdx !== -1 && /<td>空の容量<\/td>/.test(ktmNew.slice(previewIdx)), 'preview size row must remain present');
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    console.log(`\nModules Unit Test Summary: ${passCount} passed, ${failCount} failed`);
    if (failCount > 0) process.exit(1);
    else process.exit(0);
}

runTests();


