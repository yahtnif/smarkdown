/*!
 * smarkdown v0.1.5
 * (c) 2018-present Yahtnif <yahtnif@gmail.com>
 * Released under the MIT License.
 */
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var escapeTest = /[&<>"']/;
var escapeReplace = /[&<>"']/g;
var replacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};
var escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
var escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
function escape(html, encode) {
    if (encode) {
        if (escapeTest.test(html)) {
            return html.replace(escapeReplace, function (ch) { return replacements[ch]; });
        }
    }
    else {
        if (escapeTestNoEncode.test(html)) {
            return html.replace(escapeReplaceNoEncode, function (ch) { return replacements[ch]; });
        }
    }
    return html;
}
function unescape(html) {
    // Explicitly match decimal, hex, and named HTML entities
    return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi, function (_, n) {
        n = n.toLowerCase();
        if (n === 'colon')
            return ':';
        if (n.charAt(0) === '#') {
            return n.charAt(1) === 'x'
                ? String.fromCharCode(parseInt(n.substring(2), 16))
                : String.fromCharCode(+n.substring(1));
        }
        return '';
    });
}
var regHtmlTags = /<(?:.|\n)*?>/gm;
var regSpecialChars = /[!\"#$%&'\(\)\*\+,\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g;
var regDotSpace = /(\s|\.)/g;
function slug(str) {
    return (str
        // Remove html tags
        .replace(regHtmlTags, '')
        // Remove special characters
        .replace(regSpecialChars, '')
        // Replace dots and spaces with a separator
        .replace(regDotSpace, '-')
        // Make the whole thing lowercase
        .toLowerCase());
}
// Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
// /c*$/ is vulnerable to REDOS.
// invert: Remove suffix of non-c chars instead. Default falsey.
function rtrim(str, c, invert) {
    if (invert === void 0) { invert = false; }
    if (str.length === 0) {
        return '';
    }
    // Length of suffix matching the invert condition.
    var suffLen = 0;
    // Step left until we fail to match the invert condition.
    while (suffLen < str.length) {
        var currChar = str.charAt(str.length - suffLen - 1);
        if (currChar === c && !invert) {
            suffLen++;
        }
        else if (currChar !== c && invert) {
            suffLen++;
        }
        else {
            break;
        }
    }
    return str.substr(0, str.length - suffLen);
}
var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
var noLastSlashUrl = /^[^:]+:\/*[^/]*$/;
var baseUrls = {};
function resolveUrl(base, href) {
    if (originIndependentUrl.test(href)) {
        return href;
    }
    var baseUrlsKey = ' ' + base;
    if (!baseUrls[baseUrlsKey]) {
        // we can ignore everything in base after the last slash of its path component,
        // but we might need to add _that_
        // https://tools.ietf.org/html/rfc3986#section-3
        if (noLastSlashUrl.test(base)) {
            baseUrls[baseUrlsKey] = base + '/';
        }
        else {
            baseUrls[baseUrlsKey] = rtrim(base, '/', true);
        }
    }
    base = baseUrls[baseUrlsKey];
    if (href.slice(0, 2) === '//') {
        return base.replace(/:[\s\S]*/, ':') + href;
    }
    else if (href.charAt(0) === '/') {
        return base.replace(/(:\/*[^/]*)[\s\S]*/, '$1') + href;
    }
    else {
        return base + href;
    }
}
function noop() { }
noop.exec = noop;
var ExtendRegexp = /** @class */ (function () {
    function ExtendRegexp(regex, flags) {
        if (flags === void 0) { flags = ''; }
        this.source = regex.source;
        this.flags = flags;
    }
    /**
     * Extend regular expression.
     *
     * @param groupName Regular expression for search a group name.
     * @param groupRegexp Regular expression of named group.
     */
    ExtendRegexp.prototype.setGroup = function (groupName, groupRegexp) {
        var newRegexp = typeof groupRegexp == 'string' ? groupRegexp : groupRegexp.source;
        newRegexp = newRegexp.replace(/(^|[^\[])\^/g, '$1');
        // Extend regexp.
        this.source = this.source.replace(groupName, newRegexp);
        return this;
    };
    /**
     * Returns a result of extending a regular expression.
     */
    ExtendRegexp.prototype.getRegex = function () {
        return new RegExp(this.source, this.flags);
    };
    return ExtendRegexp;
}());

var TokenType;
(function (TokenType) {
    TokenType[TokenType["space"] = 1] = "space";
    TokenType[TokenType["text"] = 2] = "text";
    TokenType[TokenType["paragraph"] = 3] = "paragraph";
    TokenType[TokenType["heading"] = 4] = "heading";
    TokenType[TokenType["listStart"] = 5] = "listStart";
    TokenType[TokenType["listEnd"] = 6] = "listEnd";
    TokenType[TokenType["looseItemStart"] = 7] = "looseItemStart";
    TokenType[TokenType["looseItemEnd"] = 8] = "looseItemEnd";
    TokenType[TokenType["listItemStart"] = 9] = "listItemStart";
    TokenType[TokenType["listItemEnd"] = 10] = "listItemEnd";
    TokenType[TokenType["blockquoteStart"] = 11] = "blockquoteStart";
    TokenType[TokenType["blockquoteEnd"] = 12] = "blockquoteEnd";
    TokenType[TokenType["code"] = 13] = "code";
    TokenType[TokenType["table"] = 14] = "table";
    TokenType[TokenType["html"] = 15] = "html";
    TokenType[TokenType["hr"] = 16] = "hr";
    TokenType[TokenType["footnote"] = 17] = "footnote";
})(TokenType || (TokenType = {}));
var SmarkdownOptions = /** @class */ (function () {
    function SmarkdownOptions() {
        this.gfm = true;
        this.tables = true;
        this.extra = false;
        this.breaks = false;
        this.pedantic = false;
        this.sanitize = false;
        this.mangle = true;
        this.smartLists = false;
        this.silent = false;
        this.baseUrl = null;
        this.linksInNewTab = false;
        this.disabledRules = [];
        this.langPrefix = 'language-';
        this.langAttribute = false;
        this.smartypants = false;
        this.headerId = false;
        this.headerPrefix = '';
        /**
         * Self-close the tags for void elements (&lt;br/&gt;, &lt;img/&gt;, etc.)
         * with a "/" as required by XHTML.
         */
        this.xhtml = false;
        /**
         * The function that will be using to escape HTML entities.
         * By default using inner helper.
         */
        this.escape = escape;
        /**
         * The function that will be using to unescape HTML entities.
         * By default using inner helper.
         */
        this.unescape = unescape;
        /**
         * The function that will be using to slug string.
         * By default using inner helper.
         */
        this.slug = slug;
        /**
         * The RegExp that will be using to make RegExp.exec as noop.
         * By default using inner helper.
         */
        this.noop = noop;
        this.rtrim = rtrim;
        /**
         * The function that will be using to render image/link URLs relative to a base url.
         * By default using inner helper.
         */
        this.resolveUrl = resolveUrl;
    }
    return SmarkdownOptions;
}());

var BlockLexer = /** @class */ (function () {
    function BlockLexer(staticThis, options) {
        this.staticThis = staticThis;
        this.links = Object.create(null);
        this.tokens = [];
        this.options = options;
        this.setRules();
    }
    /**
     * Accepts Markdown text and returns object with tokens and links.
     *
     * @param src String of markdown source to be compiled.
     * @param options Hash of options.
     */
    BlockLexer.lex = function (src, options, top) {
        var lexer = new this(this, options);
        return lexer.getTokens(src, top);
    };
    BlockLexer.getRulesBase = function () {
        if (this.rulesBase)
            return this.rulesBase;
        var html = '^ {0,3}(?:' + // optional indentation
            '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' + // (1)
            '|comment[^\\n]*(\\n+|$)' + // (2)
            '|<\\?[\\s\\S]*?\\?>\\n*' + // (3)
            '|<![A-Z][\\s\\S]*?>\\n*' + // (4)
            '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' + // (5)
            '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' + // (6)
            '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=\\h*\\n)[\\s\\S]*?(?:\\n{2,}|$)' + // (7) open tag
            '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=\\h*\\n)[\\s\\S]*?(?:\\n{2,}|$)' + // (7) closing tag
            ')';
        var htmlRegex = new RegExp(html);
        var base = {
            newline: /^\n+/,
            code: /^( {4}[^\n]+\n*)+/,
            hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
            heading: /^ *(#{1,6}) *([^\n]+?) *(#+ *)?(?:\n+|$)/,
            blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
            list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
            html: htmlRegex,
            def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
            lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
            paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading| {0,3}>|<\/?(?:tag)(?: +|\n|\/?>)|<(?:script|pre|style|!--))[^\n]+)*)/,
            text: /^[^\n]+/,
            bullet: /(?:[*+-]|\d+\.)/,
            item: /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/,
            _label: /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/,
            _title: /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/,
            _comment: /<!--(?!-?>)[\s\S]*?-->/
        };
        base.def = new ExtendRegexp(base.def)
            .setGroup('label', base._label)
            .setGroup('title', base._title)
            .getRegex();
        base.item = new ExtendRegexp(base.item, 'gm')
            .setGroup(/bull/g, base.bullet)
            .getRegex();
        base.list = new ExtendRegexp(base.list)
            .setGroup(/bull/g, base.bullet)
            .setGroup('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
            .setGroup('def', '\\n+(?=' + base.def.source + ')')
            .getRegex();
        var tag = 'address|article|aside|base|basefont|blockquote|body|caption' +
            '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption' +
            '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe' +
            '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option' +
            '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr' +
            '|track|ul';
        var attribute = / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/;
        base.html = new ExtendRegexp(base.html, 'i')
            .setGroup('comment', base._comment)
            .setGroup('tag', tag)
            .setGroup('attribute', attribute)
            .getRegex();
        base.paragraph = new ExtendRegexp(base.paragraph)
            .setGroup('hr', base.hr)
            .setGroup('heading', base.heading)
            .setGroup('lheading', base.lheading)
            .setGroup('blockquote', base.blockquote)
            .setGroup('tag', tag) // pars can be interrupted by type (6) html blocks
            .getRegex();
        base.blockquote = new ExtendRegexp(base.blockquote)
            .setGroup('paragraph', base.paragraph)
            .getRegex();
        return (this.rulesBase = base);
    };
    BlockLexer.getRulesPedantic = function () {
        if (this.rulesPedantic)
            return this.rulesPedantic;
        var base = this.getRulesBase();
        var html = '^ *(?:comment *(?:\\n|\\s*$)' +
            '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' + // closed tag
            '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))';
        var tag = '(?!(?:' +
            'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub' +
            '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)' +
            '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b';
        var regexHtml = new ExtendRegexp(new RegExp(html))
            .setGroup('comment', base._comment)
            .setGroup(/tag/g, tag)
            .getRegex();
        var pedantic = __assign({}, base, {
            html: regexHtml,
            def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/
        });
        return (this.rulesPedantic = pedantic);
    };
    BlockLexer.getRulesGfm = function () {
        if (this.rulesGfm)
            return this.rulesGfm;
        var base = this.getRulesBase();
        var gfm = __assign({}, base, {
            fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\n? *\1 *(?:\n+|$)/,
            checkbox: /^\[([ xX])\] +/,
            paragraph: /^/,
            heading: /^ *(#{1,6}) +([^\n]+?) *(#*) *(?:\n+|$)/
        });
        var group1 = gfm.fences.source.replace('\\1', '\\2');
        var group2 = base.list.source.replace('\\1', '\\3');
        gfm.paragraph = new ExtendRegexp(base.paragraph)
            .setGroup('(?!', "(?!" + group1 + "|" + group2 + "|")
            .getRegex();
        return (this.rulesGfm = gfm);
    };
    BlockLexer.getRulesTable = function () {
        if (this.rulesTables)
            return this.rulesTables;
        return (this.rulesTables = __assign({}, this.getRulesGfm(), {
            nptable: /^ *([^|\n ].*\|.*)\n *([-:]+ *\|[-| :]*)(?:\n((?:.*[^>\n ].*(?:\n|$))*)\n*|$)/,
            table: /^ *\|(.+)\n *\|?( *[-:]+[-| :]*)(?:\n((?: *[^>\n ].*(?:\n|$))*)\n*|$)/
        }));
    };
    BlockLexer.getRulesExtra = function () {
        if (this.rulesExtra)
            return this.rulesExtra;
        var table = this.getRulesTable();
        table.paragraph = new ExtendRegexp(table.paragraph)
            .setGroup('footnote', /^\[\^([^\]]+)\]: *([^\n]*(?:\n+|$)(?: {1,}[^\n]*(?:\n+|$))*)/)
            .getRegex();
        return (this.rulesExtra = __assign({}, table, { footnote: /^\[\^([^\]]+)\]: ([^\n]+)/ }));
    };
    BlockLexer.prototype.setRules = function () {
        var _this = this;
        if (this.options.extra) {
            this.rules = this.staticThis.getRulesExtra();
        }
        else if (this.options.pedantic) {
            this.rules = this.staticThis.getRulesPedantic();
        }
        else if (this.options.gfm) {
            if (this.options.tables) {
                this.rules = this.staticThis.getRulesTable();
            }
            else {
                this.rules = this.staticThis.getRulesGfm();
            }
        }
        else {
            this.rules = this.staticThis.getRulesBase();
        }
        this.options.disabledRules.forEach(function (rule) {
            _this.rules[rule] = _this.options.noop;
        });
        this.isGfm = this.rules.fences !== undefined;
        this.isTable = this.rules.table !== undefined;
        this.isExtra = this.rules.footnote !== undefined;
    };
    /**
     * Lexing.
     */
    BlockLexer.prototype.getTokens = function (src, top) {
        var nextPart = src;
        var execArr;
        mainLoop: while (nextPart) {
            // newline
            if ((execArr = this.rules.newline.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                if (execArr[0].length > 1) {
                    this.tokens.push({
                        type: TokenType.space
                    });
                }
            }
            // code
            if ((execArr = this.rules.code.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                var code = execArr[0].replace(/^ {4}/gm, '');
                this.tokens.push({
                    type: TokenType.code,
                    text: !this.options.pedantic ? this.options.rtrim(code, '\n') : code
                });
                continue;
            }
            // fences code (gfm)
            if (this.isGfm &&
                (execArr = this.rules.fences.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                this.tokens.push({
                    type: TokenType.code,
                    lang: execArr[2],
                    text: execArr[3] || ''
                });
                continue;
            }
            // footnote
            if (this.isExtra &&
                (execArr = this.rules.footnote.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                var item = {
                    type: TokenType.footnote,
                    refname: this.options.slug(execArr[1]),
                    text: execArr[2]
                };
                this.tokens.push(item);
                continue;
            }
            // heading
            if ((execArr = this.rules.heading.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                this.tokens.push({
                    type: TokenType.heading,
                    depth: execArr[1].length,
                    text: execArr[2],
                    ends: execArr[3] || ''
                });
                continue;
            }
            // table no leading pipe (gfm)
            if (top &&
                this.isTable &&
                (execArr = this.rules.nptable.exec(nextPart))) {
                var item = {
                    type: TokenType.table,
                    header: this.splitCells(execArr[1].replace(/^ *| *\| *$/g, '')),
                    align: execArr[2]
                        .replace(/^ *|\| *$/g, '')
                        .split(/ *\| */),
                    cells: execArr[3]
                        ? execArr[3].replace(/\n$/, '').split('\n')
                        : []
                };
                if (item.header.length === item.align.length) {
                    nextPart = nextPart.substring(execArr[0].length);
                    for (var i = 0; i < item.align.length; i++) {
                        if (/^ *-+: *$/.test(item.align[i])) {
                            item.align[i] = 'right';
                        }
                        else if (/^ *:-+: *$/.test(item.align[i])) {
                            item.align[i] = 'center';
                        }
                        else if (/^ *:-+ *$/.test(item.align[i])) {
                            item.align[i] = 'left';
                        }
                        else {
                            item.align[i] = null;
                        }
                    }
                    var td = execArr[3].replace(/\n$/, '').split('\n');
                    for (var i = 0; i < td.length; i++) {
                        item.cells[i] = this.splitCells(td[i], item.header.length);
                    }
                    this.tokens.push(item);
                    continue;
                }
            }
            // hr
            if ((execArr = this.rules.hr.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                this.tokens.push({
                    type: TokenType.hr
                });
                continue;
            }
            // blockquote
            if ((execArr = this.rules.blockquote.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                this.tokens.push({
                    type: TokenType.blockquoteStart
                });
                var str = execArr[0].replace(/^ *> ?/gm, '');
                // Pass `top` to keep the current
                // "toplevel" state. This is exactly
                // how markdown.pl works.
                this.getTokens(str);
                this.tokens.push({
                    type: TokenType.blockquoteEnd
                });
                continue;
            }
            // list
            if ((execArr = this.rules.list.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                var bull = execArr[2];
                var isordered = bull.length > 1;
                var listStart = {
                    type: TokenType.listStart,
                    ordered: isordered,
                    start: isordered ? +bull : '',
                    loose: false
                };
                this.tokens.push(listStart);
                // Get each top-level item.
                var str = execArr[0].match(this.rules.item);
                var listItems = [];
                var length_1 = str.length;
                var next = false, space = void 0, blockBullet = void 0, loose = void 0;
                for (var i = 0; i < length_1; i++) {
                    var item = str[i];
                    var checked = null;
                    // Remove the list item's bullet, so it is seen as the next token.
                    space = item.length;
                    item = item.replace(/^ *([*+-]|\d+\.) +/, '');
                    // Check for task list items
                    if (this.isGfm &&
                        (execArr = this.rules.checkbox.exec(item))) {
                        checked = execArr[1] !== ' ';
                        item = item.replace(this.rules.checkbox, '');
                    }
                    // Outdent whatever the list item contains. Hacky.
                    if (item.indexOf('\n ') !== -1) {
                        space -= item.length;
                        item = !this.options.pedantic
                            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
                            : item.replace(/^ {1,4}/gm, '');
                    }
                    // Determine whether the next list item belongs here.
                    // Backpedal if it does not belong in this list.
                    if (this.options.smartLists && i !== length_1 - 1) {
                        blockBullet = this.staticThis
                            .getRulesBase()
                            .bullet.exec(str[i + 1])[0];
                        if (bull !== blockBullet &&
                            !(bull.length > 1 && blockBullet.length > 1)) {
                            nextPart = str.slice(i + 1).join('\n') + nextPart;
                            i = length_1 - 1;
                        }
                    }
                    // Determine whether item is loose or not.
                    // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
                    // for discount behavior.
                    loose = next || /\n\n(?!\s*$)/.test(item);
                    if (i !== length_1 - 1) {
                        next = item.charAt(item.length - 1) === '\n';
                        if (!loose)
                            loose = next;
                    }
                    if (loose) {
                        listStart.loose = true;
                    }
                    var t = {
                        loose: loose,
                        checked: checked,
                        type: loose ? TokenType.looseItemStart : TokenType.listItemStart
                    };
                    listItems.push(t);
                    this.tokens.push(t);
                    // Recurse.
                    this.getTokens(item, false);
                    this.tokens.push({
                        type: TokenType.listItemEnd
                    });
                }
                if (listStart.loose) {
                    var l = listItems.length;
                    var i = 0;
                    for (; i < l; i++) {
                        listItems[i].loose = true;
                    }
                }
                this.tokens.push({
                    type: TokenType.listEnd
                });
                continue;
            }
            // html
            if ((execArr = this.rules.html.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                var attr = execArr[1];
                var isPre = attr === 'pre' || attr === 'script' || attr === 'style';
                this.tokens.push({
                    type: this.options.sanitize ? TokenType.paragraph : TokenType.html,
                    pre: !this.options.sanitizer && isPre,
                    text: execArr[0]
                });
                continue;
            }
            // def
            if (top && (execArr = this.rules.def.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                var tag = execArr[1].toLowerCase().replace(/\s+/g, ' ');
                if (!this.links[tag]) {
                    var title = execArr[3];
                    if (title) {
                        title = title.substring(1, title.length - 1);
                    }
                    this.links[tag] = { title: title, href: execArr[2] };
                }
                continue;
            }
            // table (gfm)
            if (top &&
                this.isTable &&
                (execArr = this.rules.table.exec(nextPart))) {
                var item = {
                    type: TokenType.table,
                    header: this.splitCells(execArr[1].replace(/^ *| *\| *$/g, '')),
                    align: execArr[2]
                        .replace(/^ *|\| *$/g, '')
                        .split(/ *\| */),
                    cells: execArr[3]
                        ? execArr[3].replace(/(?: *\| *)?\n$/, '').split('\n')
                        : []
                };
                if (item.header.length === item.align.length) {
                    nextPart = nextPart.substring(execArr[0].length);
                    for (var i = 0; i < item.align.length; i++) {
                        if (/^ *-+: *$/.test(item.align[i])) {
                            item.align[i] = 'right';
                        }
                        else if (/^ *:-+: *$/.test(item.align[i])) {
                            item.align[i] = 'center';
                        }
                        else if (/^ *:-+ *$/.test(item.align[i])) {
                            item.align[i] = 'left';
                        }
                        else {
                            item.align[i] = null;
                        }
                    }
                    var td = execArr[3].replace(/(?: *\| *)?\n$/, '').split('\n');
                    for (var i = 0; i < td.length; i++) {
                        item.cells[i] = this.splitCells(td[i].replace(/^ *\| *| *\| *$/g, ''), item.header.length);
                    }
                    this.tokens.push(item);
                    continue;
                }
            }
            // simple rules
            if (this.staticThis.simpleRules.length) {
                var simpleRules = this.staticThis.simpleRules;
                for (var i = 0; i < simpleRules.length; i++) {
                    if ((execArr = simpleRules[i].exec(nextPart))) {
                        nextPart = nextPart.substring(execArr[0].length);
                        var type = 'simpleRule' + (i + 1);
                        this.tokens.push({
                            type: type,
                            execArr: execArr
                        });
                        continue mainLoop;
                    }
                }
            }
            // lheading
            if ((execArr = this.rules.lheading.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                this.tokens.push({
                    type: TokenType.heading,
                    depth: execArr[2] === '=' ? 1 : 2,
                    text: execArr[1]
                });
                continue;
            }
            // top-level paragraph
            if (top && (execArr = this.rules.paragraph.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                if (execArr[1].slice(-1) === '\n') {
                    this.tokens.push({
                        type: TokenType.paragraph,
                        text: execArr[1].slice(0, -1)
                    });
                }
                else {
                    this.tokens.push({
                        type: this.tokens.length > 0 ? TokenType.paragraph : TokenType.text,
                        text: execArr[1]
                    });
                }
                continue;
            }
            // text
            // Top-level should never reach here.
            if ((execArr = this.rules.text.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                this.tokens.push({
                    type: TokenType.text,
                    text: execArr[0]
                });
                continue;
            }
            if (nextPart) {
                throw new Error('Infinite loop on byte: ' +
                    nextPart.charCodeAt(0) +
                    (", near text '" + nextPart.slice(0, 30) + "...'"));
            }
        }
        return { tokens: this.tokens, links: this.links };
    };
    BlockLexer.prototype.splitCells = function (tableRow, count) {
        // ensure that every cell-delimiting pipe has a space
        // before it to distinguish it from an escaped pipe
        var row = tableRow.replace(/\|/g, function (match, offset, str) {
            var escaped = false, curr = offset;
            while (--curr >= 0 && str[curr] === '\\')
                escaped = !escaped;
            if (escaped) {
                // odd number of slashes means | is escaped
                // so we leave it alone
                return '|';
            }
            else {
                // add space before unescaped |
                return ' |';
            }
        }), cells = row.split(/ \|/), i = 0;
        if (cells.length > count) {
            cells.splice(count);
        }
        else {
            while (cells.length < count)
                cells.push('');
        }
        for (; i < cells.length; i++) {
            // leading or trailing whitespace is ignored per the gfm spec
            cells[i] = cells[i].trim().replace(/\\\|/g, '|');
        }
        return cells;
    };
    BlockLexer.simpleRules = [];
    return BlockLexer;
}());

var Renderer = /** @class */ (function () {
    function Renderer(options) {
        this.options = options || {};
        this._headings = [];
        this._footnotes = [];
    }
    Renderer.prototype.code = function (code, lang, escaped) {
        if (this.options.highlight) {
            var out = this.options.highlight(code, lang);
            if (out != null && out !== code) {
                escaped = true;
                code = out;
            }
        }
        if (!lang) {
            return "<pre><code>" + (escaped ? code : this.options.escape(code, true)) + "</code></pre>";
        }
        var dataLang = this.options.langAttribute
            ? " data-lang=\"" + this.options.escape(lang, true) + "\""
            : '';
        return "<pre" + dataLang + "><code class=\"" + this.options.langPrefix + this.options.escape(lang, true) + "\">" + (escaped ? code : this.options.escape(code, true)) + "</code></pre>\n";
    };
    Renderer.prototype.blockquote = function (quote) {
        return "<blockquote>\n" + quote + "</blockquote>\n";
    };
    Renderer.prototype.html = function (html) {
        return html;
    };
    Renderer.prototype.heading = function (text, level, raw, ends) {
        var headerId = this.options.headerId;
        var idHtml = '';
        if ((headerId === true) ||
            (headerId === 'off' && ends) ||
            (headerId === 'on' && !ends)) {
            var id = this.options.slug(raw);
            var count = this._headings.filter(function (h) { return h === raw; }).length;
            if (count > 0) {
                id += "-" + count;
            }
            idHtml = " id=\"" + this.options.headerPrefix + id + "\"";
            this._headings.push(raw);
        }
        return "<h" + level + idHtml + ">" + text + "</h" + level + ">\n";
    };
    Renderer.prototype.hr = function () {
        return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
    };
    Renderer.prototype.list = function (body, ordered, start, isTaskList) {
        var type = ordered ? 'ol' : 'ul';
        var startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
        return "<" + type + startatt + ">\n" + body + "</" + type + ">\n";
    };
    Renderer.prototype.listitem = function (text, checked) {
        return checked === null ? "<li>" + text + "</li>\n" : "<li class=\"task-list-item\"><input type=\"checkbox\" class=\"task-list-item-checkbox\" " + (checked ? 'checked ' : '') + " disabled> " + text + "</li>\n";
    };
    Renderer.prototype.paragraph = function (text) {
        return "<p>" + text + "</p>\n";
    };
    Renderer.prototype.table = function (header, body) {
        if (body)
            body = '<tbody>' + body + '</tbody>';
        return "\n<table>\n<thead>\n" + header + "</thead>\n" + body + "</table>\n";
    };
    Renderer.prototype.tablerow = function (content) {
        return "<tr>\n" + content + "</tr>\n";
    };
    Renderer.prototype.tablecell = function (content, flags) {
        var header = flags.header, align = flags.align;
        var type = header ? 'th' : 'td';
        var tag = align
            ? '<' + type + ' align="' + align + '">'
            : '<' + type + '>';
        return tag + content + '</' + type + '>\n';
    };
    //*** Inline level renderer methods. ***
    Renderer.prototype.strong = function (text) {
        return "<strong>" + text + "</strong>";
    };
    Renderer.prototype.em = function (text) {
        return "<em>" + text + "</em>";
    };
    Renderer.prototype.codespan = function (text) {
        return "<code>" + text + "</code>";
    };
    Renderer.prototype.br = function () {
        return this.options.xhtml ? '<br/>' : '<br>';
    };
    Renderer.prototype.del = function (text) {
        return "<del>" + text + "</del>";
    };
    Renderer.prototype.fnref = function (refname) {
        if (!this._footnotes.includes(refname)) {
            this._footnotes.push(refname);
        }
        return "<sup id=\"fnref:" + refname + "\"><a href=\"#fn:" + refname + "\" class=\"footnote-ref\" role=\"doc-noteref\">" + this._footnotes.length + "</a></sup>";
    };
    Renderer.prototype.footnote = function (footnotes) {
        var out = "<div class=\"footnotes\" role=\"doc-endnotes\">" + this.hr() + "<ol>";
        for (var _i = 0, _a = this._footnotes; _i < _a.length; _i++) {
            var refname = _a[_i];
            out += "<li id=\"fn:" + refname + "\" role=\"doc-endnote\"><span class=\"cite-text\">" + (footnotes[refname] ||
                '?') + "</span><a href=\"#fnref:" + refname + "\" class=\"footnote-backref\" role=\"doc-backlink\">&#8617;</a></li>";
        }
        out += '</ol></div>';
        this._footnotes = [];
        return out;
    };
    Renderer.prototype.link = function (href, title, text) {
        if (this.options.sanitize) {
            var prot = void 0;
            try {
                prot = decodeURIComponent(this.options.unescape(href))
                    .replace(/[^\w:]/g, '')
                    .toLowerCase();
            }
            catch (e) {
                return text;
            }
            if (prot.indexOf('javascript:') === 0 ||
                prot.indexOf('vbscript:') === 0 ||
                prot.indexOf('data:') === 0) {
                return text;
            }
        }
        if (this.options.baseUrl) {
            href = this.options.resolveUrl(this.options.baseUrl, href);
        }
        try {
            href = encodeURI(href).replace(/%25/g, '%');
        }
        catch (e) {
            return text;
        }
        var out = '<a href="' + this.options.escape(href) + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        var _a = this.options, linksInNewTab = _a.linksInNewTab, trimLinkText = _a.trimLinkText;
        var targetBlank = linksInNewTab === true ||
            (typeof linksInNewTab === 'function' && linksInNewTab.call(this, href));
        if (typeof targetBlank === 'string') {
            out += targetBlank;
        }
        else if (targetBlank) {
            out += " target=\"_blank\"";
        }
        if (trimLinkText) {
            text = trimLinkText(text);
        }
        out += '>' + text + '</a>';
        return out;
    };
    Renderer.prototype.image = function (href, title, text) {
        if (this.options.baseUrl) {
            href = this.options.resolveUrl(this.options.baseUrl, href);
        }
        var out = '<img src="' + href + '" alt="' + text + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? '/>' : '>';
        return out;
    };
    Renderer.prototype.text = function (text) {
        return text;
    };
    return Renderer;
}());
var TextRenderer = /** @class */ (function () {
    function TextRenderer() {
    }
    TextRenderer.prototype.strong = function (text) {
        return text;
    };
    TextRenderer.prototype.em = function (text) {
        return text;
    };
    TextRenderer.prototype.codespan = function (text) {
        return text;
    };
    TextRenderer.prototype.del = function (text) {
        return text;
    };
    TextRenderer.prototype.text = function (text) {
        return text;
    };
    TextRenderer.prototype.link = function (href, title, text) {
        return '' + text;
    };
    TextRenderer.prototype.image = function (href, title, text) {
        return '' + text;
    };
    TextRenderer.prototype.br = function () {
        return '';
    };
    return TextRenderer;
}());

/**
 * Inline Lexer & Compiler.
 */
var InlineLexer = /** @class */ (function () {
    function InlineLexer(staticThis, links, options, renderer) {
        if (links === void 0) { links = {}; }
        this.staticThis = staticThis;
        this.links = links;
        this.options = options;
        this.renderer = renderer || this.options.renderer || new Renderer(this.options);
        this.renderer.options = this.options;
        this.setRules();
    }
    /**
     * Static Lexing/Compiling Method.
     */
    InlineLexer.output = function (src, links, options) {
        var inlineLexer = new this(this, links, options);
        return inlineLexer.output(src);
    };
    InlineLexer.getRulesBase = function () {
        if (this.rulesBase)
            return this.rulesBase;
        var tag = '^comment'
            + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
            + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
            + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
            + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
            + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'; // CDATA section
        var regexTag = new RegExp(tag);
        /**
         * Inline-Level Grammar.
         */
        var base = {
            escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
            autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
            tag: regexTag,
            link: /^!?\[(label)\]\(href(?:\s+(title))?\s*\)/,
            reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
            nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
            strong: /^__([^\s])__(?!_)|^\*\*([^\s])\*\*(?!\*)|^__([^\s][\s\S]*?[^\s])__(?!_)|^\*\*([^\s][\s\S]*?[^\s])\*\*(?!\*)/,
            em: /^_([^\s_])_(?!_)|^\*([^\s*"<\[])\*(?!\*)|^_([^\s][\s\S]*?[^\s_])_(?!_)|^_([^\s_][\s\S]*?[^\s])_(?!_)|^\*([^\s"<\[][\s\S]*?[^\s*])\*(?!\*)|^\*([^\s*"<\[][\s\S]*?[^\s])\*(?!\*)/,
            code: /^(`+)\s*([\s\S]*?[^`]?)\s*\1(?!`)/,
            br: /^( {2,}|\\)\n(?!\s*$)/,
            text: /^[\s\S]+?(?=[\\<!\[`*]|\b_| {2,}\n|$)/,
            _scheme: /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/,
            _email: /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/,
            _label: /(?:\[[^\[\]]*\]|\\[\[\]]?|`[^`]*`|[^\[\]\\])*?/,
            _href: /\s*(<(?:\\[<>]?|[^\s<>\\])*>|(?:\\[()]?|\([^\s\x00-\x1f\\]*\)|[^\s\x00-\x1f()\\])*?)/,
            _title: /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/,
            _escapes: /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g,
            _attribute: /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/
        };
        base.autolink = new ExtendRegexp(base.autolink)
            .setGroup('scheme', base._scheme)
            .setGroup('email', base._email)
            .getRegex();
        var comment = /<!--(?!-?>)[\s\S]*?-->/; // block comment
        base.tag = new ExtendRegexp(base.tag)
            .setGroup('comment', comment)
            .setGroup('attribute', base._attribute)
            .getRegex();
        base.link = new ExtendRegexp(base.link)
            .setGroup('label', base._label)
            .setGroup('href', base._href)
            .setGroup('title', base._title)
            .getRegex();
        base.reflink = new ExtendRegexp(base.reflink)
            .setGroup('label', base._label)
            .getRegex();
        return (this.rulesBase = base);
    };
    InlineLexer.getRulesPedantic = function () {
        if (this.rulesPedantic)
            return this.rulesPedantic;
        var base = this.getRulesBase();
        var regexLink = new ExtendRegexp(/^!?\[(label)\]\((.*?)\)/)
            .setGroup('label', base._label)
            .getRegex();
        var regexReflink = new ExtendRegexp(/^!?\[(label)\]\s*\[([^\]]*)\]/)
            .setGroup('label', base._label)
            .getRegex();
        return (this.rulesPedantic = __assign({}, base, {
            strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
            em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,
            link: regexLink,
            reflink: regexReflink
        }));
    };
    InlineLexer.getRulesGfm = function () {
        if (this.rulesGfm)
            return this.rulesGfm;
        var base = this.getRulesBase();
        var escape$$1 = new ExtendRegexp(base.escape)
            .setGroup('])', '~|])')
            .getRegex();
        var _url = /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/;
        var url = new ExtendRegexp(_url)
            .setGroup('email', base._email)
            .getRegex();
        var _backpedal = /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/;
        var del = /^~+(?=\S)([\s\S]*?\S)~+/;
        var text = new ExtendRegexp(base.text)
            .setGroup(']|', '~]|')
            .setGroup('|', "|https?://|ftp://|www\\.|[a-zA-Z0-9.!#$%&'*+/=?^_`{\\|}~-]+@|")
            .getRegex();
        return (this.rulesGfm = __assign({}, base, { escape: escape$$1, url: url, _backpedal: _backpedal, del: del, text: text }));
    };
    InlineLexer.getRulesBreaks = function () {
        if (this.rulesBreaks)
            return this.rulesBreaks;
        var gfm = this.getRulesGfm();
        return (this.rulesBreaks = __assign({}, gfm, {
            br: new ExtendRegexp(gfm.br).setGroup('{2,}', '*').getRegex(),
            text: new ExtendRegexp(gfm.text).setGroup('{2,}', '*').getRegex()
        }));
    };
    InlineLexer.getRulesExtra = function () {
        if (this.rulesExtra)
            return this.rulesExtra;
        var breaks = this.getRulesBreaks();
        return (this.rulesExtra = __assign({}, breaks, {
            fnref: new ExtendRegexp(/^!?\[\^(label)\]/)
                .setGroup('label', breaks._label)
                .getRegex()
        }));
    };
    InlineLexer.prototype.setRules = function () {
        var _this = this;
        if (this.options.extra) {
            this.rules = this.staticThis.getRulesExtra();
        }
        else if (this.options.pedantic) {
            this.rules = this.staticThis.getRulesPedantic();
        }
        else if (this.options.gfm) {
            this.rules = this.options.breaks
                ? this.staticThis.getRulesBreaks()
                : this.staticThis.getRulesGfm();
        }
        else {
            this.rules = this.staticThis.getRulesBase();
        }
        if (this.options.inlineSplitChars) {
            var textRuleStr = this.rules.text.toString();
            var newStr = this.options.inlineSplitChars + "]|";
            if (!textRuleStr.includes(newStr)) {
                this.rules.text = new RegExp(textRuleStr.replace(']|', newStr).slice(1, -1));
            }
        }
        this.options.disabledRules.forEach(function (rule) {
            _this.rules[rule] = _this.options.noop;
        });
        this.isGfm = this.rules.url !== undefined;
        this.isExtra = this.rules.fnref !== undefined;
    };
    InlineLexer.prototype.escapes = function (text) {
        return text ? text.replace(this.rules._escapes, '$1') : text;
    };
    /**
     * Lexing/Compiling.
     */
    InlineLexer.prototype.output = function (nextPart) {
        nextPart = nextPart;
        var execArr;
        var out = '';
        var preParts = [nextPart, nextPart];
        var simpleRules = this.staticThis.simpleRules || [];
        var simpleRulesBefore = simpleRules.filter(function (rule) { return rule.options.priority === 'before'; });
        var simpleRulesAfter = simpleRules.filter(function (rule) { return rule.options.priority !== 'before'; });
        mainLoop: while (nextPart) {
            // escape
            if ((execArr = this.rules.escape.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                out += execArr[1];
                continue;
            }
            // simple rules before
            for (var _i = 0, simpleRulesBefore_1 = simpleRulesBefore; _i < simpleRulesBefore_1.length; _i++) {
                var sr = simpleRulesBefore_1[_i];
                if ((execArr = sr.rule.exec(nextPart))) {
                    preParts[0] = preParts[1];
                    preParts[1] = nextPart;
                    if (!sr.options.checkPreChar || sr.options.checkPreChar(preParts[0].charAt(preParts[0].length - nextPart.length - 1))) {
                        nextPart = nextPart.substring(execArr[0].length);
                        out += sr.render.call(this, execArr);
                        continue mainLoop;
                    }
                }
            }
            // autolink
            if ((execArr = this.rules.autolink.exec(nextPart))) {
                var text = void 0, href = void 0;
                nextPart = nextPart.substring(execArr[0].length);
                if (execArr[2] === '@') {
                    text = this.options.escape(this.mangle(execArr[1]));
                    href = 'mailto:' + text;
                }
                else {
                    text = this.options.escape(execArr[1]);
                    href = text;
                }
                out += this.renderer.link(href, null, text);
                continue;
            }
            // url (gfm)
            if (!this.inLink &&
                this.isGfm &&
                (execArr = this.rules.url.exec(nextPart))) {
                var text = void 0, href = void 0, prevCapZero = void 0;
                do {
                    prevCapZero = execArr[0];
                    execArr[0] = this.rules._backpedal.exec(execArr[0])[0];
                } while (prevCapZero !== execArr[0]);
                nextPart = nextPart.substring(execArr[0].length);
                text = this.options.escape(execArr[0]);
                if (execArr[2] === '@') {
                    href = 'mailto:' + text;
                }
                else {
                    if (execArr[1] === 'www.') {
                        href = 'http://' + text;
                    }
                    else {
                        href = text;
                    }
                }
                out += this.renderer.link(href, null, text);
                continue;
            }
            // tag
            if ((execArr = this.rules.tag.exec(nextPart))) {
                if (!this.inLink && /^<a /i.test(execArr[0])) {
                    this.inLink = true;
                }
                else if (this.inLink && /^<\/a>/i.test(execArr[0])) {
                    this.inLink = false;
                }
                nextPart = nextPart.substring(execArr[0].length);
                out += this.options.sanitize
                    ? this.options.sanitizer
                        ? this.options.sanitizer.call(this, execArr[0])
                        : this.options.escape(execArr[0])
                    : execArr[0];
                continue;
            }
            // link
            if ((execArr = this.rules.link.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                this.inLink = true;
                var href = execArr[2];
                var title = void 0;
                if (this.options.pedantic) {
                    var link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);
                    if (link) {
                        href = link[1];
                        title = link[3];
                    }
                    else {
                        title = '';
                    }
                }
                else {
                    title = execArr[3] ? execArr[3].slice(1, -1) : '';
                }
                href = href.trim().replace(/^<([\s\S]*)>$/, '$1');
                out += this.outputLink(execArr, {
                    href: this.escapes(href),
                    title: this.escapes(title)
                });
                this.inLink = false;
                continue;
            }
            // fnref
            if (this.isExtra &&
                (execArr = this.rules.fnref.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                out += this.renderer.fnref(this.options.slug(execArr[1]));
                continue;
            }
            // reflink, nolink
            if ((execArr = this.rules.reflink.exec(nextPart)) ||
                (execArr = this.rules.nolink.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                var keyLink = (execArr[2] || execArr[1]).replace(/\s+/g, ' ');
                var link = this.links[keyLink.toLowerCase()];
                if (!link || !link.href) {
                    out += execArr[0].charAt(0);
                    nextPart = execArr[0].substring(1) + nextPart;
                    continue;
                }
                this.inLink = true;
                out += this.outputLink(execArr, link);
                this.inLink = false;
                continue;
            }
            // strong
            if ((execArr = this.rules.strong.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                out += this.renderer.strong(this.output(execArr[4] || execArr[3] || execArr[2] || execArr[1]));
                continue;
            }
            // em
            if ((execArr = this.rules.em.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                out += this.renderer.em(this.output(execArr[6] || execArr[5] || execArr[4] || execArr[3] || execArr[2] || execArr[1]));
                continue;
            }
            // code
            if ((execArr = this.rules.code.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                out += this.renderer.codespan(this.options.escape(execArr[2].trim(), true));
                continue;
            }
            // br
            if ((execArr = this.rules.br.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                out += this.renderer.br();
                continue;
            }
            // del (gfm)
            if (this.isGfm &&
                (execArr = this.rules.del.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                out += this.renderer.del(this.output(execArr[1]));
                continue;
            }
            // simple rules after
            for (var _a = 0, simpleRulesAfter_1 = simpleRulesAfter; _a < simpleRulesAfter_1.length; _a++) {
                var sr = simpleRulesAfter_1[_a];
                if ((execArr = sr.rule.exec(nextPart))) {
                    preParts[0] = preParts[1];
                    preParts[1] = nextPart;
                    if (!sr.options.checkPreChar || sr.options.checkPreChar(preParts[0].charAt(preParts[0].length - nextPart.length - 1))) {
                        nextPart = nextPart.substring(execArr[0].length);
                        out += sr.render.call(this, execArr);
                        continue mainLoop;
                    }
                }
            }
            // text
            if ((execArr = this.rules.text.exec(nextPart))) {
                nextPart = nextPart.substring(execArr[0].length);
                out += this.renderer.text(this.options.escape(this.smartypants(execArr[0])));
                continue;
            }
            if (nextPart)
                throw new Error('Infinite loop on byte: ' + nextPart.charCodeAt(0));
        }
        return out;
    };
    /**
     * Compile Link.
     */
    InlineLexer.prototype.outputLink = function (execArr, link) {
        var href = link.href;
        var title = link.title ? this.options.escape(link.title) : null;
        return execArr[0].charAt(0) !== '!'
            ? this.renderer.link(href, title, this.output(execArr[1]))
            : this.renderer.image(href, title, this.options.escape(execArr[1]));
    };
    /**
     * Smartypants Transformations.
     */
    InlineLexer.prototype.smartypants = function (text) {
        if (!this.options.smartypants)
            return text;
        return (text
            // em-dashes
            .replace(/---/g, '\u2014')
            // en-dashes
            .replace(/--/g, '\u2013')
            // opening singles
            .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
            // closing singles & apostrophes
            .replace(/'/g, '\u2019')
            // opening doubles
            .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
            // closing doubles
            .replace(/"/g, '\u201d')
            // ellipses
            .replace(/\.{3}/g, '\u2026'));
    };
    /**
     * Mangle Links.
     */
    InlineLexer.prototype.mangle = function (text) {
        if (!this.options.mangle)
            return text;
        var out = '';
        var length = text.length;
        for (var i = 0; i < length; i++) {
            var ch = text.charCodeAt(i);
            if (Math.random() > 0.5) {
                ch = 'x' + ch.toString(16);
            }
            out += '&#' + ch + ';';
        }
        return out;
    };
    InlineLexer.simpleRules = [];
    return InlineLexer;
}());

/**
 * Parsing & Compiling.
 */
var Parser = /** @class */ (function () {
    function Parser(options) {
        this.simpleRenderers = [];
        this.line = 0;
        this.tokens = [];
        this.token = null;
        this.footnotes = {};
        this.options = options;
        this.renderer = this.options.renderer || new Renderer(this.options);
        this.renderer.options = this.options;
    }
    Parser.parse = function (tokens, links, options) {
        var parser = new this(options);
        return parser.parse(links, tokens);
    };
    Parser.prototype.parse = function (links, tokens) {
        this.inlineLexer = new InlineLexer(InlineLexer, links, this.options, this.renderer);
        this.inlineTextLexer = new InlineLexer(InlineLexer, links, Object.assign({}, this.options, {
            renderer: new TextRenderer()
        }));
        this.tokens = tokens.reverse();
        var out = '';
        while (this.next()) {
            out += this.tok();
        }
        if (Object.keys(this.footnotes).length) {
            out += this.renderer.footnote(this.footnotes);
            this.footnotes = {};
        }
        // Remove cached
        this.renderer._headings = [];
        return out;
    };
    Parser.prototype.next = function () {
        return (this.token = this.tokens.pop());
    };
    Parser.prototype.getNextElement = function () {
        return this.tokens[this.tokens.length - 1];
    };
    Parser.prototype.parseText = function () {
        var body = this.token.text;
        var nextElement;
        while ((nextElement = this.getNextElement()) &&
            nextElement.type == TokenType.text) {
            body += '\n' + this.next().text;
        }
        return this.inlineLexer.output(body);
    };
    Parser.prototype.tok = function () {
        switch (this.token.type) {
            case TokenType.space: {
                return '';
            }
            case TokenType.paragraph: {
                return this.renderer.paragraph(this.inlineLexer.output(this.token.text));
            }
            case TokenType.text: {
                if (this.options.isNoP)
                    return this.parseText();
                else
                    return this.renderer.paragraph(this.parseText());
            }
            case TokenType.heading: {
                return this.renderer.heading(this.inlineLexer.output(this.token.text), this.token.depth, this.options.unescape(this.inlineTextLexer.output(this.token.text)), this.token.ends);
            }
            case TokenType.listStart: {
                var body = '', ordered = this.token.ordered, start = this.token.start, isTaskList = false;
                while (this.next().type != TokenType.listEnd) {
                    if (this.token.checked !== null) {
                        isTaskList = true;
                    }
                    body += this.tok();
                }
                return this.renderer.list(body, ordered, start, isTaskList);
            }
            case TokenType.listItemStart: {
                var body = '';
                var loose = this.token.loose;
                var checked = this.token.checked;
                while (this.next().type != TokenType.listItemEnd) {
                    body += !loose && this.token.type === TokenType.text
                        ? this.parseText()
                        : this.tok();
                }
                return this.renderer.listitem(body, checked);
            }
            case TokenType.footnote: {
                this.footnotes[this.token.refname] = this.inlineLexer.output(this.token.text);
                return '';
            }
            case TokenType.code: {
                return this.renderer.code(this.token.text, this.token.lang, this.token.escaped);
            }
            case TokenType.table: {
                var header = '', body = '', row = void 0, cell 
                // header
                = void 0;
                // header
                cell = '';
                for (var i = 0; i < this.token.header.length; i++) {
                    var flags = { header: true, align: this.token.align[i] };
                    var out = this.inlineLexer.output(this.token.header[i]);
                    cell += this.renderer.tablecell(out, flags);
                }
                header += this.renderer.tablerow(cell);
                for (var i = 0; i < this.token.cells.length; i++) {
                    row = this.token.cells[i];
                    cell = '';
                    for (var j = 0; j < row.length; j++) {
                        cell += this.renderer.tablecell(this.inlineLexer.output(row[j]), {
                            header: false,
                            align: this.token.align[j]
                        });
                    }
                    body += this.renderer.tablerow(cell);
                }
                return this.renderer.table(header, body);
            }
            case TokenType.blockquoteStart: {
                var body = '';
                while (this.next().type != TokenType.blockquoteEnd) {
                    body += this.tok();
                }
                return this.renderer.blockquote(body);
            }
            case TokenType.hr: {
                return this.renderer.hr();
            }
            case TokenType.html: {
                // TODO parse inline content if parameter markdown=1
                return this.renderer.html(this.token.text);
            }
            default: {
                for (var i = 0; i < this.simpleRenderers.length; i++) {
                    if (this.token.type === 'simpleRule' + (i + 1)) {
                        return this.simpleRenderers[i].call(this.renderer, this.token.execArr);
                    }
                }
                var errMsg = "Token with \"" + this.token.type + "\" type was not found.";
                if (this.options.silent) {
                    console.log(errMsg);
                }
                else {
                    throw new Error(errMsg);
                }
            }
        }
    };
    return Parser;
}());

var Smarkdown = /** @class */ (function () {
    function Smarkdown() {
    }
    Smarkdown.getOptions = function (options) {
        if (!options) {
            return this.options;
        }
        if (typeof options.renderer === 'function') {
            options.renderer = new options.renderer(this.options);
        }
        return Object.assign({}, this.options, options);
    };
    /**
     * Merges the default options with options that will be set.
     *
     * @param options Hash of options.
     */
    Smarkdown.setOptions = function (options) {
        this.options = this.getOptions(options);
        return this;
    };
    /**
     * Setting simple block rule.
     */
    Smarkdown.setBlockRule = function (regexp, renderer) {
        if (renderer === void 0) { renderer = function () { return ''; }; }
        BlockLexer.simpleRules.push(regexp);
        this.simpleRenderers.push(renderer);
        return this;
    };
    /**
     * Setting simple inline rule.
     */
    Smarkdown.setInlineRule = function (regexp, renderer, options) {
        if (options === void 0) { options = {}; }
        InlineLexer.simpleRules.push({
            rule: regexp,
            render: renderer,
            options: options
        });
        return this;
    };
    /**
     * Accepts Markdown text and returns text in HTML format.
     *
     * @param src String of markdown source to be compiled.
     * @param options Hash of options. They replace, but do not merge with the default options.
     * If you want the merging, you can to do this via `Smarkdown.setOptions()`.
     */
    Smarkdown.inlineParse = function (src, options) {
        return new InlineLexer(InlineLexer, {}, this.getOptions(options)).output(src);
    };
    /**
     * Accepts Markdown text and returns text in HTML format.
     *
     * @param src String of markdown source to be compiled.
     * @param options Hash of options. They replace, but do not merge with the default options.
     * If you want the merging, you can to do this via `Smarkdown.setOptions()`.
     */
    Smarkdown.parse = function (src, options) {
        try {
            var opts = this.getOptions(options);
            var _a = this.callBlockLexer(src, opts), tokens = _a.tokens, links = _a.links;
            return this.callParser(tokens, links, opts);
        }
        catch (e) {
            return this.callMe(e);
        }
    };
    Smarkdown.callBlockLexer = function (src, options) {
        if (src === void 0) { src = ''; }
        if (typeof src != 'string')
            throw new Error("Expected that the 'src' parameter would have a 'string' type, got '" + typeof src + "'");
        // Preprocessing.
        src = src
            .replace(/\r\n|\r/g, '\n')
            .replace(/\t/g, '    ')
            .replace(/\u00a0/g, ' ')
            .replace(/\u2424/g, '\n')
            .replace(/^ +$/gm, '');
        return BlockLexer.lex(src, options, true);
    };
    Smarkdown.callParser = function (tokens, links, options) {
        if (this.simpleRenderers.length) {
            var parser = new Parser(options);
            parser.simpleRenderers = this.simpleRenderers;
            return parser.parse(links, tokens);
        }
        else {
            return Parser.parse(tokens, links, options);
        }
    };
    Smarkdown.callMe = function (err) {
        if (this.options.silent) {
            return ('<p>An error occurred:</p><pre>' +
                this.options.escape(err.message + '', true) +
                '</pre>');
        }
        throw err;
    };
    Smarkdown.options = new SmarkdownOptions();
    Smarkdown.simpleRenderers = [];
    return Smarkdown;
}());

export { BlockLexer, escape, unescape, slug, rtrim, resolveUrl, noop, ExtendRegexp, InlineLexer, TokenType, SmarkdownOptions, Smarkdown, Parser, Renderer, TextRenderer };
