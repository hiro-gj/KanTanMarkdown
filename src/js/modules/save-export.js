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
        var showPbCb = doc.getElementById('setting-show-page-break');
        if (showPbCb) {
            showPbCb.removeAttribute('checked');
        }
        var kantanVerEl = doc.getElementById('kantanVersion');
        if (kantanVerEl && typeof kantanVerEl.removeAttribute === 'function') {
            kantanVerEl.removeAttribute('data-embedded-version');
        }
        var profileInput = doc.getElementById('print-profile-file');
        if (profileInput) {
            try {
                profileInput.value = '';
            } catch (_) {}
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
        return true;
    }

    var SaveExportModule = {
        escapeTextareaMarkdown: escapeTextareaMarkdown,
        normalizeDocumentTitle: normalizeDocumentTitle,
        collectDocumentSaveState: collectDocumentSaveState,
        prepareSavePayload: prepareSavePayload,
        cleanupTemporaryDomForSave: cleanupTemporaryDomForSave,
        serializeSingleHtmlDocument: serializeSingleHtmlDocument,
        triggerBlobDownload: triggerBlobDownload
    };

    root.KantanModules = root.KantanModules || {};
    root.KantanModules.SaveExport = SaveExportModule;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SaveExportModule;
    }
})(typeof window !== 'undefined' ? window : globalThis);
