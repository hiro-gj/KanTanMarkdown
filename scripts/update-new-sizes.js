/**
 * update-new-sizes.js
 * Automatically updates file size descriptions in ktm-new.html based on built dist/ artifacts.
 */

const fs = require('fs');
const path = require('path');

function formatSize(bytes) {
    const kb = bytes / 1024;
    if (kb >= 1024) {
        return '約' + (kb / 1024).toFixed(1) + 'MB';
    } else {
        return '約' + Math.round(kb) + 'kb';
    }
}

function updateKtmNewSizes(rootDir) {
    const baseDir = rootDir || path.resolve(__dirname, '..');
    const ktmNewPath = path.join(baseDir, 'ktm-new.html');

    if (!fs.existsSync(ktmNewPath)) {
        console.warn('ktm-new.html not found at:', ktmNewPath);
        return false;
    }

    // Check dist/ or dist/preview/ for distribution files
    let litePath = path.join(baseDir, 'dist', 'ktm-lite.html');
    let stdPath = path.join(baseDir, 'dist', 'ktm-std.html');
    let fullPath = path.join(baseDir, 'dist', 'ktm-full.html');

    if (!fs.existsSync(litePath) && fs.existsSync(path.join(baseDir, 'dist', 'preview', 'ktm-lite.html'))) {
        litePath = path.join(baseDir, 'dist', 'preview', 'ktm-lite.html');
        stdPath = path.join(baseDir, 'dist', 'preview', 'ktm-std.html');
        fullPath = path.join(baseDir, 'dist', 'preview', 'ktm-full.html');
    }

    if (!fs.existsSync(litePath) || !fs.existsSync(stdPath) || !fs.existsSync(fullPath)) {
        console.warn('One or more distribution files not found. Skipping size update.');
        return false;
    }

    const liteSize = formatSize(fs.statSync(litePath).size);
    const stdSize = formatSize(fs.statSync(stdPath).size);
    const fullSize = formatSize(fs.statSync(fullPath).size);

    let content = fs.readFileSync(ktmNewPath, 'utf-8');

    // 1. Pattern matching the release "空の容量" row in ktm-new.html (based on dist/)
    const regex = /(<td>空の容量<\/td>[\s\S]*?<td[^>]*>)(.*?)(<\/td>[\s\S]*?<td[^>]*>)(.*?)(<\/td>[\s\S]*?<td[^>]*>)(.*?)(<\/td>)/;

    if (!regex.test(content)) {
        console.warn('Could not find "空の容量" table row in ktm-new.html.');
        return false;
    }

    content = content.replace(regex, `$1${liteSize}$3${stdSize}$5${fullSize}$7`);

    // 2. Pattern matching the preview "空の容量" row in ktm-new.html (based on dist/preview/)
    const previewLitePath = fs.existsSync(path.join(baseDir, 'dist', 'preview', 'ktm-lite.html'))
        ? path.join(baseDir, 'dist', 'preview', 'ktm-lite.html') : litePath;
    const previewStdPath = fs.existsSync(path.join(baseDir, 'dist', 'preview', 'ktm-std.html'))
        ? path.join(baseDir, 'dist', 'preview', 'ktm-std.html') : stdPath;
    const previewFullPath = fs.existsSync(path.join(baseDir, 'dist', 'preview', 'ktm-full.html'))
        ? path.join(baseDir, 'dist', 'preview', 'ktm-full.html') : fullPath;

    const previewLiteSize = formatSize(fs.statSync(previewLitePath).size);
    const previewStdSize = formatSize(fs.statSync(previewStdPath).size);
    const previewFullSize = formatSize(fs.statSync(previewFullPath).size);

    const previewRegex = /(dist\/preview\/ktm-full\.html[\s\S]*?<td>空の容量<\/td>[\s\S]*?<td[^>]*>)(.*?)(<\/td>[\s\S]*?<td[^>]*>)(.*?)(<\/td>[\s\S]*?<td[^>]*>)(.*?)(<\/td>)/;
    if (previewRegex.test(content)) {
        content = content.replace(previewRegex, `$1${previewLiteSize}$3${previewStdSize}$5${previewFullSize}$7`);
    }

    fs.writeFileSync(ktmNewPath, content, 'utf-8');
    console.log(`[update-new-sizes] ktm-new.html updated: Release(Lite=${liteSize}, Standard=${stdSize}, Full=${fullSize}), Preview(Lite=${previewLiteSize}, Standard=${previewStdSize}, Full=${previewFullSize})`);
    return true;
}

if (require.main === module) {
    updateKtmNewSizes();
}

module.exports = {
    formatSize,
    updateKtmNewSizes
};
