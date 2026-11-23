/**
 * run-tests.js
 * Test suite runner for KanTanMarkdown
 */

const { spawnSync } = require('child_process');
const path = require('path');

function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildOneDriveReplacers() {
    const replacers = [];
    const seen = new Set();
    const envCandidates = [
        process.env.OneDriveCommercial,
        process.env.OneDriveConsumer,
        process.env.OneDrive
    ]
        .filter((v) => typeof v === 'string' && v.trim().length > 0)
        .map((v) => v.trim().replace(/[\\/]+$/, ''))
        .sort((a, b) => b.length - a.length);

    for (const dir of envCandidates) {
        const variants = [
            dir.replace(/\\/g, '\\\\'),
            dir,
            dir.replace(/\\/g, '/'),
            encodeURI(dir.replace(/\\/g, '/'))
        ];
        for (const variant of variants) {
            const key = variant.toLowerCase();
            if (!variant || seen.has(key)) continue;
            seen.add(key);
            replacers.push(new RegExp(escapeRegExp(variant), 'gi'));
        }
    }

    // Generic fallback patterns for Windows OneDrive paths (escaped backslash, backslash, forward slash)
    replacers.push(/[A-Za-z]:\\\\Users\\\\[^\\/\r\n'")]+\\\\OneDrive(?:\s*-\s*[^\\/\r\n'")]+)?/gi);
    replacers.push(/[A-Za-z]:\\Users\\[^\\/\r\n'")]+\\OneDrive(?:\s*-\s*[^\\/\r\n'")]+)?/gi);
    replacers.push(/[A-Za-z]:\/Users\/[^\\/\r\n'")]+\/OneDrive(?:\s*-\s*[^\\/\r\n'")]+|%20-%20[^\\/\r\n'")]+)?/gi);

    return replacers;
}

const oneDriveReplacers = buildOneDriveReplacers();

function maskEnvPaths(text) {
    if (typeof text !== 'string' || text.length === 0) {
        return text;
    }
    let masked = text;
    for (const regex of oneDriveReplacers) {
        masked = masked.replace(regex, '%OneDrive%');
    }
    return masked;
}

function wrapStreamWrite(stream) {
    if (!stream || stream._oneDriveMasked) return;
    const origWrite = stream.write.bind(stream);
    stream.write = function (chunk, encoding, callback) {
        let maskedChunk = chunk;
        if (typeof chunk === 'string') {
            maskedChunk = maskEnvPaths(chunk);
        } else if (Buffer.isBuffer(chunk)) {
            const enc = typeof encoding === 'string' ? encoding : 'utf8';
            maskedChunk = Buffer.from(maskEnvPaths(chunk.toString(enc)), enc);
        }
        if (typeof encoding === 'function') {
            return origWrite(maskedChunk, encoding);
        }
        return origWrite(maskedChunk, encoding, callback);
    };
    Object.defineProperty(stream, '_oneDriveMasked', {
        value: true,
        configurable: true
    });
}

let outputMaskInstalled = false;

function installOutputMask() {
    if (outputMaskInstalled) return;
    outputMaskInstalled = true;
    wrapStreamWrite(process.stdout);
    wrapStreamWrite(process.stderr);

    process.on('uncaughtException', (err) => {
        console.error(err);
        process.exit(1);
    });
    process.on('unhandledRejection', (reason) => {
        console.error(reason);
        process.exit(1);
    });
}

const testSuites = [
    { name: 'Syntax Check', file: 'syntax-check.js' },
    { name: 'GitHub Alerts Parser', file: 'alerts-parser.test.js' },
    { name: 'Qiita Note Parser', file: 'qiita-note.test.js' },
    { name: 'Editor Logic', file: 'editor-logic.test.js' },
    { name: 'Mermaid Parser', file: 'mermaid-parser.test.js' },
    { name: 'Modules & Save/Update Logic', file: 'modules-unit.test.js' },
    { name: 'Build & Artifacts Integrity', file: 'build-integrity.test.js' }
];

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

function runAllSuites() {
    installOutputMask();

    console.log(`${colors.bold}${colors.cyan}========================================${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}    KanTanMarkdown Automated Test Suite  ${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}========================================${colors.reset}\n`);

    let passedSuites = 0;
    let failedSuites = 0;
    const startTime = Date.now();

    for (const suite of testSuites) {
        const suitePath = path.resolve(__dirname, suite.file);
        console.log(`${colors.bold}Running: ${suite.name} (${suite.file})${colors.reset}`);
        const suiteStart = Date.now();

        const result = spawnSync(process.execPath, [suitePath], {
            encoding: 'utf-8',
            env: process.env
        });

        if (result.stdout) {
            process.stdout.write(maskEnvPaths(result.stdout));
        }
        if (result.stderr) {
            process.stderr.write(maskEnvPaths(result.stderr));
        }

        const duration = ((Date.now() - suiteStart) / 1000).toFixed(2);

        if (result.status === 0) {
            console.log(`${colors.green}√ ${suite.name} passed (${duration}s)${colors.reset}\n`);
            passedSuites++;
        } else {
            console.log(`${colors.red}X ${suite.name} failed (exit code ${result.status}) (${duration}s)${colors.reset}\n`);
            failedSuites++;
        }
    }

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`${colors.bold}${colors.cyan}----------------------------------------${colors.reset}`);
    console.log(`${colors.bold}Test Suites Summary:${colors.reset}`);
    console.log(`  Total:    ${testSuites.length}`);
    console.log(`  Passed:   ${colors.green}${passedSuites}${colors.reset}`);
    console.log(`  Failed:   ${failedSuites > 0 ? colors.red : colors.green}${failedSuites}${colors.reset}`);
    console.log(`  Duration: ${totalDuration}s`);
    console.log(`${colors.bold}${colors.cyan}----------------------------------------${colors.reset}`);

    if (failedSuites > 0) {
        console.log(`${colors.bold}${colors.red}FAILURE: One or more test suites failed.${colors.reset}`);
        process.exit(1);
    } else {
        console.log(`${colors.bold}${colors.green}SUCCESS: All test suites passed!${colors.reset}`);
        process.exit(0);
    }
}

module.exports = {
    escapeRegExp,
    maskEnvPaths,
    installOutputMask
};

if (require.main === module) {
    runAllSuites();
}
