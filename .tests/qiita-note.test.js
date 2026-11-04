/**
 * qiita-note.test.js
 * Unit and conversion tests for Qiita Note syntax plugin
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const markedPath = path.join(rootDir, 'src', 'js', 'marked.min.js');
const qiitaMarkerPath = path.join(rootDir, 'src', 'js', 'qiita_marker.js');

// Load marked in isolated environment
const markedCode = fs.readFileSync(markedPath, 'utf-8');
const markedFn = new Function('module', 'exports', markedCode + '; return typeof marked !== "undefined" ? marked : (module.exports || exports);');
const marked = markedFn({}, {});

// Load QiitaMarker
const QiitaMarker = require(qiitaMarkerPath);
QiitaMarker.install(marked);

function runTests() {
    console.log('--- Running Qiita Note Syntax Tests ---');
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

    // 1. Basic functionality
    test('Standard :::note info renders note info with check-circle icon', () => {
        const md = ':::note info\nThis is an info note.\n:::';
        const html = marked(md);
        assert(html.includes('class="note info"'), 'HTML must include class="note info"');
        assert(html.includes('fa-check-circle'), 'HTML must include check-circle icon class');
        assert(html.includes('<svg'), 'HTML must contain inline SVG');
        assert(html.includes('This is an info note.'), 'HTML must contain note body');
    });

    test('Standard :::note warn renders note warn with exclamation-circle icon', () => {
        const md = ':::note warn\nWarning message.\n:::';
        const html = marked(md);
        assert(html.includes('class="note warn"'), 'HTML must include class="note warn"');
        assert(html.includes('fa-exclamation-circle'), 'HTML must include exclamation-circle icon class');
        assert(html.includes('Warning message.'), 'HTML must contain warning message');
    });

    test('Standard :::note alert renders note alert with times-circle icon', () => {
        const md = ':::note alert\nAlert message.\n:::';
        const html = marked(md);
        assert(html.includes('class="note alert"'), 'HTML must include class="note alert"');
        assert(html.includes('fa-times-circle'), 'HTML must include times-circle icon class');
        assert(html.includes('Alert message.'), 'HTML must contain alert message');
    });

    test('Omitted subtype :::note defaults to info', () => {
        const md = ':::note\nDefault note.\n:::';
        const html = marked(md);
        assert(html.includes('class="note info"'), 'HTML must fall back to class="note info"');
        assert(html.includes('fa-check-circle'), 'HTML must use check-circle icon');
        assert(html.includes('Default note.'), 'HTML must contain body');
    });

    test('Unknown subtype falls back to info', () => {
        const md = ':::note unknown\nUnknown subtype note.\n:::';
        const html = marked(md);
        assert(html.includes('class="note info"'), 'Unknown subtype must fall back to class="note info"');
        assert(html.includes('fa-check-circle'), 'Unknown subtype must use check-circle icon');
    });

    test('Uppercase subtype falls back to info (strict lowercase requirement)', () => {
        const md = ':::note WARN\nUppercase subtype note.\n:::';
        const html = marked(md);
        assert(html.includes('class="note info"'), 'Uppercase subtype must fall back to class="note info"');
    });

    test('Empty note body renders note container without error', () => {
        const md = ':::note\n:::';
        const html = marked(md);
        assert(html.includes('class="note info"'), 'Empty note must render container');
    });

    test('Consecutive note blocks render as distinct note elements', () => {
        const md = ':::note info\nFirst note\n:::\n\n:::note alert\nSecond note\n:::';
        const html = marked(md);
        assert(html.includes('class="note info"'), 'Must contain first note');
        assert(html.includes('class="note alert"'), 'Must contain second note');
        assert((html.match(/class="note /g) || []).length === 2, 'Must contain exactly two note containers');
    });

    test('Preserves preceding and succeeding paragraphs', () => {
        const md = 'Preceding paragraph.\n\n:::note info\nNote content.\n:::\n\nSucceeding paragraph.';
        const html = marked(md);
        assert(html.includes('<p>Preceding paragraph.</p>'), 'Must preserve preceding paragraph');
        assert(html.includes('class="note info"'), 'Must include note');
        assert(html.includes('<p>Succeeding paragraph.</p>'), 'Must preserve succeeding paragraph');
    });

    test('Normal paragraph immediately followed by note does not swallow note block', () => {
        const md = 'Paragraph directly before\n:::note info\nNote content.\n:::';
        const html = marked(md);
        assert(html.includes('Paragraph directly before'), 'Must preserve preceding text');
        assert(html.includes('class="note info"'), 'Must recognize note block');
    });

    // 2. Boundary conditions
    test('Handles CRLF line endings cleanly without extra whitespace or tags', () => {
        const md = ':::note warn\r\nLine 1\r\nLine 2\r\n:::';
        const html = marked(md);
        assert(html.includes('class="note warn"'), 'CRLF note must render correctly');
        assert(html.includes('Line 1'), 'Line 1 must be present');
        assert(html.includes('Line 2'), 'Line 2 must be present');
    });

    test('Handles 3 or more colons in opening and closing fences', () => {
        const md = ':::::note alert\nMultiple colons.\n:::::';
        const html = marked(md);
        assert(html.includes('class="note alert"'), '5-colon fence must render note');
        assert(html.includes('Multiple colons.'), 'Body must be rendered');
    });

    test('Closing fence requires at least as many colons as opening fence', () => {
        const md = '::::note info\nColon test\n:::\nMore content\n::::';
        const html = marked(md);
        assert(html.includes('Colon test'), 'Must include body');
        assert(html.includes('More content'), 'Must include content before matching 4-colon fence');
    });

    test('Strips indentation up to 3 spaces from note lines matching start line', () => {
        const md = '   :::note info\n   Indented line 1\n   Indented line 2\n   :::';
        const html = marked(md);
        assert(html.includes('class="note info"'), 'Indented note fence must be recognized');
        assert(html.includes('Indented line 1'), 'Indented lines must be preserved without excess spaces');
    });

    test('Unclosed note automatically closes at document end without hang or exception', () => {
        const md = ':::note info\nUnclosed note content reaching EOF';
        const html = marked(md);
        assert(html.includes('class="note info"'), 'Unclosed note must render note container');
        assert(html.includes('Unclosed note content reaching EOF'), 'Body must be preserved');
    });

    test('Ignores non-note custom blocks like :::notebook or :::spoiler', () => {
        const md = ':::notebook\nNot a note\n:::';
        const html = marked(md);
        assert(!html.includes('class="note '), 'Non-note block must not be transformed to note');
    });

    // 3. Prevention of false transformations
    test('Does not transform :::note inside fenced code block (backticks)', () => {
        const md = '```\n:::note info\nThis is code\n:::\n```';
        const html = marked(md);
        assert(!html.includes('class="note info"'), 'Fenced code must not contain note container');
        assert(html.includes(':::note info'), 'Code block must contain verbatim text');
    });

    test('Does not transform :::note inside fenced code block (tildes)', () => {
        const md = '~~~\n:::note alert\nThis is code\n:::\n~~~';
        const html = marked(md);
        assert(!html.includes('class="note alert"'), 'Tilde fenced code must not contain note container');
        assert(html.includes(':::note alert'), 'Code block must contain verbatim text');
    });

    test('Does not transform inline code containing :::note', () => {
        const md = 'Use `:::note info` to write a note.';
        const html = marked(md);
        assert(!html.includes('class="note info"'), 'Inline code must not trigger note parsing');
        assert(html.includes('<code>:::note info</code>'), 'Inline code must be preserved verbatim');
    });

    // 4. Markdown syntax inside note body
    test('Supports rich Markdown inside note (lists, emphasis, strikethrough, code, links)', () => {
        const md = ':::note info\n- Item 1\n- Item 2\n\n**Bold** and ~~strike~~ and `code` and [link](https://example.com)\n\n```js\nconst x = 1;\n```\n:::';
        const html = marked(md);
        assert(html.includes('<li>Item 1</li>'), 'Must render list');
        assert(html.includes('<strong>Bold</strong>'), 'Must render bold');
        assert(html.includes('<del>strike</del>'), 'Must render strikethrough');
        assert(html.includes('<code>code</code>'), 'Must render inline code');
        assert(html.includes('<a href="https://example.com">link</a>'), 'Must render link');
        assert(html.includes('<code class="lang-js">'), 'Must render code block');
    });

    // 5. Coexistence with other features
    test('Coexists with standard blockquotes and GitHub Alerts', () => {
        const md = '> Standard quote\n\n:::note info\nNote content\n:::\n\n> [!NOTE]\n> Alert note';
        const html = marked(md);
        assert(html.includes('<blockquote>'), 'Must preserve standard blockquote');
        assert(html.includes('class="note info"'), 'Must render Qiita note');
        assert(html.includes('[!NOTE]'), 'Must leave GitHub alert markers intact for DOM post-processing');
    });

    test('Repeated installation does not duplicate token hooks or corrupt lexer', () => {
        QiitaMarker.install(marked);
        QiitaMarker.install(marked);
        const md = ':::note info\nRepeated install test\n:::';
        const html = marked(md);
        assert(html.includes('class="note info"'), 'Must render note properly after multiple install calls');
        assert((html.match(/class="note info"/g) || []).length === 1, 'Must render exactly one note container');
    });

    // 6. Standalone API functions
    test('Standalone API: normalizeSubtype and renderNoteHtml', () => {
        assert.strictEqual(QiitaMarker.normalizeSubtype('info'), 'info');
        assert.strictEqual(QiitaMarker.normalizeSubtype('warn'), 'warn');
        assert.strictEqual(QiitaMarker.normalizeSubtype('alert'), 'alert');
        assert.strictEqual(QiitaMarker.normalizeSubtype('invalid'), 'info');
        assert.strictEqual(QiitaMarker.normalizeSubtype(null), 'info');

        const rendered = QiitaMarker.renderNoteHtml('warn', '<p>Test</p>');
        assert(rendered.startsWith('<div class="note warn">'));
        assert(rendered.includes('fa-exclamation-circle'));
        assert(rendered.includes('<div><p>Test</p></div></div>\n'));
    });

    console.log(`\nQiita Note Test Summary: ${passCount} passed, ${failCount} failed`);
    if (failCount > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests();


