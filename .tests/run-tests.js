/**
 * run-tests.js
 * Test suite runner for KanTanMarkdown
 */

const { spawnSync } = require('child_process');
const path = require('path');

const testSuites = [
    { name: 'Syntax Check', file: 'syntax-check.js' },
    { name: 'GitHub Alerts Parser', file: 'alerts-parser.test.js' },
    { name: 'Editor Logic', file: 'editor-logic.test.js' },
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
        stdio: 'inherit',
        env: process.env
    });

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
