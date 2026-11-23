/**
 * save-export.js
 * Module separating document saving and HTML export into 4 testable stages:
 *   1. Collect markdown, CSS, attachments, and settings state
 *   2. Assemble and sanitize/escape save payload
 *   3. Convert into a self-contained single HTML string
 *   4. Trigger standard browser download (without legacy IE msSaveBlob branches)
 */

(function (root) {
    'use strict';

    /**
     * Escapes '<' inside textarea content so embedded HTML tags do not break document structure.
     * @param {string} rawMarkdown
     * @returns {string}
     */
    function escapeTextareaMarkdown(rawMarkdown) {
        return (rawMarkdown || '').replace(/</g, '\x26lt;');
    }

    /**
     * Normalizes document title by stripping the leading "* " unsaved indicator.
     * @param {string} rawTitle
     * @returns {string}
     */
    function normalizeDocumentTitle(rawTitle) {
        return (rawTitle || '無題').replace(/^\*\s*/, '');
    }

    /**
     * Stage 1: Collects current markdown, CSS, attachments, metadata, and settings from DOM.
     * @param {Document} doc
     */
    function collectDocumentSaveState(doc) {
        var editorEl = doc.getElementById('editor');
        var cssEditorEl = doc.getElementById('cssEditor');
        var versionEl = doc.getElementById('kantanVersion');
        var editionEl = doc.getElementById('kantanEdition');

        var attachments = [];
        if (root.KantanModules && root.KantanModules.AttachmentManager &&
            typeof root.KantanModules.AttachmentManager.collectAttachmentsFromDom === 'function') {
            attachments = root.KantanModules.AttachmentManager.collectAttachmentsFromDom(doc);
        } else {
            var items = doc.querySelectorAll('#fileList li');
            for (var i = 0; i < items.length; i++) {
                var s = items[i].querySelector('script');
                if (!s) continue;
                var layer = items[i].querySelector('script.layerContent');
                var trim = items[i].querySelector('script.trimInfo');
                attachments.push({
                    fileName: s.title || '',
                    base64: s.innerHTML || '',
                    layerContent: layer ? (layer.innerHTML || '') : '',
                    trimInfo: trim ? (trim.innerHTML || '') : ''
                });
            }
        }

        var settings = {};
        var checkboxes = doc.querySelectorAll('#settings-panel input[type=checkbox]');
        for (var j = 0; j < checkboxes.length; j++) {
            var cb = checkboxes[j];
            if (cb.id) {
                settings[cb.id] = Boolean(cb.checked);
            }
        }

        return {
            title: normalizeDocumentTitle(doc.title),
            markdown: editorEl ? editorEl.value : '',
            css: cssEditorEl ? cssEditorEl.value : '',
            version: versionEl ? versionEl.value : '',
            edition: editionEl ? editionEl.value : '',
            attachments: attachments,
            settings: settings
        };
    }

    /**
     * Stage 2: Prepares the save payload from collected state.
     * @param {object} state
     * @param {{ isPreviewPath?: boolean }} [options]
     */
    function prepareSavePayload(state, options) {
        var isPreview = Boolean(options && options.isPreviewPath);
        return {
            cleanTitle: normalizeDocumentTitle(state.title),
            escapedMarkdown: escapeTextareaMarkdown(state.markdown),
            rawCss: state.css || '',
            version: state.version || '',
            edition: state.edition || '',
            attachments: Array.isArray(state.attachments) ? state.attachments : [],
            settings: state.settings || {},
            updateScriptUrl: isPreview
                ? 'https://hiro-gj.github.io/KanTanMarkdown/dist/preview/kantanUpdate.js'
                : 'https://hiro-gj.github.io/KanTanMarkdown/dist/kantanUpdate.js',
            newDocUrl: 'https://hiro-gj.github.io/KanTanMarkdown/ktm-new.html'
        };
    }

    /**
     * Finds an element by ID from either a Document or an Element (e.g., cloned HTMLHtmlElement).
     * @param {Document | Element} rootNode
     * @param {string} id
     * @returns {Element | null}
     */
    function queryById(rootNode, id) {
        if (!rootNode) return null;
        if (typeof rootNode.getElementById === 'function') {
            return rootNode.getElementById(id);
        }
        if (typeof rootNode.querySelector === 'function') {
            return rootNode.querySelector('#' + id);
        }
        return null;
    }

    /**
     * Removes temporary measurement iframes, page-break overlays, stray Mermaid nodes,
     * and temporary measurement attributes before serializing HTML for saving.
     * @param {Document} doc
     */
    function cleanupTemporaryDomForSave(doc) {
        if (!doc || typeof doc.querySelectorAll !== 'function') return;
        var tempSelectors = [
            '#kantan-print-measure-frame',
            '.kantan-print-measure-frame',
            '#kantan-page-break-overlay',
            '.kantan-page-break-overlay',
            '.page-break-indicator',
            'div[id^="dkantan-mermaid-"]',
            'iframe[id^="ikantan-mermaid-"]',
            'body > svg[id^="kantan-mermaid-"]'
        ].join(', ');
        var tempNodes = doc.querySelectorAll(tempSelectors);
        for (var i = 0; i < tempNodes.length; i++) {
            var node = tempNodes[i];
            if (node && node.parentNode) {
                node.parentNode.removeChild(node);
            }
        }
        var taggedNodes = doc.querySelectorAll('[data-kantan-block-id], [data-kantan-measure-id]');
        for (var j = 0; j < taggedNodes.length; j++) {
            taggedNodes[j].removeAttribute('data-kantan-block-id');
            taggedNodes[j].removeAttribute('data-kantan-measure-id');
        }
        var showPbCb = queryById(doc, 'setting-show-page-break');
        if (showPbCb) {
            showPbCb.removeAttribute('checked');
        }
        var kantanVerEl = queryById(doc, 'kantanVersion');
        if (kantanVerEl && typeof kantanVerEl.removeAttribute === 'function') {
            kantanVerEl.removeAttribute('data-embedded-version');
        }
        var profileInput = queryById(doc, 'print-profile-file');
        if (profileInput) {
            try {
                profileInput.value = '';
            } catch (_) {}
        }
        var toggleBtn = queryById(doc, 'toolbar-toggle');
        if (toggleBtn && toggleBtn.classList) {
            toggleBtn.classList.remove('toolbar-toggle-blink');
            if (toggleBtn.className === '') {
                toggleBtn.removeAttribute('class');
            }
        }
    }

    /**
     * Stage 3: Serializes the inner HTML of the document root into a complete single-file HTML string.
     * Strips any residual measurement iframe or page-break overlay markup if present.
     * @param {string} htmlInnerMarkup
     * @returns {string}
     */
    function serializeSingleHtmlDocument(htmlInnerMarkup) {
        var cleanedMarkup = (htmlInnerMarkup || '')
            .replace(/<iframe[^>]*\bid=["']kantan-print-measure-frame["'][^>]*>[\s\S]*?<\/iframe>/gi, '')
            .replace(/<div[^>]*\bid=["']kantan-page-break-overlay["'][^>]*>[\s\S]*?<\/div>/gi, '');
        var html = '<!doctype html>\n<html>\n' + cleanedMarkup;
        var lastScriptCloseIdx = html.lastIndexOf('/script>');
        if (lastScriptCloseIdx !== -1) {
            html = html.substring(0, lastScriptCloseIdx) + '/script>\n</body>\n</html>';
        } else {
            html += '\n</body>\n</html>';
        }
        return html;
    }

    /**
     * Stage 4: Triggers a browser file download using standard Blob & URL.createObjectURL APIs.
     * @param {Blob} blob
     * @param {string} fileName
     * @param {Document} [doc]
     * @param {Window} [win]
     */
    function triggerBlobDownload(blob, fileName, doc, win) {
        var d = doc || (typeof document !== 'undefined' ? document : null);
        var w = win || (typeof window !== 'undefined' ? window : null);
        if (!d || !w || !w.URL || typeof w.URL.createObjectURL !== 'function') {
            return false;
        }
        var blobURL = w.URL.createObjectURL(blob);
        var a = d.createElement('a');
        a.download = fileName;
        a.href = blobURL;

        if (typeof a.click === 'function') {
            a.click();
        } else if (typeof d.createEvent === 'function') {
            var ev = d.createEvent('MouseEvents');
            ev.initMouseEvent('click', true, false, w, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(ev);
        }
        if (typeof w.URL.revokeObjectURL === 'function') {
            setTimeout(function () {
                try {
                    w.URL.revokeObjectURL(blobURL);
                } catch (_) {}
            }, 10000);
        }
        return true;
    }

    var MAX_MARKDOWN_DROP_BYTES = 10 * 1024 * 1024;
    var MAX_MARKDOWN_DROP_FILES = 10;

    function normalizeDroppedMarkdownText(rawText) {
        if (typeof rawText !== 'string') return { valid: false, text: '', reason: 'invalid-text' };
        if (rawText.indexOf('\x00') !== -1) return { valid: false, text: '', reason: 'binary-content' };
        return { valid: true, text: rawText.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n') };
    }

    function formatMarkdownForTextareaContent(normalizedMarkdown) {
        var text = typeof normalizedMarkdown === 'string' ? normalizedMarkdown : '';
        return text.charAt(0) === '\n' ? ('\n' + text) : text;
    }

    function buildTranscribedHtmlFileName(rawFileName) {
        var raw = typeof rawFileName === 'string' ? rawFileName : '';
        var leaf = raw.replace(/^.*[/\\]/, '').replace(/\.md$/i, '');
        var s = leaf.replace(/[\x00-\x1f\x7f<>:"/\\|?*]/g, '_').replace(/\s+/g, ' ').trim().replace(/^[.\s]+|[.\s]+$/g, '');
        if (s.length > 120) s = s.substring(0, 120).replace(/[.\s]+$/g, '');
        if (!s || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i.test(s)) s = s ? ('_' + s) : '無題';
        return { baseTitle: s, fileName: s + '.html' };
    }

    function buildCleanStandaloneHtmlForMarkdown(sourceDoc, options) {
        var opts = options || {}, mdText = opts.markdownText || '', isPrev = Boolean(opts.isPreviewPath);
        var doc = sourceDoc.documentElement.cloneNode(true);
        doc.removeAttribute('style');

        var verEl = queryById(doc, 'kantanVersion');
        var ver = verEl ? (verEl.getAttribute('data-embedded-version') || verEl.value || '') : '';
        if (verEl && ver) verEl.setAttribute('value', ver);

        cleanupTemporaryDomForSave(doc);

        var cels = doc.querySelectorAll('#updateScriptArea,#fileList,#previewer,#previewerStyle,#message-area,#toc .toc-body');
        for (var i = 0; i < cels.length; i++) cels[i].innerHTML = '';

        var q = function(id) { return queryById(doc, id); };
        var setT = function(id, val) { var e = q(id); if (e) e.textContent = val; };

        var atBtn = q('attachButton');
        if (atBtn) { atBtn.value = ''; atBtn.removeAttribute('value'); }

        setT('importDialogMessage', '');

        var ed = q('editor');
        if (ed) ed.textContent = formatMarkdownForTextareaContent(mdText);

        var cssEd = q('cssEditor');
        if (cssEd && typeof opts.defaultCssText === 'string') cssEd.textContent = formatMarkdownForTextareaContent(opts.defaultCssText);

        var mt = q('markdownTab'), ct = q('cssTab');
        if (mt && mt.parentNode && mt.parentNode.classList) mt.parentNode.classList.add('selected');
        if (ct && ct.parentNode && ct.parentNode.classList) ct.parentNode.classList.remove('selected');
        var etw = q('editorTabWrapper');
        if (etw && etw.classList) etw.classList.remove('fullWidth');
        var prev = q('previewer');
        if (prev) prev.className = 'full-width';

        var body = doc.querySelector('body');
        if (body) body.className = 'initialState view-mode';

        var tb = q('toolbar');
        if (tb) {
            tb.removeAttribute('class');
            var btns = tb.querySelectorAll('button');
            for (var b = 0; b < btns.length; b++) btns[b].removeAttribute('disabled');
        }

        var bmap = { '#toolbar-toggle-icon': '☰', '#btn-dark-mode .btn-text': 'ダーク', '#btn-toggle-mode .btn-text': '編集', '#btn-toggle-attach .btn-text': '画像を添付' };
        for (var sel in bmap) { var be = doc.querySelector(sel); if (be) be.textContent = bmap[sel]; }

        var sp = q('settings-panel');
        if (sp) {
            sp.setAttribute('hidden', '');
            var cbs = sp.querySelectorAll('input[type=checkbox]');
            for (var c = 0; c < cbs.length; c++) {
                if (cbs[c].id === 'setting-auto-sync') cbs[c].setAttribute('checked', 'checked');
                else cbs[c].removeAttribute('checked');
            }
        }

        var chks = { importDialogAttach: 'checked', importDialogMarkdown: 'checked', importDialogCss: null };
        for (var cid in chks) {
            var ce = q(cid);
            if (ce) { if (chks[cid]) ce.setAttribute('checked', 'checked'); else ce.removeAttribute('checked'); }
        }

        var styles = doc.querySelectorAll('*[style]');
        for (var s = 0; s < styles.length; s++) {
            var st = styles[s];
            if (!st.closest || !st.closest('#settings-panel')) st.removeAttribute('style');
        }
        var rh = q('resize-handle');
        if (rh) rh.setAttribute('style', 'display: none;');

        var tEl = doc.querySelector('title');
        if (tEl) tEl.textContent = normalizeDocumentTitle(opts.baseTitle || '無題');

        var edEl = q('kantanEdition');
        if (edEl) edEl.setAttribute('value', 'full');
        if (ver) {
            var vsp = doc.querySelectorAll('.version');
            for (var v = 0; v < vsp.length; v++) vsp[v].textContent = ver + '_full';
        }

        var up = q('updateButton');
        if (up) up.setAttribute('href', 'https://hiro-gj.github.io/KanTanMarkdown/dist/' + (isPrev ? 'preview/' : '') + 'kantanUpdate.js');
        var nls = doc.querySelectorAll('a[href*="ktm-new.html"]');
        for (var n = 0; n < nls.length; n++) nls[n].setAttribute('href', 'https://hiro-gj.github.io/KanTanMarkdown/ktm-new.html');
        var tls = doc.querySelectorAll('#markdownTab, #cssTab');
        for (var t = 0; t < tls.length; t++) tls[t].setAttribute('href', 'javascript:void(0)');

        return serializeSingleHtmlDocument(doc.innerHTML);
    }

    var SaveExportModule = {
        escapeTextareaMarkdown: escapeTextareaMarkdown,
        normalizeDocumentTitle: normalizeDocumentTitle,
        collectDocumentSaveState: collectDocumentSaveState,
        prepareSavePayload: prepareSavePayload,
        cleanupTemporaryDomForSave: cleanupTemporaryDomForSave,
        serializeSingleHtmlDocument: serializeSingleHtmlDocument,
        triggerBlobDownload: triggerBlobDownload,
        MAX_MARKDOWN_DROP_BYTES: MAX_MARKDOWN_DROP_BYTES,
        MAX_MARKDOWN_DROP_FILES: MAX_MARKDOWN_DROP_FILES,
        normalizeDroppedMarkdownText: normalizeDroppedMarkdownText,
        formatMarkdownForTextareaContent: formatMarkdownForTextareaContent,
        buildTranscribedHtmlFileName: buildTranscribedHtmlFileName,
        buildCleanStandaloneHtmlForMarkdown: buildCleanStandaloneHtmlForMarkdown
    };

    root.KantanModules = root.KantanModules || {};
    root.KantanModules.SaveExport = SaveExportModule;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SaveExportModule;
    }
})(typeof window !== 'undefined' ? window : globalThis);
