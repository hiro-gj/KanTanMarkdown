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
    var MM_TO_PX_RATIO = 96 / 25.4;

    var ADOPTED_PRINT_PROFILE = {
        schemaVersion: 1,
        status: 'adopted-for-planning',
        source: {
            browser: 'Chrome',
            kind: 'saved-preferences',
            liveValuesVerified: false,
            overrides: {
                margins: 'user-specified-10mm-each-side'
            }
        },
        paper: {
            widthMm: 210,
            heightMm: 297,
            landscape: false
        },
        margins: {
            mode: 'custom',
            effectiveMm: { top: 10, right: 10, bottom: 10, left: 10 }
        },
        scaling: {
            mode: 'custom',
            percent: 100
        },
        headerFooterEnabled: false,
        backgroundsEnabled: true,
        contentAreaMm: { width: 190, height: 277 },
        measurementReady: true,
        cssApplied: true,
        warnings: [
            'Margins are an explicit user override, not an observed Chrome preference.',
            'Verify the print dialog and output PDF use A4 portrait, 10mm margins and 100 percent scaling.'
        ]
    };

    function isFiniteNumber(val) {
        return typeof val === 'number' && isFinite(val);
    }

    function cloneDefaultAdoptedProfile() {
        return JSON.parse(JSON.stringify(ADOPTED_PRINT_PROFILE));
    }

    function mmToCssPx(mm) {
        if (typeof mm !== 'number' || !isFinite(mm) || mm <= 0) return 0;
        return mm * MM_TO_PX_RATIO;
    }

    function cssPxToMm(px) {
        if (typeof px !== 'number' || !isFinite(px) || px <= 0) return 0;
        return px / MM_TO_PX_RATIO;
    }

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

    function parseProfileInput(raw, opts) {
        if (typeof raw === 'string') {
            var s = raw.trim();
            if (!s) return { err: 'empty-input', msg: 'JSONが空です。' };
            try { raw = JSON.parse(s); } catch (e) { return { err: 'invalid-json', msg: '無効なJSON形式です。' }; }
        }
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { err: 'invalid-object', msg: '形式不正' };
        if (raw.schemaVersion !== 1) return { err: 'unsupported-schema-version', msg: '未対応schemaVersion' };
        if (Array.isArray(raw.browsers) && raw.browsers.length > 0) {
            var bName = (opts && opts.browser) ? String(opts.browser) : 'Chrome';
            var m = raw.browsers[0];
            for (var i = 0; i < raw.browsers.length; i++) {
                if (raw.browsers[i] && raw.browsers[i].browser === bName) { m = raw.browsers[i]; break; }
            }
            return {
                obj: {
                    schemaVersion: 1, status: 'observed-preferences',
                    source: { browser: m.browser || null, browserVersion: m.browserVersion || null, kind: m.sourceKind || 'saved-preferences', capturedAt: m.capturedAt || null, liveValuesVerified: Boolean(m.liveValuesVerified) },
                    paper: m.paper || null, margins: m.margins || null, scaling: m.scaling || null,
                    headerFooterEnabled: m.headerFooterEnabled, backgroundsEnabled: m.backgroundsEnabled,
                    warnings: Array.isArray(m.warnings) ? m.warnings.slice() : []
                }
            };
        }
        return { obj: raw };
    }

    function validateAndNormalizePrintProfile(rawInput, options) {
        var pre = parseProfileInput(rawInput, options);
        if (pre.err) {
            return { valid: false, measurementReady: false, supported: false, status: 'invalid', reasons: [pre.err], warnings: [pre.msg], profile: null, contentAreaMm: null, contentAreaPx: null };
        }
        var t = pre.obj, r = [], w = [];
        if (Array.isArray(t.warnings)) {
            for (var i = 0; i < t.warnings.length; i++) if (typeof t.warnings[i] === 'string') w.push(t.warnings[i]);
        }
        var src = (t.source && typeof t.source === 'object') ? t.source : {};
        var bName = typeof src.browser === 'string' ? src.browser : (typeof t.browser === 'string' ? t.browser : 'Chrome');
        if (bName !== 'Chrome') r.push('unsupported-browser');

        var p = (t.paper && typeof t.paper === 'object') ? t.paper : {};
        var wMm = isFiniteNumber(p.widthMm) && p.widthMm > 0 ? Number(p.widthMm) : null;
        var hMm = isFiniteNumber(p.heightMm) && p.heightMm > 0 ? Number(p.heightMm) : null;
        var land = typeof p.landscape === 'boolean' ? p.landscape : null;
        if (wMm == null || hMm == null) r.push('missing-paper-size');
        else if (Math.abs(wMm - 210) > 0.5 || Math.abs(hMm - 297) > 0.5) r.push('unsupported-paper-size');
        if (land === null) r.push('missing-orientation');
        else if (land === true) r.push('landscape-orientation');

        var mg = (t.margins && typeof t.margins === 'object') ? t.margins : {};
        var mMode = typeof mg.mode === 'string' ? mg.mode : 'unknown';
        var effMm = null;
        if (!(mg.storedCustomMarginsActive === false && mMode !== 'custom') && mg.effectiveMm && typeof mg.effectiveMm === 'object') {
            var em = mg.effectiveMm;
            if (isFiniteNumber(em.top) && em.top >= 0 && isFiniteNumber(em.right) && em.right >= 0 &&
                isFiniteNumber(em.bottom) && em.bottom >= 0 && isFiniteNumber(em.left) && em.left >= 0) {
                effMm = { top: Number(em.top), right: Number(em.right), bottom: Number(em.bottom), left: Number(em.left) };
            }
        }
        if (mMode !== 'custom' && mMode !== 'none') r.push('unsupported-margin-mode');
        if (!effMm) r.push('missing-effective-margins');
        else if (Math.abs(effMm.top - 10) > 0.5 || Math.abs(effMm.right - 10) > 0.5 || Math.abs(effMm.bottom - 10) > 0.5 || Math.abs(effMm.left - 10) > 0.5) r.push('non-adopted-margins');

        return finalizePrintProfileValidation(t, bName, wMm, hMm, land, mMode, effMm, r, w);
    }

    function finalizePrintProfileValidation(t, bName, wMm, hMm, land, mMode, effMm, r, w) {
        var sc = (t.scaling && typeof t.scaling === 'object') ? t.scaling : {};
        var sMode = typeof sc.mode === 'string' ? sc.mode : 'unknown';
        var pct = isFiniteNumber(sc.percent) ? Number(sc.percent) : (isFiniteNumber(sc.effectivePercent) ? Number(sc.effectivePercent) : null);
        if (sMode !== 'custom' && sMode !== 'default') r.push('unsupported-scaling-mode');
        if (pct == null) r.push('missing-scaling-percent');
        else if (Math.abs(pct - 100) > 0.01) r.push('unsupported-scaling-percent');

        var hf = typeof t.headerFooterEnabled === 'boolean' ? t.headerFooterEnabled : null;
        if (hf === null) r.push('missing-header-footer-setting');
        else if (hf === true) r.push('header-footer-enabled');

        var bg = typeof t.backgroundsEnabled === 'boolean' ? t.backgroundsEnabled : null;
        if (bg === null) r.push('missing-backgrounds-setting');
        else if (bg === false) r.push('backgrounds-disabled');

        var cMm = null, cPx = null;
        if (wMm != null && hMm != null && effMm != null && land !== null) {
            var cw = (land ? hMm : wMm) - effMm.left - effMm.right;
            var ch = (land ? wMm : hMm) - effMm.top - effMm.bottom;
            if (cw > 0 && ch > 0) {
                cMm = { width: Math.round(cw * 1000) / 1000, height: Math.round(ch * 1000) / 1000 };
                cPx = { width: mmToCssPx(cMm.width), height: mmToCssPx(cMm.height) };
            } else r.push('invalid-content-area');
        }
        var ok = r.length === 0 && cMm !== null && cPx !== null;
        var src = (t.source && typeof t.source === 'object') ? t.source : {};
        return {
            valid: true, measurementReady: ok, supported: ok, status: ok ? 'ready' : 'unready',
            reasons: r, warnings: w,
            profile: {
                schemaVersion: 1, status: typeof t.status === 'string' ? t.status : (ok ? 'ready' : 'unready'),
                source: { browser: bName, browserVersion: typeof src.browserVersion === 'string' ? src.browserVersion : null, kind: typeof src.kind === 'string' ? src.kind : 'saved-preferences', capturedAt: typeof src.capturedAt === 'string' ? src.capturedAt : null, liveValuesVerified: Boolean(src.liveValuesVerified), overrides: (src.overrides && typeof src.overrides === 'object') ? src.overrides : {} },
                paper: { widthMm: wMm, heightMm: hMm, landscape: land },
                margins: { mode: mMode, effectiveMm: effMm },
                scaling: { mode: sMode, percent: pct },
                headerFooterEnabled: hf, backgroundsEnabled: bg,
                contentAreaMm: cMm, measurementReady: ok, cssApplied: ok, warnings: w
            },
            contentAreaMm: cMm, contentAreaPx: cPx
        };
    }

    function formatPrintProfileStatusText(vr) {
        if (!vr || !vr.valid || !vr.profile) {
            return {
                statusLabel: '未準備（無効なプロファイルJSON）',
                conditionLabel: '有効なプロファイルが読み込まれていません。既存設定を維持します。',
                guidanceLabel: 'Chromeの印刷設定を A4縦・余白10mm・倍率100%・ヘッダー／フッターOFF・背景ON に合わせ、プロファイルJSONを再選択してください。'
            };
        }
        var p = vr.profile;
        var paperStr = (p.paper.widthMm && p.paper.heightMm) ? (p.paper.widthMm + '×' + p.paper.heightMm + 'mm ' + (p.paper.landscape ? '横' : '縦')) : '用紙不明';
        var marginStr = p.margins.effectiveMm ? ('余白' + p.margins.effectiveMm.top + 'mm') : ('余白未確定(' + p.margins.mode + ')');
        var scaleStr = p.scaling.percent != null ? (p.scaling.percent + '%') : '倍率不明';
        var hfStr = p.headerFooterEnabled === false ? 'ヘッダー/フッターOFF' : 'ヘッダー/フッターON/不明';
        var bgStr = p.backgroundsEnabled === true ? '背景ON' : '背景OFF/不明';
        var baseCond = p.source.browser + ' / ' + paperStr + ' / ' + marginStr + ' / 倍率' + scaleStr + ' / ' + hfStr + ' / ' + bgStr;
        if (vr.measurementReady && vr.contentAreaMm) {
            return {
                statusLabel: '準備完了（採用印刷条件・計測有効）',
                conditionLabel: baseCond + '（有効本文領域 ' + vr.contentAreaMm.width + '×' + vr.contentAreaMm.height + 'mm）',
                guidanceLabel: 'ブラウザの印刷設定変更後は再取り込みが必要です。印刷画面でもA4縦・余白10mm・倍率100%・ヘッダー/フッターOFF・背景ONを確認してください。'
            };
        }
        return {
            statusLabel: '未準備・目安対象外（' + ((vr.reasons && vr.reasons.join(', ')) || '条件不一致') + '）',
            conditionLabel: baseCond,
            guidanceLabel: '改ページ目安は対象外です（横向きや他用紙での実印刷は妨げません）。目安を表示するにはChromeの印刷設定を採用条件に合わせて再取り込みしてください。'
        };
    }

    function computePageBreakModel(blocks, options) {
        var opts = options || {};
        var pageHeightPx = isFiniteNumber(opts.pageHeightPx) && opts.pageHeightPx > 0
            ? Number(opts.pageHeightPx)
            : mmToCssPx(277);
        var pageWidthPx = isFiniteNumber(opts.pageWidthPx) && opts.pageWidthPx > 0
            ? Number(opts.pageWidthPx)
            : mmToCssPx(190);

        if (!Array.isArray(blocks) || blocks.length === 0 || pageHeightPx <= 0) {
            return {
                measurementReady: pageHeightPx > 0,
                pageWidthPx: pageWidthPx,
                pageHeightPx: pageHeightPx,
                totalPages: 1,
                breaks: [],
                blockPages: []
            };
        }

        var EPS = 0.5;
        var state = { currentPage: 1, pageStartY: 0, breaks: [], blockPages: [], pendingForceBreak: false };

        function pushBreak(params) {
            state.currentPage++;
            state.breaks.push({
                pageNumber: state.currentPage,
                breakIndex: state.breaks.length,
                blockIndex: params.blockIndex,
                isToc: Boolean(params.isToc),
                anchorType: params.anchorType || 'before-block',
                reason: params.reason || 'page-overflow',
                subIndex: params.subIndex != null ? params.subIndex : null,
                charOffset: params.charOffset != null ? params.charOffset : null,
                offsetRatio: isFiniteNumber(params.offsetRatio) ? Math.max(0, Math.min(1, params.offsetRatio)) : 0,
                printY: params.printY
            });
            state.pageStartY = params.printY;
        }

        for (var i = 0; i < blocks.length; i++) {
            processBlockForPageBreak(blocks, i, pageHeightPx, EPS, state, pushBreak);
        }

        return {
            measurementReady: true,
            pageWidthPx: pageWidthPx,
            pageHeightPx: pageHeightPx,
            totalPages: state.currentPage,
            breaks: state.breaks,
            blockPages: state.blockPages
        };
    }

    function processBlockForPageBreak(blocks, i, pageHeightPx, EPS, state, pushBreak) {
        var b = blocks[i];
        if (!b || !isFiniteNumber(b.top) || !isFiniteNumber(b.bottom)) return;
        var bTop = Number(b.top);
        var bBottom = Number(b.bottom);
        var bHeight = isFiniteNumber(b.height) ? Number(b.height) : Math.max(0, bBottom - bTop);
        if (bBottom < bTop) bBottom = bTop + Math.max(0, bHeight);
        var bIndex = b.blockIndex != null ? b.blockIndex : i;
        var isHeading = Boolean(b.isHeading || /^H[1-6]$/i.test(b.tagName || ''));
        var limitY = state.pageStartY + pageHeightPx;

        if ((b.forceBreakBefore || state.pendingForceBreak) && (i > 0 || bTop > state.pageStartY + EPS)) {
            pushBreak({
                blockIndex: bIndex, isToc: b.isToc, anchorType: 'before-block',
                reason: state.pendingForceBreak ? 'explicit-break-after' : 'explicit-break-before',
                offsetRatio: 0, printY: bTop
            });
            state.pendingForceBreak = false;
            limitY = state.pageStartY + pageHeightPx;
        }
        state.pendingForceBreak = false;

        if (bTop >= limitY - EPS && bTop > state.pageStartY + EPS) {
            while (bTop >= state.pageStartY + pageHeightPx * 2 - EPS) {
                pushBreak({
                    blockIndex: bIndex, isToc: b.isToc, anchorType: 'before-block',
                    reason: 'page-overflow', offsetRatio: 0, printY: state.pageStartY + pageHeightPx
                });
            }
            pushBreak({
                blockIndex: bIndex, isToc: b.isToc, anchorType: 'before-block',
                reason: 'page-overflow', offsetRatio: 0, printY: bTop
            });
            limitY = state.pageStartY + pageHeightPx;
        }

        if (isHeading && b.avoidBreakAfter && bBottom <= limitY + EPS && bTop > state.pageStartY + EPS && i + 1 < blocks.length) {
            var nextB = blocks[i + 1];
            if (nextB && isFiniteNumber(nextB.top) && isFiniteNumber(nextB.bottom)) {
                var nextMinBottom = nextB.bottom;
                if (!nextB.avoidBreakInside && Array.isArray(nextB.subItems) && nextB.subItems.length > 0) {
                    nextMinBottom = nextB.subItems[0].bottom;
                }
                if (nextMinBottom > limitY + EPS) {
                    pushBreak({
                        blockIndex: bIndex, isToc: b.isToc, anchorType: 'before-block',
                        reason: 'heading-keep-with-next', offsetRatio: 0, printY: bTop
                    });
                    limitY = state.pageStartY + pageHeightPx;
                }
            }
        }

        if (bBottom > limitY + EPS) {
            processBlockOverflow(b, bIndex, bTop, bBottom, bHeight, isHeading, pageHeightPx, EPS, state, pushBreak);
        }

        var startPageForBlock = 1;
        for (var brkIdx = 0; brkIdx < state.breaks.length; brkIdx++) {
            if (state.breaks[brkIdx].printY <= bTop + EPS) startPageForBlock = state.breaks[brkIdx].pageNumber;
        }
        state.blockPages.push({ blockIndex: bIndex, isToc: Boolean(b.isToc), startPage: startPageForBlock, endPage: state.currentPage });
        if (b.forceBreakAfter) state.pendingForceBreak = true;
    }

    function processBlockOverflow(b, bIndex, bTop, bBottom, bHeight, isHeading, pageHeightPx, EPS, state, pushBreak) {
        if (b.avoidBreakInside) {
            if (bTop > state.pageStartY + EPS) {
                pushBreak({
                    blockIndex: bIndex, isToc: b.isToc, anchorType: 'before-block',
                    reason: 'avoid-break-inside', offsetRatio: 0, printY: bTop
                });
            }
            while (bBottom > state.pageStartY + pageHeightPx + EPS) {
                var sliceY = state.pageStartY + pageHeightPx;
                pushBreak({
                    blockIndex: bIndex, isToc: b.isToc, anchorType: 'inside-block',
                    reason: 'long-block-slice',
                    offsetRatio: bHeight > 0 ? (sliceY - bTop) / bHeight : 0, printY: sliceY
                });
            }
            return;
        }
        if (Array.isArray(b.subItems) && b.subItems.length > 0) {
            for (var sIdx = 0; sIdx < b.subItems.length; sIdx++) {
                var sub = b.subItems[sIdx];
                if (!sub || !isFiniteNumber(sub.top) || !isFiniteNumber(sub.bottom)) continue;
                var subTop = Number(sub.top), subBottom = Number(sub.bottom);
                var subHeight = isFiniteNumber(sub.height) ? Number(sub.height) : Math.max(0, subBottom - subTop);
                var limitY = state.pageStartY + pageHeightPx;
                if (subBottom <= limitY + EPS) continue;

                if (sIdx === 0 && subTop > state.pageStartY + EPS && subHeight <= pageHeightPx + EPS) {
                    pushBreak({
                        blockIndex: bIndex, isToc: b.isToc, anchorType: 'before-block',
                        reason: 'subitem-overflow', offsetRatio: 0, printY: bTop
                    });
                } else if (subTop > state.pageStartY + EPS) {
                    pushBreak({
                        blockIndex: bIndex, isToc: b.isToc, anchorType: 'inside-block',
                        reason: 'subitem-overflow',
                        subIndex: sub.subIndex != null ? sub.subIndex : sIdx,
                        charOffset: sub.charOffset != null ? sub.charOffset : null,
                        offsetRatio: bHeight > 0 ? (subTop - bTop) / bHeight : 0, printY: subTop
                    });
                }
                while (subBottom > state.pageStartY + pageHeightPx + EPS) {
                    var subSliceY = state.pageStartY + pageHeightPx;
                    pushBreak({
                        blockIndex: bIndex, isToc: b.isToc, anchorType: 'inside-block',
                        reason: 'long-block-slice',
                        subIndex: sub.subIndex != null ? sub.subIndex : sIdx,
                        charOffset: sub.charOffset != null ? sub.charOffset : null,
                        offsetRatio: bHeight > 0 ? (subSliceY - bTop) / bHeight : 0, printY: subSliceY
                    });
                }
            }
            while (bBottom > state.pageStartY + pageHeightPx + EPS) {
                var tailSliceY = state.pageStartY + pageHeightPx;
                pushBreak({
                    blockIndex: bIndex, isToc: b.isToc, anchorType: 'inside-block',
                    reason: 'long-block-slice',
                    offsetRatio: bHeight > 0 ? (tailSliceY - bTop) / bHeight : 0, printY: tailSliceY
                });
            }
            return;
        }
        if ((isHeading || bHeight <= 36) && bTop > state.pageStartY + EPS) {
            pushBreak({
                blockIndex: bIndex, isToc: b.isToc, anchorType: 'before-block',
                reason: 'page-overflow', offsetRatio: 0, printY: bTop
            });
        }
        while (bBottom > state.pageStartY + pageHeightPx + EPS) {
            var rawSliceY = state.pageStartY + pageHeightPx;
            pushBreak({
                blockIndex: bIndex, isToc: b.isToc, anchorType: 'inside-block',
                reason: 'long-block-slice',
                offsetRatio: bHeight > 0 ? (rawSliceY - bTop) / bHeight : 0, printY: rawSliceY
            });
        }
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

    function mapBreaksToScreenPositions(breaks, screenBlocks) {
        if (!Array.isArray(breaks) || breaks.length === 0 || !Array.isArray(screenBlocks) || screenBlocks.length === 0) {
            return [];
        }
        var blockMap = {};
        for (var i = 0; i < screenBlocks.length; i++) {
            var sb = screenBlocks[i];
            if (!sb) continue;
            var key = (sb.isToc ? 'toc:' : 'body:') + String(sb.blockIndex != null ? sb.blockIndex : i);
            blockMap[key] = { block: sb, arrayIndex: i };
        }

        var mapped = [];
        for (var j = 0; j < breaks.length; j++) {
            var brk = breaks[j];
            if (!brk) continue;
            var lookupKey = (brk.isToc ? 'toc:' : 'body:') + String(brk.blockIndex);
            var entry = blockMap[lookupKey];
            if (!entry) continue;

            var targetBlock = entry.block;
            var bTop = Number(targetBlock.top) || 0;
            var bBottom = Number(targetBlock.bottom) || bTop;
            var bHeight = isFiniteNumber(targetBlock.height) ? Number(targetBlock.height) : Math.max(0, bBottom - bTop);
            var screenY = bTop;

            if (brk.anchorType === 'before-block') {
                screenY = bTop;
                if (entry.arrayIndex > 0) {
                    var prevBlock = screenBlocks[entry.arrayIndex - 1];
                    if (prevBlock && Boolean(prevBlock.isToc) === Boolean(targetBlock.isToc) && isFiniteNumber(prevBlock.bottom)) {
                        var gap = bTop - Number(prevBlock.bottom);
                        if (gap > 2) screenY = bTop - Math.min(8, gap / 2);
                    }
                }
            } else {
                var resolvedTop = null;
                if (brk.charOffset != null && typeof targetBlock.resolveCharOffsetTop === 'function') {
                    var charTop = targetBlock.resolveCharOffsetTop(brk.charOffset);
                    if (isFiniteNumber(charTop)) resolvedTop = Number(charTop);
                }
                if (resolvedTop == null && brk.subIndex != null && Array.isArray(targetBlock.subItems)) {
                    for (var s = 0; s < targetBlock.subItems.length; s++) {
                        var subItem = targetBlock.subItems[s];
                        var candidateIdx = subItem && subItem.subIndex != null ? subItem.subIndex : s;
                        if (subItem && candidateIdx === brk.subIndex && isFiniteNumber(subItem.top)) {
                            resolvedTop = Number(subItem.top);
                            break;
                        }
                    }
                }
                if (resolvedTop != null) {
                    screenY = Math.max(bTop, Math.min(bBottom, resolvedTop));
                } else {
                    var ratio = isFiniteNumber(brk.offsetRatio) ? Math.max(0, Math.min(1, Number(brk.offsetRatio))) : 0;
                    screenY = bTop + bHeight * ratio;
                }
            }

            mapped.push({
                pageNumber: brk.pageNumber,
                breakIndex: brk.breakIndex != null ? brk.breakIndex : j,
                blockIndex: brk.blockIndex,
                isToc: Boolean(brk.isToc),
                anchorType: brk.anchorType || 'before-block',
                reason: brk.reason || 'page-overflow',
                screenY: Math.round(screenY * 100) / 100
            });
        }
        return mapped;
    }

    var SettingsUiModule = {
        STORAGE_PREFIX: STORAGE_PREFIX,
        DEFAULT_EDITOR_ZOOM: DEFAULT_EDITOR_ZOOM,
        EDITOR_ZOOM_STEPS: EDITOR_ZOOM_STEPS,
        MM_TO_PX_RATIO: MM_TO_PX_RATIO,
        ADOPTED_PRINT_PROFILE: ADOPTED_PRINT_PROFILE,
        cloneDefaultAdoptedProfile: cloneDefaultAdoptedProfile,
        formatStorageKey: formatStorageKey,
        getStorageItem: getStorageItem,
        setStorageItem: setStorageItem,
        getNextEditorZoom: getNextEditorZoom,
        clampPaneWidthPercent: clampPaneWidthPercent,
        mmToCssPx: mmToCssPx,
        cssPxToMm: cssPxToMm,
        calculateA4PageHeight: calculateA4PageHeight,
        shouldInsertPageBreak: shouldInsertPageBreak,
        validateAndNormalizePrintProfile: validateAndNormalizePrintProfile,
        formatPrintProfileStatusText: formatPrintProfileStatusText,
        computePageBreakModel: computePageBreakModel,
        mapBreaksToScreenPositions: mapBreaksToScreenPositions,
        calculateSyncedScrollTop: calculateSyncedScrollTop
    };

    root.KantanModules = root.KantanModules || {};
    root.KantanModules.SettingsUi = SettingsUiModule;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SettingsUiModule;
    }
})(typeof window !== 'undefined' ? window : globalThis);
