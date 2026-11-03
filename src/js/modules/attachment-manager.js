/**
 * attachment-manager.js
 * Module for attachment data management, unique filename resolution,
 * Base64 Data URL to Blob conversion, and attachment DOM collection.
 */

(function (root) {
    'use strict';

    /**
     * @typedef {Object} AttachmentRecord
     * @property {string} fileName - Unique attachment filename
     * @property {string} base64 - Data URL content
     * @property {string} layerContent - Drawer annotation PNG Data URL
     * @property {string} trimInfo - Drawer trim rectangle JSON string
     */

    /**
     * Resolves a unique attachment filename by appending _2, _3, etc. if the name already exists.
     * @param {string} desiredName - Initial filename
     * @param {(candidate: string) => boolean} existsFn - Callback returning true if candidate already exists
     * @returns {string} Unique filename
     */
    function resolveUniqueAttachName(desiredName, existsFn) {
        var name = desiredName;
        var index = 2;
        while (typeof existsFn === 'function' && existsFn(name)) {
            var pos = desiredName.lastIndexOf('.');
            pos = (pos !== -1) ? pos : desiredName.length;
            var base = desiredName.substring(0, pos);
            var ext = desiredName.substr(pos);
            name = base + '_' + index + ext;
            index++;
        }
        return name;
    }

    /**
     * Validates a proposed rename for an attachment.
     * @param {string} newName - Trimmed target filename
     * @param {string} currentName - Existing filename on the item
     * @param {(candidate: string) => boolean} existsFn - Callback checking if candidate already exists
     * @returns {{ valid: boolean, unchanged?: boolean, reason?: 'empty' | 'duplicate' }}
     */
    function validateAttachmentRename(newName, currentName, existsFn) {
        var trimmed = (newName || '').trim();
        if (trimmed === currentName) {
            return { valid: true, unchanged: true };
        }
        if (trimmed === '') {
            return { valid: false, reason: 'empty' };
        }
        if (typeof existsFn === 'function' && existsFn(trimmed)) {
            return { valid: false, reason: 'duplicate' };
        }
        return { valid: true, unchanged: false };
    }

    /**
     * Converts a Base64 Data URL into a Blob object.
     * @param {string} base64 - Data URL string (e.g. "data:image/png;base64,iVBOR...")
     * @returns {Blob}
     */
    function base64ToBlob(base64) {
        var match = (base64 || '').match(/^\s*data:(.*);base64/);
        var mimeType = match ? match[1] : 'application/octet-stream';
        var rawData = base64.replace(/^.*,/, '');
        var bin = typeof atob === 'function'
            ? atob(rawData)
            : Buffer.from(rawData, 'base64').toString('binary');
        var buffer = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) {
            buffer[i] = bin.charCodeAt(i);
        }
        return new Blob([buffer.buffer], { type: mimeType });
    }

    /**
     * Collects all attachment records from a #fileList container or document.
     * @param {ParentNode} rootNode - DOM container holding #fileList li elements
     * @returns {AttachmentRecord[]}
     */
    function collectAttachmentsFromDom(rootNode) {
        if (!rootNode || typeof rootNode.querySelectorAll !== 'function') {
            return [];
        }
        var items = rootNode.querySelectorAll('#fileList li');
        var records = [];
        for (var i = 0; i < items.length; i++) {
            var li = items[i];
            var base64Elem = li.querySelector('script');
            if (!base64Elem) continue;
            var layerElem = li.querySelector('script.layerContent');
            var trimElem = li.querySelector('script.trimInfo');
            records.push({
                fileName: base64Elem.title || '',
                base64: base64Elem.innerHTML || '',
                layerContent: layerElem ? (layerElem.innerHTML || '') : '',
                trimInfo: trimElem ? (trimElem.innerHTML || '') : ''
            });
        }
        return records;
    }

    /**
     * Safely decodes a URI component without throwing on malformed percent-encoding.
     * @param {string} raw
     * @returns {string}
     */
    function decodeAttachName(raw) {
        if (typeof raw !== 'string') return '';
        try {
            return decodeURIComponent(raw);
        } catch (_) {
            return raw;
        }
    }

    /**
     * Extracts and decodes the attachment filename from an "attach:..." reference string.
     * Returns null for non-attach URLs or empty targets.
     * @param {string} val
     * @returns {string | null}
     */
    function extractAttachName(val) {
        if (!val || typeof val !== 'string') return null;
        var m = val.trim().match(/^attach:(.+)/);
        if (!m) return null;
        var decoded = decodeAttachName(m[1]);
        return decoded ? decoded : null;
    }

    /**
     * Escapes special characters for safe inclusion inside a double-quoted HTML attribute.
     * @param {string} str
     * @returns {string}
     */
    function escapeHtmlAttr(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    /**
     * Escapes special characters for safe inclusion in HTML text content.
     * @param {string} str
     * @returns {string}
     */
    function escapeHtmlText(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    /**
     * Determines whether an attachment is a video based on its Data URL MIME type or fallback extension.
     * @param {string} fileName - Attachment filename
     * @param {string} dataUrl - Attachment Data URL
     * @returns {boolean}
     */
    function isVideoAttachment(fileName, dataUrl) {
        if (!dataUrl || typeof dataUrl !== 'string') {
            return false;
        }
        var m = dataUrl.match(/^\s*data:([^;]*);base64,([\s\S]*)$/i);
        if (!m || !m[2] || m[2].trim() === '') {
            return false;
        }
        var mime = (m[1] || '').trim().toLowerCase();
        if (mime.indexOf('video/') === 0) {
            return true;
        }
        if (mime !== '' && mime !== 'application/octet-stream') {
            return false;
        }
        return Boolean(fileName && typeof fileName === 'string' && /\.(?:mp4|webm|ogv|ogg|mov|m4v)$/i.test(fileName.trim()));
    }

    /**
     * Builds the appropriate Markdown/HTML/CSS tag to insert for an attachment.
     * @param {string} fileName - Attachment filename
     * @param {string} dataUrl - Attachment Data URL
     * @param {'markdown' | 'css'} targetType - Active editor tab type
     * @returns {string} Tag string to insert
     */
    function buildAttachmentInsertTag(fileName, dataUrl, targetType) {
        var isImage = Boolean(dataUrl && typeof dataUrl === 'string' && dataUrl.match(/^\s*data:image\/.+?;base64,\S/i));
        var isVideo = !isImage && isVideoAttachment(fileName, dataUrl);
        var safeAttr = escapeHtmlAttr(fileName);
        var safeText = escapeHtmlText(fileName);
        if (targetType === 'css') {
            return isImage ? 'url("attach:' + safeAttr + '")' : '';
        }
        if (isImage) {
            return '<img src="attach:' + safeAttr + '">';
        }
        if (isVideo) {
            return '<a href="attach:' + safeAttr + '">' + safeText + '</a><br>\n<video controls preload="metadata" playsinline src="attach:' + safeAttr + '"></video>';
        }
        return '<a href="attach:' + safeAttr + '">' + safeText + '</a>';
    }

    var AttachmentManagerModule = {
        resolveUniqueAttachName: resolveUniqueAttachName,
        validateAttachmentRename: validateAttachmentRename,
        base64ToBlob: base64ToBlob,
        collectAttachmentsFromDom: collectAttachmentsFromDom,
        decodeAttachName: decodeAttachName,
        extractAttachName: extractAttachName,
        isVideoAttachment: isVideoAttachment,
        buildAttachmentInsertTag: buildAttachmentInsertTag
    };

    root.KantanModules = root.KantanModules || {};
    root.KantanModules.AttachmentManager = AttachmentManagerModule;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AttachmentManagerModule;
    }
})(typeof window !== 'undefined' ? window : globalThis);
