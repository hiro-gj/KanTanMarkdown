/**
 * preview-mermaid.js
 * Module for Markdown preview processing, Mermaid diagram normalization,
 * error SVG detection, temporary DOM cleanup, heading sync parsing, and attach: URL resolution.
 */

(function (root) {
    'use strict';

    function isMermaidLang(lang) {
        if (typeof lang !== 'string') return false;
        return /^\s*mermaid(?:\s*:.*)?\s*$/i.test(lang);
    }

    function escapeMermaidHtml(rawCode) {
        if (rawCode == null) return '';
        return String(rawCode)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderMermaidCodeFence(code, escaped) {
        var safeCode = escaped ? String(code == null ? '' : code) : escapeMermaidHtml(code);
        return '<div class="mermaid">' + safeCode + '</div>';
    }

    function stripMermaidLeadingComments(source) {
        if (!source || typeof source !== 'string') return '';
        var rest = source;
        while (rest.length > 0) {
            var trimmed = rest.replace(/^\s+/, '');
            if (trimmed.slice(0, 3) === '%%{') {
                var closeIdx = trimmed.indexOf('}%%');
                if (closeIdx !== -1) {
                    rest = trimmed.slice(closeIdx + 3);
                    continue;
                }
            }
            if (trimmed.slice(0, 2) === '%%') {
                var nlIdx = trimmed.search(/\r?\n/);
                if (nlIdx === -1) return '';
                rest = trimmed.slice(nlIdx).replace(/^\r?\n/, '');
                continue;
            }
            return trimmed;
        }
        return '';
    }

    function isAsyncMermaidDiagram(source) {
        var header = stripMermaidLeadingComments(source);
        return /^(?:mindmap|timeline|flowchart-elk)\b/i.test(header);
    }

    function isWidthSensitiveMermaidDiagram(source) {
        var header = stripMermaidLeadingComments(source);
        return /^(?:gantt|pie)\b/i.test(header);
    }

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

    function normalizeSequenceMessageText(textPart) {
        if (!textPart || textPart.indexOf(';') === -1) return textPart;
        var entTokens = [];
        var protectedText = textPart.replace(/(^|[^&])(#(?:[A-Za-z]+|\d+);)/g, function (_, lead, ent) {
            var idx = entTokens.length;
            entTokens.push(ent);
            return lead + '\x01' + idx + '\x02';
        });
        var htmlEntities = {
            '&lt;': '<',
            '&gt;': '>',
            '&amp;': '&',
            '&quot;': '"',
            '&#39;': "'"
        };
        protectedText = protectedText.replace(/&(?:lt|gt|amp|quot|#39);/gi, function (m) {
            var key = m.toLowerCase();
            return Object.prototype.hasOwnProperty.call(htmlEntities, key) ? htmlEntities[key] : m;
        });
        protectedText = protectedText.replace(/;/g, '#59;');
        protectedText = protectedText.replace(/\x01(\d+)\x02/g, function (_, idx) {
            return entTokens[parseInt(idx, 10)];
        });
        return protectedText;
    }

    function normalizeSequenceDiagramText(rawText) {
        if (rawText.indexOf(';') === -1) return rawText;
        var lines = rawText.split(/\r?\n/);
        var inDirective = false;
        var changed = false;
        var noteLineRe = /^(\s*note\s+(?:(?:left|right)\s+of|over)\s+[^:\r\n]+?:)([\s\S]*)$/i;
        var msgLineRe = /^(\s*(?!%%|#)[^\->:\r\n,;]+?(?:(?!-(?:>>|>|[xX]|\)))-[^\->:\r\n,;]+)*\s*(?:<<->>|<<-->>|-->>|->>|-->|->|--[xX]|-[xX]|--\)|-\))\s*[+\-]?\s*[^\->:\r\n,;]+?(?:(?!-(?:>>|>|[xX]|\)))-[^\->:\r\n,;]+)*\s*:)([\s\S]*)$/;

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
            if (line.indexOf(';') === -1) continue;

            var m = line.match(noteLineRe) || line.match(msgLineRe);
            if (m) {
                var newRest = normalizeSequenceMessageText(m[2]);
                if (newRest !== m[2]) {
                    lines[i] = m[1] + newRest;
                    changed = true;
                }
            }
        }
        return changed ? lines.join('\n') : rawText;
    }

    function normalizeMermaidText(rawText) {
        if (!rawText || typeof rawText !== 'string') return rawText;
        var headerCheck = stripMermaidLeadingComments(rawText);
        if (/^sequenceDiagram\b/i.test(headerCheck)) {
            return normalizeSequenceDiagramText(rawText);
        }
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
                var rawRestored = restoreTokens(label);
                if (/^\s+$/.test(rawRestored)) {
                    return '" "';
                }
                var restored = rawRestored.replace(/^\s+|\s+$/g, '');
                if (!restored) return '""';
                if ((restored.charAt(0) === '"' && restored.charAt(restored.length - 1) === '"') ||
                    (restored.charAt(0) === '`' && restored.charAt(restored.length - 1) === '`') ||
                    (restored.charAt(0) === "'" && restored.charAt(restored.length - 1) === "'")) {
                    return restored;
                }
                return '"' + restored.replace(/"/g, '&quot;') + '"';
            };

            var work = line.replace(/"[^"\r\n]*"/g, function (m) { return saveToken(m); });
            var depth = 0;
            for (var ci = 0; ci < work.length - 1; ci++) {
                var cch = work.charAt(ci);
                if (cch === '[' || cch === '(' || cch === '{') {
                    depth++;
                } else if (cch === ']' || cch === ')' || cch === '}') {
                    if (depth > 0) depth--;
                } else if (depth === 0 && cch === '%' && work.charAt(ci + 1) === '%') {
                    work = work.slice(0, ci) + saveToken(work.slice(ci));
                    break;
                }
            }

            var cleanTrimmed = work.replace(/\x01\d+\x02/g, '').replace(/^\s+|\s+$/g, '');
            if (/^(?:flowchart(?:-elk)?|graph)\s+(?:TB|TD|BT|RL|LR)\s*;?\s*$/i.test(trimmed) ||
                /^(?:flowchart(?:-elk)?|graph)\s+(?:TB|TD|BT|RL|LR)\s*;?\s*$/i.test(cleanTrimmed) ||
                /^(?:end\b|direction\s+\S+|classDef\s+|class\s+|style\s+|linkStyle\s+|click\s+)/i.test(trimmed)) {
                continue;
            }

            if (/^\s*subgraph\b/i.test(work)) {
                work = work.replace(/^(\s*subgraph\s+[A-Za-z0-9_\u0080-\uFFFF][A-Za-z0-9_.\-\u0080-\uFFFF]*\s*)\[((?:[^\[\]\r\n]|\[[^\[\]\r\n]*\])+)\](\s*;?\s*(?:\x01\d+\x02\s*)?)$/i, function (_, prefix, label, suffix) {
                    return prefix + '[' + saveToken(wrapQuotes(label)) + ']' + suffix;
                });
                work = work.replace(/^(\s*subgraph\s+)(?!\x01)([^\[\r\n\x01\x02]+?)(\s*(?:\x01\d+\x02\s*)?)$/i, function (full, p1, rest, commentSuffix) {
                    var r = rest.replace(/^\s+|\s+$/g, '');
                    if (!r || /^[A-Za-z0-9_.\-\u0080-\uFFFF]+$/.test(r) || /^\x01\d+\x02$/.test(r)) return full;
                    return p1 + saveToken(wrapQuotes(r)) + (commentSuffix || '');
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
            work = work.replace(/(^|[^A-Za-z0-9_.\-\u0080-\uFFFF\x01\x02])([A-Za-z0-9_\u0080-\uFFFF][A-Za-z0-9_.\-\u0080-\uFFFF]*)(\(\(\([\s\S]+?\)\)\)|\(\((?![(])(?:[^()\r\n]|\([^()\r\n]*\))+?\)\)|\(\[(?:[^\[\]\r\n]|\[[^\[\]\r\n]*\])+?\]\)|\[\[(?![\[])(?:[^\[\]\r\n]|\[[^\[\]\r\n]*\])+?\]\]|\[\((?:[^()\r\n]|\([^()\r\n]*\))+?\)\]|\{\{(?![{])(?:[^{}\r\n]|\{[^{}\r\n]*\})+?\}\}|\[\/(?:[^\[\]\r\n]|\[[^\[\]\r\n]*\])+?\/\]|\[\\(?:[^\[\]\r\n]|\[[^\[\]\r\n]*\])+?\\\]|\[\/(?:[^\[\]\r\n]|\[[^\[\]\r\n]*\])+?\\\]|\[\\(?:[^\[\]\r\n]|\[[^\[\]\r\n]*\])+?\/\]|\[(?![\[(\/\\])(?:[^\[\]\r\n]|\[[^\[\]\r\n]*\])+\]|\((?![(\[])(?:[^()\r\n]|\([^()\r\n]*\))+\)|\{(?![{])(?:[^{}\r\n]|\{[^{}\r\n]*\})+\}|>(?:[^\[\]\r\n]|\[[^\[\]\r\n]*\])+\])/g, function (full, lead, id, shape) {
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
        isMermaidLang: isMermaidLang,
        escapeMermaidHtml: escapeMermaidHtml,
        renderMermaidCodeFence: renderMermaidCodeFence,
        isAsyncMermaidDiagram: isAsyncMermaidDiagram,
        isWidthSensitiveMermaidDiagram: isWidthSensitiveMermaidDiagram,
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
