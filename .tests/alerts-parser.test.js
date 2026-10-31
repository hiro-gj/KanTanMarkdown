/**
 * alerts-parser.test.js
 * Unit tests for GitHub Alerts parsing and transformation
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const alertsScriptPath = path.resolve(__dirname, '..', 'src', 'js', 'github-alerts.js');
const alertsCode = fs.readFileSync(alertsScriptPath, 'utf-8');

// Lightweight DOM Stub for Node.js environment
class MockNode {
    constructor(nodeType, tagName, nodeValue = '') {
        this.nodeType = nodeType;
        this.tagName = tagName ? tagName.toUpperCase() : '';
        this.nodeValue = nodeValue;
        this.childNodes = [];
        this.parentNode = null;
        this.className = '';
        this._innerHTML = '';
    }

    set id(val) {
        this._id = val;
        if (this._ownerDoc) {
            this._ownerDoc._elementsById[val] = this;
        }
    }

    get id() {
        return this._id || '';
    }

    get innerHTML() {
        if (this.nodeType === 3) return this.nodeValue;
        if (this._innerHTML) return this._innerHTML;
        return this.childNodes.map(c => c.innerHTML || c.nodeValue || '').join('');
    }

    set innerHTML(val) {
        this._innerHTML = val;
        this.childNodes = [];
    }

    appendChild(child) {
        child.parentNode = this;
        this.childNodes.push(child);
        return child;
    }

    insertBefore(newNode, refNode) {
        const idx = this.childNodes.indexOf(refNode);
        if (idx !== -1) {
            newNode.parentNode = this;
            this.childNodes.splice(idx, 0, newNode);
        } else {
            this.appendChild(newNode);
        }
        return newNode;
    }

    removeChild(child) {
        const idx = this.childNodes.indexOf(child);
        if (idx !== -1) {
            child.parentNode = null;
            this.childNodes.splice(idx, 1);
        }
        return child;
    }

    cloneNode(deep) {
        const clone = new MockElement(this.tagName.toLowerCase());
        clone.className = this.className;
        clone._innerHTML = this._innerHTML;
        clone.nodeValue = this.nodeValue;
        if (deep) {
            for (const c of this.childNodes) {
                clone.appendChild(c.cloneNode(true));
            }
        }
        return clone;
    }

    querySelectorAll(selector) {
        const results = [];
        const sel = selector.toUpperCase();
        function traverse(node) {
            for (const child of node.childNodes) {
                if (child.nodeType === 1 && (child.tagName === sel || sel === '*')) {
                    results.push(child);
                }
                traverse(child);
            }
        }
        traverse(this);
        return results;
    }
}

class MockElement extends MockNode {
    constructor(tagName) {
        super(1, tagName);
    }
}

class MockDocument {
    constructor() {
        this.head = new MockElement('head');
        this.body = new MockElement('body');
        this._elementsById = {};
    }

    createElement(tagName) {
        const el = new MockElement(tagName);
        el._ownerDoc = this;
        return el;
    }

    createTextNode(text) {
        return new MockNode(3, '', text);
    }

    getElementById(id) {
        return this._elementsById[id] || null;
    }
}

function runTests() {
    console.log('--- Running GitHub Alerts Parser Tests ---');
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

    const mockDoc = new MockDocument();
    const sandbox = {
        window: {},
        document: mockDoc,
        console: console
    };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(alertsCode, sandbox);

    const GithubAlerts = sandbox.GithubAlerts;

    test('GithubAlerts is defined on global scope', () => {
        assert(GithubAlerts, 'GithubAlerts should exist');
        assert(typeof GithubAlerts.render === 'function', 'render function should exist');
    });

    test('All 5 standard alert types (NOTE, TIP, IMPORTANT, WARNING, CAUTION) are defined', () => {
        const expectedTypes = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'];
        for (const type of expectedTypes) {
            const config = GithubAlerts.TYPES[type];
            assert(config, `Type ${type} must be defined`);
            assert(config.title, `Type ${type} must have a title`);
            assert(config.className, `Type ${type} must have a className`);
            assert(config.icon, `Type ${type} must have an icon SVG`);
            assert.strictEqual(config.className, `markdown-alert-${type.toLowerCase()}`);
        }
    });

    test('Converts [!NOTE] blockquote into markdown-alert-note', () => {
        const container = new MockElement('div');
        const bq = new MockElement('blockquote');
        const p = new MockElement('p');
        p.innerHTML = '[!NOTE]<br>This is a test note message.';
        bq.appendChild(p);
        container.appendChild(bq);

        GithubAlerts.render(container);

        assert.strictEqual(container.childNodes.length, 1);
        const alertNode = container.childNodes[0];
        assert(alertNode.className.includes('markdown-alert'));
        assert(alertNode.className.includes('markdown-alert-note'));
    });

    test('Converts each alert type with correct class and title', () => {
        const types = ['TIP', 'IMPORTANT', 'WARNING', 'CAUTION'];
        for (const type of types) {
            const container = new MockElement('div');
            const bq = new MockElement('blockquote');
            const p = new MockElement('p');
            p.innerHTML = `[!${type}]\nAlert content for ${type}`;
            bq.appendChild(p);
            container.appendChild(bq);

            GithubAlerts.render(container);

            const alertNode = container.childNodes[0];
            assert(alertNode.className.includes(`markdown-alert-${type.toLowerCase()}`));
            assert(alertNode.innerHTML.includes(GithubAlerts.TYPES[type].title));
        }
    });

    test('Splits consecutive alerts in a single blockquote into multiple alert elements', () => {
        const container = new MockElement('div');
        const bq = new MockElement('blockquote');
        const p = new MockElement('p');
        p.innerHTML = '[!NOTE]\nFirst note\n[!WARNING]\nSecond warning';
        bq.appendChild(p);
        container.appendChild(bq);

        GithubAlerts.render(container);

        assert.strictEqual(container.childNodes.length, 2);
        assert(container.childNodes[0].className.includes('markdown-alert-note'));
        assert(container.childNodes[1].className.includes('markdown-alert-warning'));
    });

    test('Preserves standard blockquotes that do not match alert syntax', () => {
        const container = new MockElement('div');
        const bq = new MockElement('blockquote');
        const p = new MockElement('p');
        p.innerHTML = 'This is just a regular quote.';
        bq.appendChild(p);
        container.appendChild(bq);

        GithubAlerts.render(container);

        assert.strictEqual(container.childNodes.length, 1);
        const node = container.childNodes[0];
        assert.strictEqual(node.className, '');
        assert.strictEqual(node, bq);
    });

    test('Repeated calls on already transformed alerts do not duplicate', () => {
        const container = new MockElement('div');
        const bq = new MockElement('blockquote');
        const p = new MockElement('p');
        p.innerHTML = '[!TIP]\nTip content';
        bq.appendChild(p);
        container.appendChild(bq);

        GithubAlerts.render(container);
        const transformedHtml = container.innerHTML;

        GithubAlerts.render(container);
        assert.strictEqual(container.childNodes.length, 1);
        assert.strictEqual(container.innerHTML, transformedHtml);
    });

    console.log(`\nGitHub Alerts Test Summary: ${passCount} passed, ${failCount} failed`);
    if (failCount > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests();
