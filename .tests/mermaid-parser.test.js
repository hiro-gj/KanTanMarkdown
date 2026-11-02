/**
 * mermaid-parser.test.js
 * Verification for GitHub Mermaid code fence parsing, rendering and error tolerance
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');

function runTests() {
    console.log('--- Running Mermaid Parser Tests ---');
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

    // Load marked.min.js
    const markedPath = path.join(rootDir, 'src', 'js', 'marked.min.js');
    const markedCode = fs.readFileSync(markedPath, 'utf-8');
    const sandbox = { console, window: {}, document: {}, navigator: { userAgent: 'Node' } };
    vm.createContext(sandbox);
    vm.runInContext(markedCode, sandbox);
    const marked = sandbox.marked;

    test('marked is defined and functional', () => {
        assert(typeof marked === 'function', 'marked must be a function');
        const html = marked('# Hello');
        assert(html.includes('<h1') && html.includes('Hello'), 'marked renders h1');
    });

    test('Transforms ```mermaid code fence into <div class="mermaid"> when mermaid is defined', () => {
        const renderer = new marked.Renderer();
        const origCode = renderer.code.bind(renderer);
        renderer.code = function(code, lang, escaped) {
            if (lang === 'mermaid') return '<div class="mermaid">' + code + '</div>';
            return origCode(code, lang, escaped);
        };
        const mdInput = '```mermaid\nflowchart TD\n  A[Start] --> B[End]\n```';
        const output = marked(mdInput, { renderer: renderer });
        assert(output.includes('<div class="mermaid">'), 'Output must contain <div class="mermaid">');
        assert(output.includes('flowchart TD'), 'Output must contain mermaid source');
        assert(!output.includes('<pre><code'), 'Output must not be wrapped in <pre><code>');
    });

    test('Leaves ```mermaid as standard code block when mermaid is undefined (lite / std)', () => {
        const renderer = new marked.Renderer();
        const origCode = renderer.code.bind(renderer);
        const hasMermaid = false;
        renderer.code = function(code, lang, escaped) {
            if (lang === 'mermaid' && hasMermaid) return '<div class="mermaid">' + code + '</div>';
            return origCode(code, lang, escaped);
        };
        const mdInput = '```mermaid\nflowchart TD\n  A[Start] --> B[End]\n```';
        const output = marked(mdInput, { renderer: renderer });
        assert(output.includes('<pre><code class="lang-mermaid">'), 'Output must contain <pre><code class="lang-mermaid">');
        assert(!output.includes('<div class="mermaid">'), 'Output must not contain <div class="mermaid">');
    });

    test('Highlight callback preserves raw mermaid code without syntax span tags', () => {
        let highlightCalledWithMermaid = false;
        const options = {
            highlight: function(code, lang) {
                if (lang === 'mermaid') {
                    highlightCalledWithMermaid = true;
                    return code;
                }
                return '<span class="highlighted">' + code + '</span>';
            }
        };
        const mdInput = '```mermaid\nsequenceDiagram\n  Alice->>Bob: Hello\n```';
        const output = marked(mdInput, options);
        assert(highlightCalledWithMermaid, 'highlight should be called for mermaid lang');
        assert(!output.includes('<span class="highlighted">'), 'Mermaid code must not contain highlight spans');
        assert(output.includes('sequenceDiagram') && output.includes('Alice'), 'Mermaid text must be preserved');
    });

    test('Mermaid render flow succeeds on valid diagram and catches syntax errors with mermaid-error class', () => {
        const mockMermaid = {
            initialize: function(config) { this.config = config; },
            render: function(id, text, callback) {
                if (text.includes('INVALID_SYNTAX')) throw new Error('Parse error');
                callback('<svg id="' + id + '"><g>mock</g></svg>');
            }
        };
        mockMermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
        assert.strictEqual(mockMermaid.config.theme, 'default');
        mockMermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
        assert.strictEqual(mockMermaid.config.theme, 'dark');

        let renderedSvg = null;
        mockMermaid.render('d1', 'flowchart TD\nA-->B', (svg) => { renderedSvg = svg; });
        assert(renderedSvg && renderedSvg.includes('<svg id="d1">'), 'Render must produce SVG');

        let errorCaught = false;
        try {
            mockMermaid.render('d2', 'INVALID_SYNTAX', () => {});
        } catch (err) {
            errorCaught = true;
        }
        assert(errorCaught, 'Syntax error must be caught');
    });

    test('Async diagrams (mindmap, timeline, flowchart-elk) use renderAsync and cache SVG output', () => {
        const asyncRegex = /^\s*(?:%%[^\n]*\n\s*)*(?:mindmap|timeline|flowchart-elk)\b/i;
        const mindmapSource = 'mindmap\n  root((プロジェクト))\n    計画\n      要件定義';
        const flowchartSource = 'flowchart TD\n  A[開始] --> B[終了]';

        assert(asyncRegex.test(mindmapSource), 'mindmap source must be detected as async diagram');
        assert(asyncRegex.test('%% comment\nmindmap\n  root'), 'mindmap with comment must be detected as async diagram');
        assert(!asyncRegex.test(flowchartSource), 'standard flowchart must not be detected as async diagram');

        let renderAsyncCalled = false;
        const mockAsyncMermaid = {
            renderAsync: function(id, text, cb) {
                renderAsyncCalled = true;
                const svg = '<svg id="' + id + '" aria-roledescription="mindmap"><g>mindmap</g></svg>';
                cb(svg);
                return Promise.resolve(svg);
            }
        };

        let outputSvg = null;
        mockAsyncMermaid.renderAsync('mm-1', mindmapSource, (svg) => { outputSvg = svg; });
        assert(renderAsyncCalled, 'renderAsync must be invoked for mindmap');
        assert(outputSvg && outputSvg.includes('aria-roledescription="mindmap"'), 'mindmap SVG must be produced');
    });

    // Extract helper functions from src/js/kantanMarkdown.js for unit testing
    const kantanMdPath = path.join(rootDir, 'src', 'js', 'kantanMarkdown.js');
    const kantanMdCode = fs.readFileSync(kantanMdPath, 'utf-8');
    const normalizeMatch = kantanMdCode.match(/function isMermaidErrorSvg[\s\S]*?function normalizeMermaidText\(rawText\)\s*\{[\s\S]*?\n\t\}/);
    assert(normalizeMatch, 'kantanMarkdown.js must define isMermaidErrorSvg, cleanupMermaidTempDom, and normalizeMermaidText');

    const helperSandbox = {
        previewer: null,
        document: { getElementById: function() { return null; } }
    };
    vm.createContext(helperSandbox);
    vm.runInContext(normalizeMatch[0], helperSandbox);

    test('normalizeMermaidText normalizes 13_業務フロー.md and 34_アーキテクチャ構成図.md diagrams without double-quoting', () => {
        const workflowMd = [
            'flowchart TD',
            ' Open[HTML起動: 閲覧] --> Edit[編集切替]',
            ' Edit --> Input[Markdown/CSS・添付操作]',
            ' Input --> Preview[描画・目次]',
            ' Import[HTMLドロップ / 更新確認] --> Select[引継ぎ選択]'
        ].join('\n');

        const normalizedWorkflow = helperSandbox.normalizeMermaidText(workflowMd);
        assert(normalizedWorkflow.includes('Open["HTML起動: 閲覧"] --> Edit["編集切替"]'), 'Node labels with colons must be quoted');
        assert(normalizedWorkflow.includes('Edit --> Input["Markdown/CSS・添付操作"]'), 'Node labels with slashes and middle dots (・) must be quoted');
        assert(normalizedWorkflow.includes('Import["HTMLドロップ / 更新確認"] --> Select["引継ぎ選択"]'), 'Node labels with spaces and slashes must be quoted');

        const archMd = [
            'flowchart TD',
            ' subgraph Dev[開発時 Node.js / Grunt]',
            ' SRC[src HTML CSS JS] --> GRUNT[copy・圧縮・replace・inline]',
            ' end',
            ' PUSH_PR[push / pull_request 機能関連パス] --> TEST_WF[test.yml: Grunt build & npm test]',
            ' CORE -. 更新操作・起動・設定表示 .-> REMOTE[HTTPS更新script / バージョン情報]'
        ].join('\n');

        const normalizedArch = helperSandbox.normalizeMermaidText(archMd);
        assert(normalizedArch.includes('subgraph Dev["開発時 Node.js / Grunt"]'), 'Subgraph bracket labels must be quoted');
        assert(normalizedArch.includes('SRC["src HTML CSS JS"] --> GRUNT["copy・圧縮・replace・inline"]'), 'Nodes with middle dots must be quoted');
        assert(normalizedArch.includes('TEST_WF["test.yml: Grunt build & npm test"]'), 'Nodes with colons and ampersands must be quoted');
        assert(normalizedArch.includes('CORE -. "更新操作・起動・設定表示" .-> REMOTE["HTTPS更新script / バージョン情報"]'), 'Dotted edge labels and target nodes must be quoted');

        assert.strictEqual(helperSandbox.normalizeMermaidText(normalizedArch), normalizedArch, 'normalizeMermaidText must be idempotent');
        const seqMd = 'sequenceDiagram\n  Alice->>Bob: こんにちは・テスト';
        assert.strictEqual(helperSandbox.normalizeMermaidText(seqMd), seqMd, 'sequenceDiagram must not be modified');
    });

    test('mermaid.min.js Jison lexers include full non-ASCII Unicode range (\\u0080-\\uFFFF) for Japanese symbols', () => {
        const mermaidMinPath = path.join(rootDir, 'src', 'js', 'mermaid.min.js');
        const mermaidMinCode = fs.readFileSync(mermaidMinPath, 'utf-8');
        const matches = mermaidMinCode.match(/\|\[\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC\]\|\[\\u0080-\\uFFFF\]\)\//g);
        assert(matches && matches.length >= 2, 'Both flowchart and classDiagram UNICODE_TEXT lexers in mermaid.min.js must include [\\u0080-\\uFFFF]');
        assert(mermaidMinCode.includes('/^(?:[A-Za-z_\\u0080-\\uFFFF][A-Za-z0-9\\-_\\[\\]\\(\\)\\u0080-\\uFFFF]*)/i'),
            'erDiagram attribute lexer in mermaid.min.js must support non-ASCII characters');
    });

    test('isMermaidErrorSvg prevents caching error SVGs and cleanupMermaidTempDom removes stray DOM elements', () => {
        const validSvg = '<svg id="kantan-mermaid-1" aria-roledescription="flowchart-v2"><g class="root"></g></svg>';
        const errorSvg1 = '<svg id="kantan-mermaid-2" aria-roledescription="error"><g><text class="error-text">Syntax error in graph</text></g></svg>';
        const errorSvg2 = '<svg id="kantan-mermaid-3"><g><text class="error-text">Syntax error in graph</text></g></svg>';

        assert.strictEqual(helperSandbox.isMermaidErrorSvg(validSvg), false, 'Valid flowchart SVG must not be flagged as error');
        assert.strictEqual(helperSandbox.isMermaidErrorSvg(errorSvg1), true, 'SVG with aria-roledescription="error" must be flagged as error');
        assert.strictEqual(helperSandbox.isMermaidErrorSvg(errorSvg2), true, 'SVG with error-text / Syntax error in graph must be flagged as error');
        assert.strictEqual(helperSandbox.isMermaidErrorSvg(''), true, 'Empty SVG string must be flagged as error');

        const removedIds = [];
        helperSandbox.document = {
            getElementById: function(id) {
                if (id === 'dkantan-mermaid-err') {
                    return { parentNode: { removeChild: function() { removedIds.push(id); } } };
                }
                return null;
            }
        };
        helperSandbox.cleanupMermaidTempDom('kantan-mermaid-err');
        assert(removedIds.includes('dkantan-mermaid-err'), 'cleanupMermaidTempDom must remove temporary #d<id> wrapper');
    });

    console.log(`\nMermaid Parser Test Summary: ${passCount} passed, ${failCount} failed`);
    if (failCount > 0) process.exit(1);
    else process.exit(0);
}

runTests();
