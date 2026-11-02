/**
 * preview-mermaid.js
 * Module for Markdown preview processing, Mermaid diagram normalization,
 * error SVG detection, temporary DOM cleanup, heading sync parsing, and attach: URL resolution.
 */

(function (root) {
    'use strict';

    function isMermaidErrorSvg(svgCode) {
        if (!svgCode || typeof svgCode !== 'string') return true;
        return svgCode.indexOf('aria-roledescription="error"') !== -1 ||
            svgCode.indexOf('class="error-text"') !== -1 ||
            svgCode.indexOf('Syntax error in graph') !== -1;
    }

    function cleanupMermaidTempDom(id, doc, previewer) {
        var d = doc || (typeof document !== 'undefined' ? document : null);
        if (!id || !d) return;
        var tempIds = ['d' + id, 'i' + id, id];
        for (var i = 0; i < tempIds.length; i++) {
            var el = d.getElementById(tempIds[i]);
            if (el && (!previewer || !previewer.contains || !previewer.contains(el))) {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            }
        }
    }

    function normalizeMermaidText(rawText) {
        if (!rawText || typeof rawText !== 'string') return rawText;
        var headerCheck = rawText.replace(/^\s*(?:%%\{[\s\S]*?\}%%\s*|%%[^\r\n]*\r?\n\s*)*/, '');
        if (!/^(?:flowchart(?:-elk)?|graph)\b/i.test(headerCheck)) {
            return rawText;
        }

        var lines = rawText.split(/\r?\n/);
        var inDirective = false;
        var reservedWords = /^(?:subgraph|end|direction|classDef|class|style|linkStyle|click|flowchart|flowchart-elk|graph)$/i;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var trimmed = line.replace(/^\s+|\s+$/g, '');
            if (!trimmed || /^%%/.test(trimmed)) {
                if (/%%\{/.test(trimmed) && !/\}%%/.test(trimmed)) inDirective = true;
                continue;
            }
            if (inDirective) {
                if (/\}%%/.test(trimmed)) inDirective = false;
                continue;
            }
            if (/^(?:flowchart(?:-elk)?|graph)\s+(?:TB|TD|BT|RL|LR)\s*;?\s*$/i.test(trimmed) ||
                /^(?:end|direction\s+\S+|classDef\s+|class\s+|style\s+|linkStyle\s+|click\s+)/i.test(trimmed)) {
                continue;
            }

            var tokens = [];
            var saveToken = function (str) {
                var idx = tokens.length;
                tokens.push(str);
                return '\x01' + idx + '\x02';
            };
            var restoreTokens = function (str) {
                var res = str;
                while (/\x01\d+\x02/.test(res)) {
                    res = res.replace(/\x01(\d+)\x02/g, function (_, idx) {
                        return tokens[parseInt(idx, 10)];
                    });
                }
                return res;
            };
            var wrapQuotes = function (label) {
                var restored = restoreTokens(label).replace(/^\s+|\s+$/g, '');
                if (!restored) return '""';
                if ((restored.charAt(0) === '"' && restored.charAt(restored.length - 1) === '"') ||
                    (restored.charAt(0) === '`' && restored.charAt(restored.length - 1) === '`') ||
                    (restored.charAt(0) === "'" && restored.charAt(restored.length - 1) === "'")) {
                    return restored;
                }
                return '"' + restored.replace(/"/g, '&quot;') + '"';
            };

            var work = line.replace(/"[^"\r\n]*"/g, function (m) { return saveToken(m); });

            if (/^\s*subgraph\b/i.test(work)) {
                work = work.replace(/^(\s*subgraph\s+[A-Za-z0-9_\u0080-\uFFFF][A-Za-z0-9_.\-\u0080-\uFFFF]*\s*)\[([^\]\r\n]+)\](\s*;?\s*)$/i, function (_, prefix, label, suffix) {
                    return prefix + '[' + saveToken(wrapQuotes(label)) + ']' + suffix;
                });
                work = work.replace(/^(\s*subgraph\s+)(?!\x01)([^\[\r\n]+?)\s*$/i, function (full, p1, rest) {
                    var r = rest.replace(/^\s+|\s+$/g, '');
                    if (/^[A-Za-z0-9_.\-\u0080-\uFFFF]+$/.test(r) || /^\x01\d+\x02$/.test(r)) return full;
                    return p1 + saveToken(wrapQuotes(r));
                });
                lines[i] = restoreTokens(work);
                continue;
            }

            work = work.replace(/-\.\s+([^\r\n]+?)\s+\.(->|-(?![>-]))/g, function (_, label, arrowEnd) {
                return '-. ' + saveToken(wrapQuotes(label)) + ' .' + arrowEnd;
            });
            work = work.replace(/--\s+([^\r\n\-]+?)\s+(-->|---(?![>-])|--o|--x)/g, function (_, label, arrowEnd) {
                return '-- ' + saveToken(wrapQuotes(label)) + ' ' + arrowEnd;
            });
            work = work.replace(/==\s+([^\r\n=]+?)\s+(==>|===(?![>=])|==o|==x)/g, function (_, label, arrowEnd) {
                return '== ' + saveToken(wrapQuotes(label)) + ' ' + arrowEnd;
            });
            work = work.replace(/(<-->|<-\.->|<==>|-->|---|-\.->|-\.-|==>|===|--o|--x|-\.o|-\.x|==o|==x)\|\s*([^|\r\n]+?)\s*\|/g, function (_, arrow, label) {
                return arrow + '|' + saveToken(wrapQuotes(label)) + '|';
            });
            work = work.replace(/(^|[^A-Za-z0-9_.\-\u0080-\uFFFF\x01\x02])([A-Za-z0-9_\u0080-\uFFFF][A-Za-z0-9_.\-\u0080-\uFFFF]*)(\(\(\([\s\S]+?\)\)\)|\(\([^()\r\n]+?\)\)|\(\[[^\]\r\n]+?\]\)|\[\[[^\]\r\n]+?\]\]|\[\([^()\r\n]+?\)\]|\{\{[^{}\r\n]+?\}\}|\[\/[^\/\r\n]+?\/\]|\[\\[^\\\r\n]+?\\\]|\[\/[^\\\r\n]+?\\\]|\[\\[^\/\r\n]+?\/\]|\[[^\[\]\r\n]+?\]|\([^()\r\n]+?\)|\{[^{}\r\n]+?\}|>[^\[\]\r\n]+?\])/g, function (full, lead, id, shape) {
                if (reservedWords.test(id)) return full;
                var openLen = 1;
                var closeLen = 1;
                if (shape.slice(0, 3) === '(((' && shape.slice(-3) === ')))') {
                    openLen = 3; closeLen = 3;
                } else if (/^(?:\(\(|\(\[|\[\[|\[\(|\{\{|\[\/|\[\\)/.test(shape)) {
                    openLen = 2; closeLen = 2;
                }
                var openDelim = shape.slice(0, openLen);
                var closeDelim = shape.slice(shape.length - closeLen);
                var inner = shape.slice(openLen, shape.length - closeLen);
                return lead + id + openDelim + saveToken(wrapQuotes(inner)) + closeDelim;
            });

            lines[i] = restoreTokens(work);
        }

        return lines.join('\n');
    }

    function replaceAttachUrlInCss(cssStr, resolveAttachUrl) {
        if (!cssStr || typeof cssStr !== 'string') return '';
        var replaced = '';
        var i = 0;
        var prefix = 'url("attach:';
        var suffix = '"';
        while (i < cssStr.length) {
            if ((i + prefix.length) < cssStr.length && cssStr.substr(i, prefix.length) === prefix) {
                i += prefix.length;
                var name = '';
                var c = cssStr.charAt(i++);
                while (c !== suffix && i <= cssStr.length) {
                    name += c;
                    c = cssStr.charAt(i++);
                }
                var imageUrl = typeof resolveAttachUrl === 'function' ? resolveAttachUrl(name) : null;
                if (imageUrl && imageUrl.blobOrBase64) {
                    replaced += 'url("' + imageUrl.blobOrBase64 + '"';
                } else {
                    replaced += 'url("attach:' + name + '"';
                }
                continue;
            }
            var ch = cssStr.charAt(i++);
            replaced += ch;
            if (ch === '"') {
                ch = cssStr.charAt(i++);
                while (ch !== '"' && i <= cssStr.length) {
                    replaced += ch;
                    ch = cssStr.charAt(i++);
                }
                replaced += ch;
                continue;
            }
        }
        return replaced;
    }

    function parseLinesForHeadingSync(str, length, tabSize) {
        var effectiveTabSize = Number(tabSize) || 8;
        var text = (str || '').substring(0, length);
        var lines = text.split('\n');
        var newLines = [];
        var tildeCodeBlockFlag = false;
        var backQuoteCodeBlockFlag = false;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            line = line.replace(new RegExp('^ {' + effectiveTabSize + ',}.*'), '');
            line = line.replace(/^\t+.*/, '');
            line = line.replace(/^\s+|\s+$/g, '');
            line = line.replace(/^\s*(>\s*)+/, '');

            if (tildeCodeBlockFlag) {
                if (line === '~~~') tildeCodeBlockFlag = false;
                newLines.push('');
                continue;
            }
            if (backQuoteCodeBlockFlag) {
                if (line === '```') backQuoteCodeBlockFlag = false;
                newLines.push('');
                continue;
            }
            if (line.substring(0, 3) === '~~~') {
                tildeCodeBlockFlag = true;
                newLines.push('');
                continue;
            }
            if (line.substring(0, 3) === '```') {
                backQuoteCodeBlockFlag = true;
                newLines.push('');
                continue;
            }
            if (i > 0 && line.match(/^={2,}$|^-{2,}$/) &&
                !newLines[i - 1].match(/^#{1,6}\s(.+)$/) &&
                newLines[i - 1] !== '') {
                newLines[i - 1] = '# ' + newLines[i - 1];
                newLines.push('');
                continue;
            }
            var hMatch = line.match(/^#{1,6}\s(.+)$/) || line.match(/^<h[1-6]>(.*)$/);
            if (hMatch) {
                newLines.push('# ' + hMatch[1]);
                continue;
            }
            newLines.push(line.replace(/#/g, ''));
        }
        return newLines;
    }

    var PreviewMermaidModule = {
        isMermaidErrorSvg: isMermaidErrorSvg,
        cleanupMermaidTempDom: cleanupMermaidTempDom,
        normalizeMermaidText: normalizeMermaidText,
        replaceAttachUrlInCss: replaceAttachUrlInCss,
        parseLinesForHeadingSync: parseLinesForHeadingSync
    };

    root.KantanModules = root.KantanModules || {};
    root.KantanModules.PreviewMermaid = PreviewMermaidModule;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = PreviewMermaidModule;
    }
})(typeof window !== 'undefined' ? window : globalThis);
