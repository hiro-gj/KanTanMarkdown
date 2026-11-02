/**
 * settings-ui.js
 * Module for LocalStorage settings persistence, editor zoom steps,
 * A4 page-break boundary calculation, and scroll synchronization ratio calculation.
 */

(function (root) {
    'use strict';

    var STORAGE_PREFIX = 'com.tatesuke.ktm.';
    var DEFAULT_EDITOR_ZOOM = 0.67;
    var EDITOR_ZOOM_STEPS = [0.67, 1, 1.2, 1.4, 1.6, 1.8, 2];

    /**
     * Formats a setting key with the KanTanMarkdown localStorage prefix.
     * @param {string} name
     * @returns {string}
     */
    function formatStorageKey(name) {
        return STORAGE_PREFIX + name;
    }

    /**
     * Safely reads a setting value from localStorage.
     * @param {string} name
     * @param {*} defaultValue
     * @param {Storage} [storage]
     * @returns {*}
     */
    function getStorageItem(name, defaultValue, storage) {
        try {
            var store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
            if (!store) return defaultValue;
            var value = store.getItem(formatStorageKey(name));
            return (value != null) ? value : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }

    /**
     * Safely writes a setting value to localStorage.
     * @param {string} name
     * @param {*} value
     * @param {Storage} [storage]
     * @returns {boolean}
     */
    function setStorageItem(name, value, storage) {
        try {
            var store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
            if (!store) return false;
            store.setItem(formatStorageKey(name), String(value));
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Returns the next editor zoom level from the predefined step list.
     * @param {number} currentZoom
     * @returns {number}
     */
    function getNextEditorZoom(currentZoom) {
        for (var i = 0; i < EDITOR_ZOOM_STEPS.length; i++) {
            if (EDITOR_ZOOM_STEPS[i] > currentZoom + 0.01) {
                return EDITOR_ZOOM_STEPS[i];
            }
        }
        return EDITOR_ZOOM_STEPS[EDITOR_ZOOM_STEPS.length - 1];
    }

    /**
     * Clamps pane resize width percentage between 20 and 80.
     * @param {number} percentage
     * @returns {number}
     */
    function clampPaneWidthPercent(percentage) {
        if (typeof percentage !== 'number' || isNaN(percentage)) return 50;
        return Math.max(20, Math.min(80, percentage));
    }

    /**
     * Calculates A4 portrait page height from a given container width.
     * @param {number} containerWidth
     * @returns {number}
     */
    function calculateA4PageHeight(containerWidth) {
        if (!containerWidth || containerWidth <= 0) return 0;
        return containerWidth * (297 / 210);
    }

    /**
     * Determines whether a page-break indicator should be inserted before a block element.
     * @param {{ elTop: number, elBottom: number, elHeight: number, tagName: string, nextBreak: number, pageHeight: number, index: number }} params
     * @returns {boolean}
     */
    function shouldInsertPageBreak(params) {
        if (!params || params.index <= 0 || params.pageHeight <= 0) return false;
        var isHeading = /^H[1-6]$/i.test(params.tagName || '');
        if (isHeading && params.elTop > params.nextBreak - 120 && params.elTop <= params.nextBreak + 120) {
            return true;
        }
        if (params.elTop >= params.nextBreak) {
            return true;
        }
        if (params.elTop < params.nextBreak && params.elBottom > params.nextBreak && params.elHeight < params.pageHeight * 0.75) {
            return true;
        }
        return false;
    }

    /**
     * Calculates synchronized scroll position for the target pane based on source scroll ratio.
     * @param {{ scrollTop: number, scrollHeight: number, clientHeight: number }} sourceMetrics
     * @param {{ scrollHeight: number, clientHeight: number }} targetMetrics
     * @returns {number}
     */
    function calculateSyncedScrollTop(sourceMetrics, targetMetrics) {
        if (!sourceMetrics || !targetMetrics) return 0;
        var sourceMax = sourceMetrics.scrollHeight - sourceMetrics.clientHeight;
        var targetMax = targetMetrics.scrollHeight - targetMetrics.clientHeight;
        if (sourceMax <= 0 || targetMax <= 0) return 0;
        var ratio = sourceMetrics.scrollTop / sourceMax;
        return ratio * targetMax;
    }

    var SettingsUiModule = {
        STORAGE_PREFIX: STORAGE_PREFIX,
        DEFAULT_EDITOR_ZOOM: DEFAULT_EDITOR_ZOOM,
        EDITOR_ZOOM_STEPS: EDITOR_ZOOM_STEPS,
        formatStorageKey: formatStorageKey,
        getStorageItem: getStorageItem,
        setStorageItem: setStorageItem,
        getNextEditorZoom: getNextEditorZoom,
        clampPaneWidthPercent: clampPaneWidthPercent,
        calculateA4PageHeight: calculateA4PageHeight,
        shouldInsertPageBreak: shouldInsertPageBreak,
        calculateSyncedScrollTop: calculateSyncedScrollTop
    };

    root.KantanModules = root.KantanModules || {};
    root.KantanModules.SettingsUi = SettingsUiModule;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SettingsUiModule;
    }
})(typeof window !== 'undefined' ? window : globalThis);
