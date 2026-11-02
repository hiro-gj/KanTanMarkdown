/**
 * watch.js
 * File watcher for KanTanMarkdown development builds.
 * Monitors src/ (HTML, CSS, JS, bundled libraries) and triggers fast rebuilds.
 * Compatible with Windows / OneDrive environments using debounced fs.watch.
 */

const fs = require('fs');
const path = require('path');
const { build } = require('./build');

/**
 * Starts watching src/ directory for changes.
 * @param {{ rootDir?: string, debounceMs?: number }} [options]
 */
function startWatcher(options = {}) {
    const rootDir = options.rootDir || path.resolve(__dirname, '..');
    const srcDir = path.join(rootDir, 'src');
    const debounceMs = options.debounceMs || 200;

    console.log(`[watch] Performing initial development build...`);
    build({ rootDir, watchMode: true });

    let timer = null;
    let isBuilding = false;

    const triggerRebuild = (eventType, filename) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            if (isBuilding) return;
            isBuilding = true;
            const changedLabel = filename ? `${filename} (${eventType})` : eventType;
            console.log(`[watch] Change detected in src/: ${changedLabel}. Rebuilding...`);
            try {
                build({ rootDir, watchMode: true });
            } catch (err) {
                console.error(`[watch] Build error: ${err.message}`);
            } finally {
                isBuilding = false;
            }
        }, debounceMs);
    };

    const watchers = [];
    const dirsToWatch = [
        srcDir,
        path.join(srcDir, 'css'),
        path.join(srcDir, 'js'),
        path.join(srcDir, 'js', 'modules')
    ];

    for (const dir of dirsToWatch) {
        if (fs.existsSync(dir)) {
            const watcher = fs.watch(dir, { persistent: true }, (eventType, filename) => {
                triggerRebuild(eventType, filename ? path.relative(srcDir, path.join(dir, filename)) : '');
            });
            watchers.push(watcher);
        }
    }

    console.log(`[watch] Watching ${srcDir} for changes... (Press Ctrl+C to stop)`);

    return {
        close() {
            if (timer) clearTimeout(timer);
            for (const w of watchers) {
                w.close();
            }
        }
    };
}

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes('--once')) {
        const watcher = startWatcher();
        watcher.close();
    } else {
        startWatcher();
    }
}

module.exports = {
    startWatcher
};
