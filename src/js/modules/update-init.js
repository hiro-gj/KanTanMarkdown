/**
 * update-init.js
 * Module for DOM event lifecycle management (preventing duplicate listeners on update/re-init),
 * version/edition formatting, and update script URL resolution.
 */

(function (root) {
    'use strict';

    var RELEASE_UPDATE_URL = 'https://hiro-gj.github.io/KanTanMarkdown/dist/kantanUpdate.js';
    var PREVIEW_UPDATE_URL = 'https://hiro-gj.github.io/KanTanMarkdown/dist/preview/kantanUpdate.js';

    /**
     * Resolves the appropriate kantanUpdate.js URL depending on whether the current page
     * or button href targets the preview environment (/dist/preview/).
     * @param {string} [locationPathname]
     * @param {string} [currentHref]
     * @returns {string}
     */
    function resolveUpdateScriptUrl(locationPathname, currentHref) {
        var pathStr = locationPathname || '';
        var hrefStr = currentHref || '';
        if (pathStr.indexOf('/dist/preview/') !== -1 || hrefStr.indexOf('/dist/preview/') !== -1) {
            return PREVIEW_UPDATE_URL;
        }
        return RELEASE_UPDATE_URL;
    }

    /**
     * Formats the version and edition display label (e.g. "v2.20261102.3_full").
     * @param {string} version
     * @param {string} edition
     * @returns {string}
     */
    function formatVersionEditionLabel(version, edition) {
        return (version || '') + '_' + (edition || '');
    }

    /**
     * Parses a KanTanMarkdown version string (e.g. "v3.20261102.1") into numeric tuple [major, date, seq].
     * @param {string} version
     * @returns {number[]|null}
     */
    function parseVersionTuple(version) {
        if (typeof version !== 'string') return null;
        var m = version.trim().match(/^v?(\d+)\.(\d+)\.(\d+)$/);
        if (!m) return null;
        return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
    }

    /**
     * Compares two KanTanMarkdown version strings.
     * Returns > 0 if verA > verB, < 0 if verA < verB, 0 if equal.
     * @param {string} verA
     * @param {string} verB
     * @returns {number}
     */
    function compareVersions(verA, verB) {
        var a = parseVersionTuple(verA);
        var b = parseVersionTuple(verB);
        if (a && b) {
            for (var i = 0; i < 3; i++) {
                if (a[i] !== b[i]) return a[i] - b[i];
            }
            return 0;
        }
        var strA = String(verA || '').trim();
        var strB = String(verB || '').trim();
        if (strA === strB) return 0;
        return strA > strB ? 1 : -1;
    }

    /**
     * Determines whether the displayed/hidden version should be updated with fetchedVersion.
     * Prevents downgrading a newer embedded document version (e.g. v3.20261102.1) with a stale
     * remote version (e.g. v2.20261102.3).
     * @param {string} currentVersion
     * @param {string} fetchedVersion
     * @returns {boolean}
     */
    function shouldUpdateDisplayedVersion(currentVersion, fetchedVersion) {
        var fetched = String(fetchedVersion || '').trim();
        if (!fetched) return false;
        var current = String(currentVersion || '').trim();
        if (!current) return true;
        return compareVersions(fetched, current) >= 0;
    }

    /**
     * Creates an event listener registry that tracks registered handlers, avoids exact duplicate
     * registration on the same element/event/callback, and supports clean bulk removal during updates.
     * @param {Document} [defaultDoc]
     */
    function createEventRegistry(defaultDoc) {
        var listeners = [];

        function register(elementOrQuery, eventName, callback, docRef) {
            var d = docRef || defaultDoc || (typeof document !== 'undefined' ? document : null);
            var elements;
            if (typeof elementOrQuery === 'string') {
                elements = d && typeof d.querySelectorAll === 'function'
                    ? d.querySelectorAll(elementOrQuery)
                    : [];
            } else if (elementOrQuery) {
                elements = [elementOrQuery];
            } else {
                elements = [];
            }

            for (var i = 0; i < elements.length; i++) {
                var el = elements[i];
                if (!el || typeof el.addEventListener !== 'function') continue;

                // Prevent duplicate registration of the exact same element, eventName, and callback
                var alreadyRegistered = false;
                for (var j = 0; j < listeners.length; j++) {
                    if (listeners[j].element === el &&
                        listeners[j].eventName === eventName &&
                        listeners[j].callback === callback) {
                        alreadyRegistered = true;
                        break;
                    }
                }
                if (alreadyRegistered) continue;

                el.addEventListener(eventName, callback);
                listeners.push({
                    element: el,
                    eventName: eventName,
                    callback: callback
                });
            }
        }

        function removeAll() {
            for (var i = 0; i < listeners.length; i++) {
                var item = listeners[i];
                if (item.element && typeof item.element.removeEventListener === 'function') {
                    item.element.removeEventListener(item.eventName, item.callback);
                }
            }
            listeners = [];
        }

        function count() {
            return listeners.length;
        }

        function getListeners() {
            return listeners;
        }

        return {
            register: register,
            removeAll: removeAll,
            count: count,
            getListeners: getListeners
        };
    }

    var UpdateInitModule = {
        RELEASE_UPDATE_URL: RELEASE_UPDATE_URL,
        PREVIEW_UPDATE_URL: PREVIEW_UPDATE_URL,
        resolveUpdateScriptUrl: resolveUpdateScriptUrl,
        formatVersionEditionLabel: formatVersionEditionLabel,
        parseVersionTuple: parseVersionTuple,
        compareVersions: compareVersions,
        shouldUpdateDisplayedVersion: shouldUpdateDisplayedVersion,
        createEventRegistry: createEventRegistry
    };

    root.KantanModules = root.KantanModules || {};
    root.KantanModules.UpdateInit = UpdateInitModule;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = UpdateInitModule;
    }
})(typeof window !== 'undefined' ? window : globalThis);
