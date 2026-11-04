/**
 * build.js
 * Node.js + esbuild build script for KanTanMarkdown.
 * Replaces Grunt with an in-memory pipeline that transforms custom JS/CSS once
 * and assembles single-file HTML editions (dev, lite, std, full) and kantanUpdate.js.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cp = require('child_process');
const esbuild = require('esbuild');
const { updateKtmNewSizes } = require('./update-new-sizes');

const ARTIFACT_FILES = [
    'ktm-dev.html',
    'ktm-lite.html',
    'ktm-std.html',
    'ktm-full.html',
    'kantanUpdate.js'
];

function computeSha256(bufferOrString) {
    return crypto.createHash('sha256').update(bufferOrString).digest('hex');
}

function resolveSourceSha(rootDir) {
    try {
        const sha = cp.execFileSync('git', ['-C', rootDir, 'rev-parse', 'HEAD'], { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        if (sha) {
            return sha;
        }
    } catch (_) {
        // Fallback to environment variable when git is unavailable
    }
    if (process.env.GITHUB_SHA) {
        return process.env.GITHUB_SHA.trim();
    }
    return 'unknown';
}

const EDITION_CONFIGS = {
    dev: {
        edition: 'dev',
        outputFile: 'ktm-dev.html',
        minify: false,
        includeHighlight: true,
        includeDiagrams: true
    },
    lite: {
        edition: 'lite',
        outputFile: 'ktm-lite.html',
        minify: true,
        includeHighlight: false,
        includeDiagrams: false
    },
    std: {
        edition: 'std',
        outputFile: 'ktm-std.html',
        minify: true,
        includeHighlight: true,
        includeDiagrams: false
    },
    full: {
        edition: 'full',
        outputFile: 'ktm-full.html',
        minify: true,
        includeHighlight: true,
        includeDiagrams: true
    }
};

const MODULE_FILES = [
    'preview-mermaid.js',
    'attachment-manager.js',
    'save-export.js',
    'settings-ui.js',
    'update-init.js'
];

function minifyCss(cssCode, sourcefile) {
    return esbuild.transformSync(cssCode, {
        loader: 'css',
        minify: true,
        charset: 'utf8',
        sourcefile
    }).code.trim();
}

function minifyJs(jsCode, sourcefile) {
    return esbuild.transformSync(jsCode, {
        loader: 'js',
        minifyWhitespace: true,
        minifySyntax: true,
        minifyIdentifiers: false,
        charset: 'utf8',
        sourcefile
    }).code.trim();
}

function validateScriptSafety(code, label) {
    if (/<\/script/i.test(code)) {
        throw new Error(`Unsafe closing </script tag detected in ${label}`);
    }
}

function loadAndTransformAssets(rootDir, options = {}) {
    const needMinified = options.needMinified !== false;
    const srcDir = path.join(rootDir, 'src');
    const readText = (relPath) => fs.readFileSync(path.join(srcDir, relPath), 'utf-8');

    const ktmHtmlTemplate = readText('ktm.html');
    const kantanDrawerHtml = readText('kantanDrawer.html');
    const kantanVersion = readText('kantanVersion.txt').trim();
    const kantanUpdateTemplate = readText('kantanUpdate.js');

    const rawKantanCss = readText(path.join('css', 'kantan.css'));
    const rawDrawerCss = readText(path.join('css', 'drawer.css'));
    const previewerCss = readText(path.join('css', 'previewer.css'));
    const hljsCss = readText(path.join('css', 'hljs.css'));

    const vendorJs = {
        'js/marked.min.js': readText(path.join('js', 'marked.min.js')),
        'js/qiita_marker.js': readText(path.join('js', 'qiita_marker.js')),
        'js/highlight.min.js': readText(path.join('js', 'highlight.min.js')),
        'js/raphael.min.js': readText(path.join('js', 'raphael.min.js')),
        'js/underscore.min.js': readText(path.join('js', 'underscore.min.js')),
        'js/js-sequence-diagrams.min.js': readText(path.join('js', 'js-sequence-diagrams.min.js')),
        'js/flowchart.min.js': readText(path.join('js', 'flowchart.min.js')),
        'js/mermaid.min.js': readText(path.join('js', 'mermaid.min.js')),
        'js/github-alerts.js': readText(path.join('js', 'github-alerts.js'))
    };

    const rawKantanEditorJs = readText(path.join('js', 'kantanEditor.js'));
    const rawKantanDrawerJs = readText(path.join('js', 'kantanDrawer.js'));

    const modulesDir = path.join(srcDir, 'js', 'modules');
    const moduleContents = [];
    if (fs.existsSync(modulesDir)) {
        for (const modFile of MODULE_FILES) {
            const modPath = path.join(modulesDir, modFile);
            if (fs.existsSync(modPath)) {
                moduleContents.push(fs.readFileSync(modPath, 'utf-8'));
            }
        }
    }
    const rawKantanMarkdownCore = readText(path.join('js', 'kantanMarkdown.js'));
    const rawKantanMarkdownJs = moduleContents.length > 0
        ? moduleContents.join('\n') + '\n' + rawKantanMarkdownCore
        : rawKantanMarkdownCore;

    for (const [name, code] of Object.entries(vendorJs)) {
        validateScriptSafety(code, name);
    }
    validateScriptSafety(rawKantanEditorJs, 'js/kantanEditor.js');
    validateScriptSafety(rawKantanDrawerJs, 'js/kantanDrawer.js');
    validateScriptSafety(rawKantanMarkdownJs, 'js/kantanMarkdown.js');

    const minKantanCss = needMinified ? minifyCss(rawKantanCss, 'kantan.css') : rawKantanCss;
    const minDrawerCss = needMinified ? minifyCss(rawDrawerCss, 'drawer.css') : rawDrawerCss;
    const minKantanEditorJs = needMinified ? minifyJs(rawKantanEditorJs, 'kantanEditor.js') : rawKantanEditorJs;
    const minKantanDrawerJs = needMinified ? minifyJs(rawKantanDrawerJs, 'kantanDrawer.js') : rawKantanDrawerJs;
    const minKantanMarkdownJs = needMinified ? minifyJs(rawKantanMarkdownJs, 'kantanMarkdown.js') : rawKantanMarkdownJs;

    if (needMinified) {
        validateScriptSafety(minKantanEditorJs, 'js/kantanEditor.js (minified)');
        validateScriptSafety(minKantanDrawerJs, 'js/kantanDrawer.js (minified)');
        validateScriptSafety(minKantanMarkdownJs, 'js/kantanMarkdown.js (minified)');
    }

    return {
        ktmHtmlTemplate,
        kantanDrawerHtml,
        kantanVersion,
        kantanUpdateTemplate,
        css: {
            raw: { 'css/kantan.css': rawKantanCss, 'css/drawer.css': rawDrawerCss, 'css/previewer.css': previewerCss, 'css/hljs.css': hljsCss },
            min: { 'css/kantan.css': minKantanCss, 'css/drawer.css': minDrawerCss, 'css/previewer.css': previewerCss, 'css/hljs.css': hljsCss }
        },
        js: {
            raw: { ...vendorJs, 'js/kantanEditor.js': rawKantanEditorJs, 'js/kantanDrawer.js': rawKantanDrawerJs, 'js/kantanMarkdown.js': rawKantanMarkdownJs },
            min: { ...vendorJs, 'js/kantanEditor.js': minKantanEditorJs, 'js/kantanDrawer.js': minKantanDrawerJs, 'js/kantanMarkdown.js': minKantanMarkdownJs }
        }
    };
}

function assembleEditionHtml(config, assets) {
    let html = assets.ktmHtmlTemplate;
    const cssMap = config.minify ? assets.css.min : assets.css.raw;
    const jsMap = config.minify ? assets.js.min : assets.js.raw;

    if (!config.includeHighlight) {
        html = html.replace(/\r?\n?<script id="highlightJs">[\s\S]*?<\/script>/g, '');
    }
    if (!config.includeDiagrams) {
        const diagramScriptIds = [
            'raphaelJs',
            'underscoreJs',
            'jsSequenceDiagramsJs',
            'flowchartJs',
            'mermaidJs'
        ];
        for (const scriptId of diagramScriptIds) {
            const scriptRegex = new RegExp(`\\r?\\n?<script id="${scriptId}">[\\s\\S]*?<\\/script>`, 'g');
            html = html.replace(scriptRegex, '');
        }
    }

    html = html.replace(/<inline\s+src="([^"]+)"\s*\/>/g, (_, srcPath) => {
        if (srcPath === 'kantanDrawer.html') return assets.kantanDrawerHtml;
        if (srcPath === 'kantanVersion.txt') return assets.kantanVersion;
        if (srcPath === 'css/hljs.css') return config.includeHighlight ? cssMap['css/hljs.css'] : '';
        if (Object.prototype.hasOwnProperty.call(cssMap, srcPath)) return cssMap[srcPath];
        if (Object.prototype.hasOwnProperty.call(jsMap, srcPath)) return jsMap[srcPath];
        throw new Error(`Unknown inline source path: ${srcPath}`);
    });

    if (config.edition && config.edition !== '__KANTAN_EDITION__') {
        html = html.replace(/__KANTAN_EDITION__/g, () => config.edition);
        html = html.replace(/<span class="version"><\/span>/g, () => `<span class="version">${assets.kantanVersion}_${config.edition}</span>`);
    }

    return html;
}

function assembleUpdateJs(assets) {
    const fullTemplateHtml = assembleEditionHtml({
        edition: '__KANTAN_EDITION__',
        minify: true,
        includeHighlight: true,
        includeDiagrams: true
    }, assets);

    const innerHtml = fullTemplateHtml
        .replace(/^<!doctype[\s\S]+?<html>\r?\n?/i, '')
        .replace(/\r?\n?<\/html>\s*$/i, '')
        .replace(/\r/g, '');

    const serializedHtml = JSON.stringify(innerHtml).replace(/<\/script/gi, '<\\/script');

    let updateJs = assets.kantanUpdateTemplate;
    updateJs = updateJs.replace(/<inline\s+src="kantanVersion\.txt"\s*\/>/g, () => assets.kantanVersion);
    updateJs = updateJs.replace(/<inline\s+src="ktmString\.js"\s*\/>/g, () => serializedHtml);

    return updateJs;
}

/**
 * Stages only the public files into a GitHub Pages site directory.
 * @param {string} [rootDir] repository root that holds the files to publish (defaults to this repository)
 * @param {string} [siteDirName] site directory; relative paths are resolved against rootDir
 */
function preparePagesSite(rootDir = path.resolve(__dirname, '..'), siteDirName = '_site') {
    const siteDir = path.resolve(rootDir, siteDirName);
    if (path.resolve(rootDir) === siteDir) {
        throw new Error('Pages site directory must differ from the repository root');
    }
    if (fs.existsSync(siteDir)) {
        fs.rmSync(siteDir, { recursive: true, force: true });
    }
    fs.mkdirSync(path.join(siteDir, 'dist', 'preview'), { recursive: true });
    fs.mkdirSync(path.join(siteDir, 'src'), { recursive: true });

    for (const f of ['ktm-new.html', 'LICENSE']) {
        const src = path.join(rootDir, f);
        if (fs.existsSync(src)) fs.copyFileSync(src, path.join(siteDir, f));
    }

    const verPath = path.join(rootDir, 'src', 'kantanVersion.txt');
    if (fs.existsSync(verPath)) {
        fs.copyFileSync(verPath, path.join(siteDir, 'src', 'kantanVersion.txt'));
    }

    const artifactNames = ['ktm-dev.html', 'ktm-lite.html', 'ktm-std.html', 'ktm-full.html', 'kantanUpdate.js'];
    for (const name of artifactNames) {
        const relFile = path.join(rootDir, 'dist', name);
        if (fs.existsSync(relFile)) fs.copyFileSync(relFile, path.join(siteDir, 'dist', name));
        const prevFile = path.join(rootDir, 'dist', 'preview', name);
        if (fs.existsSync(prevFile)) fs.copyFileSync(prevFile, path.join(siteDir, 'dist', 'preview', name));
    }
    return siteDir;
}

function build(options = {}) {
    const startTime = Date.now();
    const rootDir = options.rootDir || path.resolve(__dirname, '..');
    const devOnly = Boolean(options.devOnly);
    const watchMode = Boolean(options.watchMode);

    const previewDir = path.join(rootDir, 'dist', 'preview');
    const releaseDir = path.join(rootDir, 'dist');

    const releaseArtifactsExist = ['ktm-dev.html', 'ktm-lite.html', 'ktm-std.html', 'ktm-full.html', 'kantanUpdate.js']
        .every((file) => fs.existsSync(path.join(releaseDir, file)));

    let targetMode = options.target || 'preview';
    if (!options.target && !options.outDir && !releaseArtifactsExist) {
        targetMode = 'both';
    }

    const outDirs = [];
    if (options.outDir) {
        outDirs.push(path.resolve(rootDir, options.outDir));
    } else {
        if (targetMode === 'preview' || targetMode === 'both') outDirs.push(previewDir);
        if (targetMode === 'release' || targetMode === 'both') outDirs.push(releaseDir);
    }

    for (const dir of outDirs) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const assets = loadAndTransformAssets(rootDir, { needMinified: !devOnly });

    const editionsToBuild = devOnly
        ? [EDITION_CONFIGS.dev]
        : watchMode
            ? [EDITION_CONFIGS.dev]
            : [EDITION_CONFIGS.dev, EDITION_CONFIGS.lite, EDITION_CONFIGS.std, EDITION_CONFIGS.full];

    const builtFiles = [];

    for (const editionConfig of editionsToBuild) {
        const htmlContent = assembleEditionHtml(editionConfig, assets);
        for (const dir of outDirs) {
            const destPath = path.join(dir, editionConfig.outputFile);
            fs.writeFileSync(destPath, htmlContent, 'utf-8');
            builtFiles.push(path.relative(rootDir, destPath));
        }
    }

    if (!devOnly) {
        const updateJsContent = assembleUpdateJs(assets);
        for (const dir of outDirs) {
            const updateDestPath = path.join(dir, 'kantanUpdate.js');
            fs.writeFileSync(updateDestPath, updateJsContent, 'utf-8');
            builtFiles.push(path.relative(rootDir, updateDestPath));
        }

        const pkgJsonPath = path.join(rootDir, 'package.json');
        const packageVersion = fs.existsSync(pkgJsonPath)
            ? JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8')).version || ''
            : '';
        const sourceSha = resolveSourceSha(rootDir);

        for (const dir of outDirs) {
            const manifestArtifacts = {};
            for (const fileName of ARTIFACT_FILES) {
                const filePath = path.join(dir, fileName);
                if (fs.existsSync(filePath)) {
                    const buf = fs.readFileSync(filePath);
                    manifestArtifacts[fileName] = {
                        sizeBytes: buf.length,
                        sha256: computeSha256(buf)
                    };
                }
            }
            const manifest = {
                version: assets.kantanVersion,
                packageVersion,
                sourceSha,
                artifacts: manifestArtifacts
            };
            fs.writeFileSync(path.join(dir, 'build-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
        }
    }

    if (!devOnly && !watchMode && !options.outDir) {
        const sizeUpdateMode = targetMode === 'preview' ? 'preview' : 'both';
        updateKtmNewSizes(rootDir, { mode: sizeUpdateMode });
    }

    const elapsedMs = Date.now() - startTime;
    console.log(`[build] Completed in ${elapsedMs}ms (${builtFiles.join(', ')})`);

    return { elapsedMs, builtFiles };
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const readArgValue = (name) => {
        const idx = args.indexOf(name);
        return (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) ? args[idx + 1] : undefined;
    };

    if (args.includes('--prepare-pages')) {
        const pagesRoot = readArgValue('--root-dir');
        const siteDirArg = readArgValue('--site-dir');
        const siteDir = preparePagesSite(
            pagesRoot ? path.resolve(pagesRoot) : undefined,
            siteDirArg ? path.resolve(siteDirArg) : undefined
        );
        console.log(`[build] Prepared Pages directory at ${siteDir}`);
        process.exit(0);
    }

    const devOnly = args.includes('--dev-only');
    const watchMode = args.includes('--watch-mode');

    let target = 'preview';
    const targetArg = readArgValue('--target');
    if (targetArg) {
        target = targetArg;
    } else if (args.includes('--release')) {
        target = 'release';
    } else if (args.includes('--both')) {
        target = 'both';
    }

    const outDir = readArgValue('--out-dir');

    build({ devOnly, watchMode, target, outDir });
}

module.exports = {
    EDITION_CONFIGS,
    MODULE_FILES,
    minifyCss,
    minifyJs,
    validateScriptSafety,
    loadAndTransformAssets,
    assembleEditionHtml,
    assembleUpdateJs,
    preparePagesSite,
    build
};

