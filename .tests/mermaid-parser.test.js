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

    console.log(`\nMermaid Parser Test Summary: ${passCount} passed, ${failCount} failed`);
    if (failCount > 0) process.exit(1);
    else process.exit(0);
}

runTests();
