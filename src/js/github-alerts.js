/**
 * GitHub Alerts plugin for KanTanMarkdown
 *
 * This script processes parsed markdown elements inside the previewer
 * and converts standard blockquotes starting with [!NOTE], [!TIP], etc.
 * into GitHub-style alerts.
 *
 * Based on markdown-it-github-alerts by Anthony Fu (https://github.com/antfu/markdown-it-github-alerts)
 * and GFM Note features from kantan-md (https://kantan-md.pages.dev/)
 */

(function (global) {
    'use strict';

    var GithubAlerts = {
        // Supported alert types, their display titles, colors, and SVG icons
        TYPES: {
            'NOTE': {
                title: 'Note',
                className: 'markdown-alert-note',
                color: '#0969da',
                icon: '<svg class="octicon octicon-info mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>'
            },
            'TIP': {
                title: 'Tip',
                className: 'markdown-alert-tip',
                color: '#1a7f37',
                icon: '<svg class="octicon octicon-light-bulb mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path></svg>'
            },
            'IMPORTANT': {
                title: 'Important',
                className: 'markdown-alert-important',
                color: '#8250df',
                icon: '<svg class="octicon octicon-report mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>'
            },
            'WARNING': {
                title: 'Warning',
                className: 'markdown-alert-warning',
                color: '#9a6700',
                icon: '<svg class="octicon octicon-alert mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>'
            },
            'CAUTION': {
                title: 'Caution',
                className: 'markdown-alert-caution',
                color: '#cf222e',
                icon: '<svg class="octicon octicon-stop mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>'
            }
        },

        /**
         * Dynamic CSS injection to provide beautiful alerts styling.
         * This avoids hardcoding styling or requiring manual style sheet modifications,
         * but we will also document CSS integration for previewer.css.
         */
        injectStyles: function () {
            if (document.getElementById('github-alerts-styles')) return;

            var style = document.createElement('style');
            style.id = 'github-alerts-styles';
            style.textContent = [
                '.markdown-alert {',
                '    padding: 0.5rem 1rem;',
                '    margin: 1rem 0;',
                '    color: inherit;',
                '    border-left: .25rem solid #d0d7de;',
                '    background-color: transparent;',
                '}',
                '.markdown-alert p:first-child { margin-top: 0; }',
                '.markdown-alert p:last-child { margin-bottom: 0; }',
                '.markdown-alert .markdown-alert-title {',
                '    display: flex;',
                '    align-items: center;',
                '    gap: .5em;',
                '    font-weight: 500;',
                '    line-height: 1;',
                '    margin-bottom: .25rem;',
                '}',
                '.markdown-alert .markdown-alert-title svg {',
                '    fill: currentColor;',
                '    flex-shrink: 0;',
                '}',
                '/* Note */',
                '.markdown-alert.markdown-alert-note { border-left-color: #0969da; }',
                '.markdown-alert.markdown-alert-note .markdown-alert-title { color: #0969da; }',
                '/* Tip */',
                '.markdown-alert.markdown-alert-tip { border-left-color: #1f883d; }',
                '.markdown-alert.markdown-alert-tip .markdown-alert-title { color: #1f883d; }',
                '/* Important */',
                '.markdown-alert.markdown-alert-important { border-left-color: #8250df; }',
                '.markdown-alert.markdown-alert-important .markdown-alert-title { color: #8250df; }',
                '/* Warning */',
                '.markdown-alert.markdown-alert-warning { border-left-color: #9a6700; }',
                '.markdown-alert.markdown-alert-warning .markdown-alert-title { color: #9a6700; }',
                '/* Caution */',
                '.markdown-alert.markdown-alert-caution { border-left-color: #cf222e; }',
                '.markdown-alert.markdown-alert-caution .markdown-alert-title { color: #cf222e; }',
                '/* Dark mode support */',
                'body.dark .markdown-alert.markdown-alert-note { border-left-color: #58a6ff; }',
                'body.dark .markdown-alert.markdown-alert-note .markdown-alert-title { color: #58a6ff; }',
                'body.dark .markdown-alert.markdown-alert-tip { border-left-color: #3fb950; }',
                'body.dark .markdown-alert.markdown-alert-tip .markdown-alert-title { color: #3fb950; }',
                'body.dark .markdown-alert.markdown-alert-important { border-left-color: #a371f7; }',
                'body.dark .markdown-alert.markdown-alert-important .markdown-alert-title { color: #a371f7; }',
                'body.dark .markdown-alert.markdown-alert-warning { border-left-color: #d29922; }',
                'body.dark .markdown-alert.markdown-alert-warning .markdown-alert-title { color: #d29922; }',
                'body.dark .markdown-alert.markdown-alert-caution { border-left-color: #f85149; }',
                'body.dark .markdown-alert.markdown-alert-caution .markdown-alert-title { color: #f85149; }'
            ].join('\n');
            document.head.appendChild(style);
        },

        /**
         * Create a blockquote that will contain non-alert quoted content.
         * @return {HTMLElement} Empty blockquote element.
         */
        createBlockquote: function () {
            return document.createElement('blockquote');
        },

        /**
         * Create an alert blockquote with its GitHub-style heading.
         * @param {String} type Alert type.
         * @return {HTMLElement} Empty alert blockquote with a title.
         */
        createAlert: function (type) {
            var config = this.TYPES[type];
            var alert = document.createElement('blockquote');
            var title = document.createElement('p');

            alert.className = 'markdown-alert ' + config.className;
            title.className = 'markdown-alert-title';
            title.innerHTML = config.icon + config.title;
            alert.appendChild(title);

            return alert;
        },

        /**
         * Append paragraph HTML without changing Markdown's normal soft-line-break
         * behaviour. Newline characters deliberately remain newlines rather than
         * being converted to <br>, because marked renders soft line breaks as spaces.
         * @param {HTMLElement} block Blockquote to receive the paragraph.
         * @param {String} html Paragraph content.
         */
        appendParagraph: function (block, html) {
            if (html.replace(/[\r\n]/g, '').trim() === '') {
                return;
            }

            var paragraph = document.createElement('p');
            paragraph.innerHTML = html;
            block.appendChild(paragraph);
        },

        /**
         * Scan and render GitHub Alerts inside a target container.
         *
         * Marked 0.x can emit a consecutive run of quoted lines as one paragraph
         * containing literal newlines, or as lines separated by <br>. Therefore the
         * parser handles both representations and splits each [!TYPE] line into an
         * independent alert. This also supports multiple alerts in one blockquote.
         *
         * @param {HTMLElement} container - The container element (e.g. previewer)
         */
        render: function (container) {
            if (!container) return;

            this.injectStyles();

            // Copy the NodeList because a source blockquote is replaced while iterating.
            var blockquotes = Array.prototype.slice.call(container.querySelectorAll('blockquote'));
            for (var i = 0; i < blockquotes.length; i++) {
                var source = blockquotes[i];

                // Rendering is normally performed after previewer.innerHTML is reset,
                // but this guard keeps explicit repeated calls idempotent.
                if ((' ' + source.className + ' ').indexOf(' markdown-alert ') !== -1) {
                    continue;
                }

                var replacements = [];
                var current = null;
                var foundAlert = false;
                var children = Array.prototype.slice.call(source.childNodes);

                for (var j = 0; j < children.length; j++) {
                    var child = children[j];

                    if (child.nodeType === 1 && child.tagName.toLowerCase() === 'p') {
                        // Normalize hard breaks to newlines; marked may use either form.
                        var lines = child.innerHTML
                            .replace(/<br\s*\/?>/gi, '\n')
                            .split(/\r?\n/);
                        var paragraphLines = [];

                        for (var k = 0; k < lines.length; k++) {
                            var line = lines[k];
                            var marker = line.match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:[ \t]*(.*))?$/i);

                            if (marker) {
                                // Preserve quoted content that occurs before the first
                                // alert, but do not emit an empty blockquote for a
                                // marker that starts the source blockquote.
                                if (paragraphLines.join('').trim() !== '') {
                                    if (!current) {
                                        current = this.createBlockquote();
                                        replacements.push(current);
                                    }
                                    this.appendParagraph(current, paragraphLines.join('\n'));
                                }
                                paragraphLines = [];

                                current = this.createAlert(marker[1].toUpperCase());
                                replacements.push(current);
                                foundAlert = true;

                                if (marker[2] && marker[2].trim() !== '') {
                                    paragraphLines.push(marker[2]);
                                }
                            } else {
                                paragraphLines.push(line);
                            }
                        }

                        if (paragraphLines.length > 0) {
                            if (!current) {
                                current = this.createBlockquote();
                                replacements.push(current);
                            }
                            this.appendParagraph(current, paragraphLines.join('\n'));
                        }
                    } else if (!(child.nodeType === 3 && child.nodeValue.trim() === '')) {
                        if (!current) {
                            current = this.createBlockquote();
                            replacements.push(current);
                        }
                        current.appendChild(child.cloneNode(true));
                    }
                }

                if (foundAlert) {
                    var parent = source.parentNode;
                    for (var r = 0; r < replacements.length; r++) {
                        parent.insertBefore(replacements[r], source);
                    }
                    parent.removeChild(source);
                }
            }
        }
    };

    // Expose to global scope
    global.GithubAlerts = GithubAlerts;

})(typeof window !== 'undefined' ? window : this);