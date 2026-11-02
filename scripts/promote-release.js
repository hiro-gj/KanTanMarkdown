/**
 * promote-release.js
 * Promotes verified preview artifacts (dist/preview/ or a dedicated verified-artifact directory)
 * to production dist/ without modifying any artifact bytes, verifying embedded version,
 * build-manifest.json, source commit SHA, and SHA-256 integrity.
 *
 * Optional guarantees:
 *   --cross-check-dir <dir>  every artifact rebuilt in <dir> (e.g. dist/preview of the checked-out
 *                            release commit) must be byte-identical to the verified artifacts
 *   --sync-root <dir>        additional repository roots (e.g. a git worktree of origin/master) that
 *                            receive the same verified bytes under <dir>/dist and a release size update
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { updateKtmNewSizes } = require('./update-new-sizes');

const ARTIFACT_FILES = [
    'ktm-dev.html',
    'ktm-lite.html',
    'ktm-std.html',
    'ktm-full.html',
    'kantanUpdate.js'
];

const MANIFEST_FILE = 'build-manifest.json';

function computeSha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function isSamePath(a, b) {
    return path.resolve(a) === path.resolve(b);
}

function isInsidePath(child, parent) {
    const rel = path.relative(path.resolve(parent), path.resolve(child));
    return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function verifyPreviewArtifacts(previewDir, expectedVersion, options = {}) {
    const beforeHashes = {};

    for (const file of ARTIFACT_FILES) {
        const srcPath = path.join(previewDir, file);
        if (!fs.existsSync(srcPath)) {
            throw new Error(`Cannot promote release: missing preview artifact ${srcPath}`);
        }
        const buf = fs.readFileSync(srcPath);
        if (buf.length === 0) {
            throw new Error(`Cannot promote release: empty preview artifact ${srcPath}`);
        }
        beforeHashes[file] = computeSha256(buf);

        const content = buf.toString('utf-8');
        if (file.endsWith('.html')) {
            const verMatch = content.match(/id="kantanVersion"\s+value="([^"]*)"/);
            const embeddedVer = verMatch ? verMatch[1] : '';
            if (embeddedVer !== expectedVersion) {
                throw new Error(`Cannot promote release: ${file} embeds version "${embeddedVer}", expected "${expectedVersion}"`);
            }
        } else if (file === 'kantanUpdate.js') {
            const newVerMatch = content.match(/"newVersion":\s*"([^"]*)"/);
            const embeddedNewVer = newVerMatch ? newVerMatch[1] : '';
            const innerVerMatch = content.match(/id=\\"kantanVersion\\"\s+value=\\"([^\\"]*)\\"/);
            const embeddedInnerVer = innerVerMatch ? innerVerMatch[1] : '';
            if (embeddedNewVer !== expectedVersion || embeddedInnerVer !== expectedVersion) {
                throw new Error(`Cannot promote release: kantanUpdate.js embeds version "${embeddedNewVer}" / "${embeddedInnerVer}", expected "${expectedVersion}"`);
            }
        }
    }

    const manifestPath = path.join(previewDir, MANIFEST_FILE);
    const mustHaveManifest = Boolean(options.requireManifest || options.expectedSourceSha);
    if (mustHaveManifest && !fs.existsSync(manifestPath)) {
        throw new Error(`Cannot promote release: required build-manifest.json is missing at ${manifestPath}`);
    }

    if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        if (manifest.version !== expectedVersion) {
            throw new Error(`Cannot promote release: build-manifest.json version "${manifest.version}" !== "${expectedVersion}"`);
        }
        const manifestSourceSha = typeof manifest.sourceSha === 'string' ? manifest.sourceSha.trim() : '';
        if (!manifestSourceSha || manifestSourceSha === 'unknown') {
            throw new Error('Cannot promote release: build-manifest.json is missing a valid sourceSha');
        }
        if (options.expectedSourceSha !== undefined && options.expectedSourceSha !== null && String(options.expectedSourceSha).trim() !== '') {
            const expectedSha = String(options.expectedSourceSha).trim();
            if (manifestSourceSha !== expectedSha) {
                throw new Error(`Cannot promote release: build-manifest.json sourceSha "${manifestSourceSha}" !== "${expectedSha}"`);
            }
        }
        if (!manifest.artifacts || typeof manifest.artifacts !== 'object') {
            throw new Error('Cannot promote release: build-manifest.json is missing artifacts table');
        }
        for (const file of ARTIFACT_FILES) {
            const entry = manifest.artifacts[file];
            if (!entry || entry.sha256 !== beforeHashes[file]) {
                throw new Error(`Cannot promote release: SHA-256 mismatch for ${file} against build-manifest.json`);
            }
        }
    }

    return beforeHashes;
}

/**
 * Verifies that every artifact in `dir` is byte-identical (SHA-256) to the verified hashes.
 * @param {string} dir
 * @param {Record<string, string>} expectedHashes
 * @param {string} label
 */
function verifyDirMatchesHashes(dir, expectedHashes, label) {
    for (const file of ARTIFACT_FILES) {
        const filePath = path.join(dir, file);
        if (!fs.existsSync(filePath)) {
            throw new Error(`${label}: ${file} is missing in ${dir}`);
        }
        const actual = computeSha256(fs.readFileSync(filePath));
        if (actual !== expectedHashes[file]) {
            throw new Error(`${label}: SHA-256 mismatch for ${file} in ${dir} (expected ${expectedHashes[file]}, got ${actual})`);
        }
    }
}

function promoteRelease(options = {}) {
    const rootDir = options.rootDir || path.resolve(__dirname, '..');
    const artifactDir = options.artifactDir
        ? path.resolve(rootDir, options.artifactDir)
        : path.join(rootDir, 'dist', 'preview');
    const releaseDir = path.join(rootDir, 'dist');
    const versionTag = options.versionTag ? options.versionTag.trim() : '';
    const crossCheckDir = options.crossCheckDir ? path.resolve(rootDir, options.crossCheckDir) : null;
    const syncRoots = (options.syncRoots || []).map((dir) => path.resolve(rootDir, dir));

    if (!fs.existsSync(artifactDir) || !fs.statSync(artifactDir).isDirectory()) {
        throw new Error(`Cannot promote release: verified artifact directory does not exist: ${artifactDir}`);
    }
    if (isSamePath(artifactDir, releaseDir)) {
        throw new Error('Cannot promote release: verified artifact directory must not be the production dist/ directory');
    }
    for (const syncRoot of syncRoots) {
        if (!fs.existsSync(syncRoot) || !fs.statSync(syncRoot).isDirectory()) {
            throw new Error(`Cannot promote release: sync root does not exist: ${syncRoot}`);
        }
        if (isSamePath(syncRoot, rootDir)) {
            throw new Error('Cannot promote release: sync root must differ from the verification root');
        }
        if (isInsidePath(artifactDir, syncRoot)) {
            throw new Error('Cannot promote release: verified artifact directory must not be inside a sync root');
        }
    }

    const versionFilePath = path.join(rootDir, 'src', 'kantanVersion.txt');
    if (!fs.existsSync(versionFilePath)) {
        throw new Error(`Cannot promote release: missing ${versionFilePath}`);
    }
    const sourceVersion = fs.readFileSync(versionFilePath, 'utf-8').trim();
    if (!sourceVersion) {
        throw new Error('Cannot promote release: src/kantanVersion.txt is empty');
    }

    if (versionTag && versionTag !== sourceVersion) {
        throw new Error(
            `Cannot promote release: target version tag "${versionTag}" does not match verified source/preview version "${sourceVersion}"`
        );
    }

    const beforeHashes = verifyPreviewArtifacts(artifactDir, sourceVersion, {
        requireManifest: options.requireManifest,
        expectedSourceSha: options.expectedSourceSha
    });

    if (crossCheckDir && !isSamePath(crossCheckDir, artifactDir)) {
        // The artifacts rebuilt from the checked-out release commit must be identical to the
        // CI-verified artifacts; otherwise the artifacts do not belong to this commit.
        verifyDirMatchesHashes(crossCheckDir, beforeHashes, 'Cannot promote release: cross-check failure');
    }

    const targetDirs = [releaseDir, ...syncRoots.map((syncRoot) => path.join(syncRoot, 'dist'))];
    const artifactManifest = path.join(artifactDir, MANIFEST_FILE);

    for (const targetDir of targetDirs) {
        fs.mkdirSync(targetDir, { recursive: true });
        for (const file of ARTIFACT_FILES) {
            fs.copyFileSync(path.join(artifactDir, file), path.join(targetDir, file));
        }
        if (fs.existsSync(artifactManifest)) {
            fs.copyFileSync(artifactManifest, path.join(targetDir, MANIFEST_FILE));
        }
    }

    for (const file of ARTIFACT_FILES) {
        const sourceHashAfter = computeSha256(fs.readFileSync(path.join(artifactDir, file)));
        if (sourceHashAfter !== beforeHashes[file]) {
            throw new Error(`Promotion integrity failure: verified artifact ${file} was modified during promotion`);
        }
    }
    for (const targetDir of targetDirs) {
        verifyDirMatchesHashes(targetDir, beforeHashes, 'Promotion integrity failure');
    }

    // Only the production size row is derived from the promoted artifacts; the preview row stays as built.
    updateKtmNewSizes(rootDir, { mode: 'release' });
    for (const syncRoot of syncRoots) {
        updateKtmNewSizes(syncRoot, { mode: 'release' });
    }

    console.log(`[promote-release] Promoted ${ARTIFACT_FILES.length} verified artifacts (${sourceVersion}) from ${artifactDir} to ${targetDirs.join(', ')} with SHA-256 match`);
    return { ok: true, version: sourceVersion, hashes: beforeHashes, artifactDir, targetDirs };
}

function readArgValue(args, name) {
    const idx = args.indexOf(name);
    return (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) ? args[idx + 1] : '';
}

function readArgValues(args, name) {
    const values = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === name && args[i + 1] && !args[i + 1].startsWith('--')) {
            values.push(args[i + 1]);
        }
    }
    return values;
}

if (require.main === module) {
    const args = process.argv.slice(2);
    promoteRelease({
        versionTag: readArgValue(args, '--version'),
        expectedSourceSha: readArgValue(args, '--source-sha'),
        requireManifest: args.includes('--require-manifest'),
        artifactDir: readArgValue(args, '--artifact-dir') || undefined,
        crossCheckDir: readArgValue(args, '--cross-check-dir') || undefined,
        syncRoots: readArgValues(args, '--sync-root')
    });
}

module.exports = {
    ARTIFACT_FILES,
    MANIFEST_FILE,
    computeSha256,
    verifyPreviewArtifacts,
    verifyDirMatchesHashes,
    promoteRelease
};
