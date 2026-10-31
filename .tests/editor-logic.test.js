/**
 * editor-logic.test.js
 * Unit tests for KantanEditor key actions (Indent, Auto-indent, Close-tag, Undo/Redo)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const editorScriptPath = path.resolve(__dirname, '..', 'src', 'js', 'kantanEditor.js');
const editorCode = fs.readFileSync(editorScriptPath, 'utf-8');

function setupEnvironment() {
    const listeners = [];
    const settings = {
        '#setting-expand-tab': { checked: false },
        '#setting-auto-close-tag': { checked: true }
    };

    const mockDoc = {
        querySelector: (sel) => settings[sel] || { checked: false },
        execCommand: () => true,
        createEvent: () => ({ initEvent: () => {} })
    };

    const mockEditor = {
        value: '',
        selectionStart: 0,
        selectionEnd: 0,
        setSelectionRange(s, e) {
            this.selectionStart = s;
            this.selectionEnd = e;
        },
        blur: () => {},
        focus: () => {},
        dispatchEvent: () => {}
    };

    function on(target, eventType, handler) {
        listeners.push({ target, eventType, handler });
    }

    const sandbox = {
        on,
        document: mockDoc,
        console,
        window: {}
    };
    sandbox.window = sandbox;

    vm.createContext(sandbox);
    vm.runInContext(editorCode, sandbox);

    // Initialize editor
    sandbox.toKantanEditor(mockEditor);

    function dispatch(eventType, eventData) {
        const ev = Object.assign({
            type: eventType,
            target: mockEditor,
            preventDefault: () => {},
            defaultPrevented: false
        }, eventData);

        for (const l of listeners) {
            if (l.eventType === eventType) {
                l.handler(ev);
            }
        }
        return ev;
    }

    return { mockEditor, settings, dispatch };
}

function runTests() {
    console.log('--- Running Editor Logic Tests ---');
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

    test('Tab key inserts tab character when expand-tab is disabled', () => {
        const env = setupEnvironment();
        env.settings['#setting-expand-tab'].checked = false;
        env.mockEditor.value = 'hello';
        env.mockEditor.selectionStart = 5;
        env.mockEditor.selectionEnd = 5;

        env.dispatch('keydown', { which: 9, keyCode: 9 });

        assert.strictEqual(env.mockEditor.value, 'hello\t');
        assert.strictEqual(env.mockEditor.selectionStart, 6);
    });

    test('Tab key inserts spaces when expand-tab is enabled', () => {
        const env = setupEnvironment();
        env.settings['#setting-expand-tab'].checked = true;
        env.mockEditor.value = 'abc';
        env.mockEditor.selectionStart = 3;
        env.mockEditor.selectionEnd = 3;

        env.dispatch('keydown', { which: 9, keyCode: 9 });

        assert.strictEqual(env.mockEditor.value, 'abc ');
        assert.strictEqual(env.mockEditor.selectionStart, 4);
    });

    test('Multi-line selection with Tab indents each selected line', () => {
        const env = setupEnvironment();
        env.mockEditor.value = 'line1\nline2\nline3';
        env.mockEditor.selectionStart = 2;
        env.mockEditor.selectionEnd = 8;

        env.dispatch('keydown', { which: 9, keyCode: 9, shiftKey: false });

        assert.strictEqual(env.mockEditor.value, '\tline1\n\tline2\nline3');
    });

    test('Multi-line selection with Shift+Tab removes indents', () => {
        const env = setupEnvironment();
        env.mockEditor.value = '\tline1\n\tline2\nline3';
        env.mockEditor.selectionStart = 2;
        env.mockEditor.selectionEnd = 10;

        env.dispatch('keydown', { which: 9, keyCode: 9, shiftKey: true });

        assert.strictEqual(env.mockEditor.value, 'line1\nline2\nline3');
    });

    test('Enter key preserves preceding indentation on the new line', () => {
        const env = setupEnvironment();
        env.mockEditor.value = '    indented text';
        env.mockEditor.selectionStart = 17;
        env.mockEditor.selectionEnd = 17;

        env.dispatch('keydown', { which: 13, keyCode: 13 });

        assert.strictEqual(env.mockEditor.value, '    indented text\n    ');
        assert.strictEqual(env.mockEditor.selectionStart, 22);
    });

    test('Slash key after < auto-closes the innermost unclosed HTML tag', () => {
        const env = setupEnvironment();
        env.settings['#setting-auto-close-tag'].checked = true;
        env.mockEditor.value = '<div><p><';
        env.mockEditor.selectionStart = 9;
        env.mockEditor.selectionEnd = 9;

        env.dispatch('keydown', { which: 191, keyCode: 191 });

        assert.strictEqual(env.mockEditor.value, '<div><p></p>');
    });

    test('Ctrl+Z performs Undo and Ctrl+Y performs Redo', () => {
        const env = setupEnvironment();
        env.mockEditor.value = 'Initial';
        env.mockEditor.selectionStart = 7;
        env.mockEditor.selectionEnd = 7;

        // Save initial state by changeByJs event
        env.dispatch('changeByJs');

        // Update value to 'Updated'
        env.mockEditor.value = 'Updated';
        env.mockEditor.selectionStart = 7;
        env.mockEditor.selectionEnd = 7;
        env.dispatch('changeByJs');

        assert.strictEqual(env.mockEditor.value, 'Updated');

        // Trigger Ctrl+Z (Undo)
        env.dispatch('keydown', { keyCode: 90, which: 90, ctrlKey: true, shiftKey: false });
        assert.strictEqual(env.mockEditor.value, 'Initial', 'Value should revert to Initial');

        // Trigger Ctrl+Y (Redo)
        env.dispatch('keydown', { keyCode: 89, which: 89, ctrlKey: true, shiftKey: false });
        assert.strictEqual(env.mockEditor.value, 'Updated', 'Value should restore to Updated');
    });

    console.log(`\nEditor Logic Test Summary: ${passCount} passed, ${failCount} failed`);
    if (failCount > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests();
