/**
 * GitHub Alerts plugin for KanTanMarkdown
 *
 * This script processes parsed markdown elements inside the previewer
 * and converts standard blockquotes starting with [!NOTE], [!TIP], etc.
 * into GitHub-style alerts.
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
                icon: '<svg class="octicon octicon-info mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a.75.75 0 0 0-.75.75v5.25a.75.75 0 0 0 1.5 0V2.25A.75.75 0 0 0 8 1.5ZM9 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>'
            },
            'TIP': {
                title: 'Tip',
                className: 'markdown-alert-tip',
                color: '#1a7f37',
                icon: '<svg class="octicon octicon-light-bulb mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M8 1.5c-2.363 0-4 1.637-4 3.5 0 .918.263 1.583.596 2.146.33.559.78 1.054 1.154 1.488.163.19.3.35.405.495H7c.22 0 .408.143.461.35l.402 1.564a.25.25 0 0 0 .484 0l.402-1.564a.458.458 0 0 1 .461-.35h.845c.105-.145.242-.305.405-.495.373-.434.823-.929 1.154-1.488.333-.563.596-1.228.596-2.146 0-1.863-1.637-3.5-4-3.5ZM6 12a1 1 0 1 1 2 0v1h-2v-1Zm3 0v1h-1v-1h1Z"></path></svg>'
            },
            'IMPORTANT': {
                title: 'Important',
                className: 'markdown-alert-important',
                color: '#8250df',
                icon: '<svg class="octicon octicon-report mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M0 1.75C0 .783.783 0 1.75 0h12.5C15.217 0 16 .783 16 1.75v12.5a1.75 1.75 0 0 1-1.75 1.75H1.75A1.75 1.75 0 0 1 0 14.25ZM1.75 1.5a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25Zm6.5 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1-7.75a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V4.5a.75.75 0 0 1 .75-.75Z"></path></svg>'
            },
            'WARNING': {
                title: 'Warning',
                className: 'markdown-alert-warning',
                color: '#9a6700',
                icon: '<svg class="octicon octicon-alert mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M6.457 1.047c.659-1.11 2.227-1.11 2.886 0l6.19 10.42c.66 1.112-.132 2.533-1.443 2.533H1.91c-1.311 0-2.103-1.421-1.443-2.533l6.19-10.42ZM8 5c-.414 0-.75.336-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 8 5Zm0 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>'
            },
            'CAUTION': {
                title: 'Caution',
                className: 'markdown-alert-caution',
                color: '#cf222e',
                icon: '<svg class="octicon octicon-stop mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M4.47.22A.75.75 0 0 1 5 0h6a.75.75 0 0 1 .53.22l4.25 4.25c.141.14.22.331.22.53v6a.75.75 0 0 1-.22.53l-4.25 4.25A.75.75 0 0 1 11 16H5a.75.75 0 0 1-.53-.22L.22 11.53A.75.75 0 0 1 0 11V5a.75.75 0 0 1 .22-.53L4.47.22ZM5.31 1.5 1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5H5.31ZM8 4c.414 0 .75.336 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>'
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
                '    margin-bottom: 1rem;',
                '    color: inherit;',
                '    border-left: .25em solid #d0d7de;',
                '    background-color: transparent;',
                '}',
                '.markdown-alert p:first-child { margin-top: 0; }',
                '.markdown-alert p:last-child { margin-bottom: 0; }',
                '.markdown-alert .markdown-alert-title {',
                '    display: flex;',
                '    align-items: center;',
                '    font-weight: 600;',
                '    line-height: 1;',
                '    margin-bottom: 0.5rem;',
                '}',
                '.markdown-alert .markdown-alert-title svg {',
                '    margin-right: 8px;',
                '    display: inline-block;',
                '    vertical-align: text-bottom;',
                '}',
                '/* Note */',
                '.markdown-alert.markdown-alert-note { border-left-color: #0969da; }',
                '.markdown-alert.markdown-alert-note .markdown-alert-title { color: #0969da; }',
                '/* Tip */',
                '.markdown-alert.markdown-alert-tip { border-left-color: #1a7f37; }',
                '.markdown-alert.markdown-alert-tip .markdown-alert-title { color: #1a7f37; }',
                '/* Important */',
                '.markdown-alert.markdown-alert-important { border-left-color: #8250df; }',
                '.markdown-alert.markdown-alert-important .markdown-alert-title { color: #8250df; }',
                '/* Warning */',
                '.markdown-alert.markdown-alert-warning { border-left-color: #9a6700; }',
                '.markdown-alert.markdown-alert-warning .markdown-alert-title { color: #9a6700; }',
                '/* Caution */',
                '.markdown-alert.markdown-alert-caution { border-left-color: #cf222e; }',
                '.markdown-alert.markdown-alert-caution .markdown-alert-title { color: #cf222e; }'
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