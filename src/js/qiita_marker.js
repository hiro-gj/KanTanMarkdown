/*!
 * qiita_marker.js
 * https://github.com/increments/qiita_marker
 *
 * Copyright (c) 2015 Garen J. Torikian
 * Copyright (c) 2021 Qiita Inc.
 *
 * MIT License
 * https://raw.githubusercontent.com/increments/qiita_marker/main/LICENSE.txt
 */
/*!
 * Qiita Note syntax plugin for KanTanMarkdown
 * Unofficial JavaScript port of Qiita Note syntax for KanTanMarkdown.
 *
 * Based on:
 * - qiita_marker (commit cb88c6062b43973c4508f568d1bce86de4a6acdb)
 *   Copyright (c) 2015 Garen J. Torikian
 *   Copyright (c) 2021 Qiita Inc.
 * - qiita-markdown (commit d7d3908333b3f12f5cf32d57f9baa55d8f673f25)
 *   Copyright (c) 2014 Ryo Nakamura
 *
 * Modifications for KanTanMarkdown:
 * - Pure JavaScript integration with marked 0.3.x Lexer/Parser.
 * - Self-contained inline SVG icons (no external font or CDN required).
 * - Scoped styling avoiding conflicts with existing .info/.warn/.alert rules.
 */
(function (global) {
    'use strict';

    if (global.QiitaMarker && global.QiitaMarker.installed) {
        return;
    }

    var ICONS = {
        info: '<span class="fa fa-fw fa-check-circle" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="qiita-note-icon"><circle cx="12" cy="12" r="10" fill="#22c55e"/><path d="m9 12 2 2 4-4" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>',
        warn: '<span class="fa fa-fw fa-exclamation-circle" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="qiita-note-icon"><circle cx="12" cy="12" r="10" fill="#eab308"/><line x1="12" y1="8" x2="12" y2="12" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="16" r="1.25" fill="#ffffff"/></svg></span>',
        alert: '<span class="fa fa-fw fa-times-circle" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="qiita-note-icon"><circle cx="12" cy="12" r="10" fill="#ef4444"/><line x1="9" y1="9" x2="15" y2="15" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/><line x1="15" y1="9" x2="9" y2="15" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/></svg></span>'
    };

    var DEFAULT_SUBTYPE = 'info';

    function normalizeSubtype(subtype) {
        if (!subtype || typeof subtype !== 'string') return DEFAULT_SUBTYPE;
        var s = subtype.trim();
        return (s === 'warn' || s === 'alert') ? s : DEFAULT_SUBTYPE;
    }

    function renderNoteHtml(subtype, contentHtml) {
        var norm = normalizeSubtype(subtype);
        var iconHtml = ICONS[norm] || ICONS.info;
        return '<div class="note ' + norm + '">' + iconHtml + '<div>' + contentHtml + '</div></div>\n';
    }

    function stripIndent(line, indentLen) {
        if (indentLen <= 0) return line;
        var count = 0;
        while (count < indentLen && count < line.length && line.charAt(count) === ' ') {
            count++;
        }
        return line.substring(count);
    }

    function findFirstNoteBlock(src) {
        if (!src || typeof src !== 'string') return null;
        var lines = src.split('\n');
        var inCode = false, codeChar = '', codeLen = 0, lineStart = 0;

        for (var i = 0; i < lines.length; i++) {
            var rawLine = lines[i];
            var line = rawLine.replace(/\r$/, '');
            var nextLinePos = lineStart + rawLine.length + (i < lines.length - 1 ? 1 : 0);

            if (inCode) {
                var closePattern = new RegExp('^[ ]{0,3}(\\' + codeChar + '{' + codeLen + ',})[ \\t]*$');
                if (closePattern.test(line)) inCode = false;
                lineStart = nextLinePos;
                continue;
            }

            var openFence = line.match(/^[ ]{0,3}(`{3,}|~{3,})/);
            if (openFence) {
                inCode = true;
                codeChar = openFence[1].charAt(0);
                codeLen = openFence[1].length;
                lineStart = nextLinePos;
                continue;
            }

            var noteMatch = line.match(/^[ ]{0,3}(:{3,})[ \t]*([^\n]*)$/);
            if (noteMatch) {
                var colonFence = noteMatch[1];
                var colonLen = colonFence.length;
                var rawParams = noteMatch[2].trim();
                var words = rawParams.split(/\s+/);

                if (words[0] === 'note') {
                    var subtype = words[1] || DEFAULT_SUBTYPE;
                    var indentMatch = line.match(/^[ ]*/);
                    var indentLen = indentMatch ? indentMatch[0].length : 0;
                    var bodyLines = [], scanPos = nextLinePos;
                    var innerCode = false, innerChar = '', innerLen = 0;
                    var foundEnd = false;

                    for (var j = i + 1; j < lines.length; j++) {
                        var rawInner = lines[j];
                        var l = rawInner.replace(/\r$/, '');
                        var innerNext = scanPos + rawInner.length + (j < lines.length - 1 ? 1 : 0);

                        if (innerCode) {
                            var innerClose = new RegExp('^[ ]{0,3}(\\' + innerChar + '{' + innerLen + ',})[ \\t]*$');
                            if (innerClose.test(l)) innerCode = false;
                            bodyLines.push(stripIndent(l, indentLen));
                            scanPos = innerNext;
                            continue;
                        }

                        var innerFence = l.match(/^[ ]{0,3}(`{3,}|~{3,})/);
                        if (innerFence) {
                            innerCode = true;
                            innerChar = innerFence[1].charAt(0);
                            innerLen = innerFence[1].length;
                            bodyLines.push(stripIndent(l, indentLen));
                            scanPos = innerNext;
                            continue;
                        }

                        var endMatch = l.match(/^[ ]{0,3}(:{3,})[ \t]*$/);
                        if (endMatch && endMatch[1].length >= colonLen) {
                            foundEnd = true;
                            scanPos = innerNext;
                            break;
                        }

                        bodyLines.push(stripIndent(l, indentLen));
                        scanPos = innerNext;
                    }

                    return {
                        startPos: lineStart,
                        endPos: scanPos,
                        subtype: subtype,
                        body: bodyLines.join('\n'),
                        foundEnd: foundEnd
                    };
                }
            }

            lineStart = nextLinePos;
        }

        return null;
    }

    var NOTE_STYLES = [
        '/* Qiita Note記法 */',
        '.note.info, .note.warn, .note.alert {',
        '    display: flex; align-items: flex-start; gap: 12px;',
        '    padding: 12px 16px; margin: 16px 0; border-radius: 6px;',
        '    border: none; font-size: 14px; line-height: 1.6;',
        '    color: var(--text, #1f2328); word-break: break-word;',
        '}',
        '.note.info > span.fa, .note.warn > span.fa, .note.alert > span.fa {',
        '    flex-shrink: 0; display: inline-flex; align-items: center;',
        '    justify-content: center; line-height: 1; margin-top: 3px;',
        '}',
        '.note.info > div, .note.warn > div, .note.alert > div {',
        '    flex: 1; min-width: 0;',
        '}',
        '.note.info > div > :first-child, .note.warn > div > :first-child, .note.alert > div > :first-child {',
        '    margin-top: 0 !important;',
        '}',
        '.note.info > div > :last-child, .note.warn > div > :last-child, .note.alert > div > :last-child {',
        '    margin-bottom: 0 !important;',
        '}',
        '.note.info { background-color: #ebf6ec; }',
        '.note.warn { background-color: #fbf4da; }',
        '.note.alert { background-color: #fae8e8; }',
        'body.dark .note.info { background-color: rgba(34, 197, 94, 0.15); color: var(--text, #c9d1d9); }',
        'body.dark .note.warn { background-color: rgba(234, 179, 8, 0.15); color: var(--text, #c9d1d9); }',
        'body.dark .note.alert { background-color: rgba(239, 68, 68, 0.15); color: var(--text, #c9d1d9); }',
        '@media print {',
        '    .note.info, .note.warn, .note.alert {',
        '        page-break-inside: avoid; break-inside: avoid;',
        '        -webkit-print-color-adjust: exact; print-color-adjust: exact;',
        '    }',
        '}'
    ].join('\n');

    function injectStyles() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('qiita-note-styles')) return;
        var style = document.createElement('style');
        style.id = 'qiita-note-styles';
        style.textContent = NOTE_STYLES;
        document.head.appendChild(style);
    }

    function install(markedInstance) {
        var targetMarked = markedInstance || global.marked;
        if (!targetMarked || !targetMarked.Lexer || !targetMarked.Parser) return;
        if (targetMarked.__qiitaMarkerInstalled) return;

        var noteStartPattern = ' *:{3,}[ \\t]*note\\b';
        function patchParagraph(rule) {
            if (!rule || !rule.source) return rule;
            var src = rule.source;
            if (src.indexOf(noteStartPattern) !== -1) return rule;
            return new RegExp(
                src.replace('(?!(?:', '(?!(?:' + noteStartPattern + '|').replace('(?!', '(?!' + noteStartPattern + '|'),
                rule.flags
            );
        }

        if (targetMarked.Lexer.rules) {
            if (targetMarked.Lexer.rules.paragraph) {
                targetMarked.Lexer.rules.paragraph = patchParagraph(targetMarked.Lexer.rules.paragraph);
            }
            if (targetMarked.Lexer.rules.gfm && targetMarked.Lexer.rules.gfm.paragraph) {
                targetMarked.Lexer.rules.gfm.paragraph = patchParagraph(targetMarked.Lexer.rules.gfm.paragraph);
            }
            if (targetMarked.Lexer.rules.normal && targetMarked.Lexer.rules.normal.paragraph) {
                targetMarked.Lexer.rules.normal.paragraph = patchParagraph(targetMarked.Lexer.rules.normal.paragraph);
            }
        }

        var origToken = targetMarked.Lexer.prototype.token;
        targetMarked.Lexer.prototype.token = function (src, top, bq) {
            var note = findFirstNoteBlock(src);
            if (!note) return origToken.call(this, src, top, bq);

            if (note.startPos > 0) {
                var beforeText = src.substring(0, note.startPos);
                origToken.call(this, beforeText, top, bq);
            }

            this.tokens.push({
                type: 'qiita_note_start',
                subtype: note.subtype
            });

            this.token(note.body, top, bq);

            this.tokens.push({
                type: 'qiita_note_end'
            });

            if (note.endPos < src.length) {
                var afterText = src.substring(note.endPos);
                this.token(afterText, top, bq);
            }

            return this.tokens;
        };

        var origTok = targetMarked.Parser.prototype.tok;
        targetMarked.Parser.prototype.tok = function () {
            if (this.token.type === 'qiita_note_start') {
                var subtype = this.token.subtype;
                var body = '';
                while (this.next().type !== 'qiita_note_end') {
                    body += this.tok();
                }
                return renderNoteHtml(subtype, body);
            }
            return origTok.call(this);
        };

        targetMarked.__qiitaMarkerInstalled = true;
        injectStyles();
    }

    var QiitaMarker = {
        installed: false,
        ICONS: ICONS,
        NOTE_STYLES: NOTE_STYLES,
        renderNoteHtml: renderNoteHtml,
        findFirstNoteBlock: findFirstNoteBlock,
        normalizeSubtype: normalizeSubtype,
        injectStyles: injectStyles,
        install: function (m) {
            install(m);
            this.installed = true;
        }
    };

    if (typeof global.marked !== 'undefined') {
        QiitaMarker.install(global.marked);
    }

    global.QiitaMarker = QiitaMarker;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = QiitaMarker;
    }
})(typeof window !== 'undefined' ? window : this);

