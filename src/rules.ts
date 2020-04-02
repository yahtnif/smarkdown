import { blockCommentRegex, ExtendRegexp, noopRegex } from './helpers';
import {
  BaseBlockRules,
  ExtraBlockRules,
  GfmBlockRules,
  PedanticBlockRules,
  BaseInlineRules,
  BreaksInlineRules,
  ExtraMoreInlineRules,
  GfmInlineRules
} from './Interfaces';

/**
 * baseBlockRules
 */
const baseBlockHtml: string =
  '^ {0,3}(?:' + // optionsal indentation
  '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' + // (1)
  '|comment[^\\n]*(\\n+|$)' + // (2)
  '|<\\?[\\s\\S]*?\\?>\\n*' + // (3)
  '|<![A-Z][\\s\\S]*?>\\n*' + // (4)
  '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' + // (5)
  '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' + // (6)
  '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' + // (7) open tag
  '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' + // (7) closing tag
  ')';

const baseBlockRules: BaseBlockRules = {
  _comment: blockCommentRegex,
  blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
  bullet: /(?:[*+-]|\d{1,9}\.)/,
  code: /^( {4}[^\n]+\n*)+/,
  def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
  fences: /^ {0,3}(`{3,}|~{3,})([^`~\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
  heading: /^ {0,3}(#{1,6}) +([^\n]*?)(?: +#+)? *(?:\n+|$)/,
  hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
  html: new RegExp(baseBlockHtml),
  item: /^( *)(bull) ?[^\n]*(?:\n(?!\1bull ?)[^\n]*)*/,
  lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
  list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  newline: /^\n+/,
  // regex template, placeholders will be replaced according to different paragraph
  // interruption rules of commonmark and the original markdown spec:
  _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html)[^\n]+)*)/,
  text: /^[^\n]+/
};

const baseBlockLabel: RegExp = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
const baseBlockTitle: RegExp = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;

baseBlockRules.def = new ExtendRegexp(baseBlockRules.def)
  .setGroup('label', baseBlockLabel)
  .setGroup('title', baseBlockTitle)
  .getRegex();

baseBlockRules.item = new ExtendRegexp(baseBlockRules.item, 'gm')
  .setGroup(/bull/g, baseBlockRules.bullet)
  .getRegex();

baseBlockRules.list = new ExtendRegexp(baseBlockRules.list)
  .setGroup(/bull/g, baseBlockRules.bullet)
  .setGroup(
    'hr',
    '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))'
  )
  .setGroup('def', '\\n+(?=' + baseBlockRules.def.source + ')')
  .getRegex();

const baseBlockTag: string =
  'address|article|aside|base|basefont|blockquote|body|caption' +
  '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption' +
  '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe' +
  '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|options' +
  '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr' +
  '|track|ul';
const baseBlockAttribute: RegExp = / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/;

baseBlockRules.html = new ExtendRegexp(baseBlockRules.html, 'i')
  .setGroup('comment', baseBlockRules._comment)
  .setGroup('tag', baseBlockTag)
  .setGroup('attribute', baseBlockAttribute)
  .getRegex();

baseBlockRules.paragraph = new ExtendRegexp(baseBlockRules._paragraph)
  .setGroup('hr', baseBlockRules.hr)
  .setGroup('heading', ' {0,3}#{1,6} ')
  .setGroup('|lheading', '') // setex headings don't interrupt commonmark paragraphs
  .setGroup('blockquote', ' {0,3}>')
  .setGroup('fences', ' {0,3}(?:`{3,}|~{3,})[^`\\n]*\\n')
  .setGroup('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
  .setGroup('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)')
  .setGroup('tag', baseBlockTag) // pars can be interrupted by type (6) html blocks
  .getRegex();

baseBlockRules.blockquote = new ExtendRegexp(baseBlockRules.blockquote)
  .setGroup('paragraph', baseBlockRules.paragraph)
  .getRegex();

/**
 * pedanticBlockHtml
 */
const pedanticBlockHtml: string =
  '^ *(?:comment *(?:\\n|\\s*$)' +
  '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' + // closed tag
  '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))';
const pedanticBlockTag: string =
  '(?!(?:' +
  'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub' +
  '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)' +
  '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b';
const pedanticBlockHtmlRegex: RegExp = new ExtendRegexp(
  new RegExp(pedanticBlockHtml)
)
  .setGroup('comment', baseBlockRules._comment)
  .setGroup(/tag/g, pedanticBlockTag)
  .getRegex();

const pedanticBlockRules: PedanticBlockRules = {
  ...baseBlockRules,
  ...{
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
    heading: /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,
    fences: noopRegex, // fences not supported
    paragraph: new ExtendRegexp(baseBlockRules._paragraph)
      .setGroup('hr', baseBlockRules.hr)
      .setGroup('heading', ' *#{1,6} *[^\n]')
      .setGroup('lheading', baseBlockRules.lheading)
      .setGroup('blockquote', ' {0,3}>')
      .setGroup('|fences', '')
      .setGroup('|list', '')
      .setGroup('|html', '')
      .getRegex(),
    html: pedanticBlockHtmlRegex
  }
};

/**
 * gfmBlockRules
 */
const gfmBlockTable = new ExtendRegexp(
  new RegExp(
    '^ *\\|(.+)\\n' + // Header
    ' *\\|?( *[-:]+[-| :]*)' + // Align
      '(?:\\n((?:(?!^|>|\\n| |hr|heading|lheading|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells
  )
)
  .setGroup('hr', baseBlockRules.hr)
  .setGroup('heading', ' {0,3}#{1,6} ')
  .setGroup('lheading', '([^\\n]+)\\n {0,3}(=+|-+) *(?:\\n+|$)')
  .setGroup('blockquote', ' {0,3}>')
  .setGroup('code', ' {4}[^\\n]')
  .setGroup('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
  .setGroup('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
  .setGroup('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)')
  .setGroup('tag', baseBlockTag)
  .getRegex(); // pars can be interrupted by type (6) html blocks;

const gfmBlockRules: GfmBlockRules = {
  ...baseBlockRules,
  ...{
    checkbox: /^\[([ xX])\] +/,
    nptable: /^ *([^|\n ].*\|.*)\n *([-:]+ *\|[-| :]*)(?:\n((?:.*[^>\n ].*(?:\n|$))*)\n*|$)/,
    table: gfmBlockTable
  }
};

/**
 * extraBlockRules
 */
const extraBlockRules: ExtraBlockRules = {
  ...gfmBlockRules,
  paragraph: new ExtendRegexp(gfmBlockRules.paragraph)
    .setGroup(
      'footnote',
      /^\[\^([^\]]+)\]: *([^\n]*(?:\n+|$)(?: {1,}[^\n]*(?:\n+|$))*)/
    )
    .getRegex(),
  footnote: /^\[\^([^\]]+)\]: ([^\n]+)/
};

/**
 * baseInlineRules
 */
const baseInlineTag: string =
  '^comment' +
  '|^</[a-zA-Z][\\w:-]*\\s*>' + // self-closing tag
  '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' + // open tag
  '|^<\\?[\\s\\S]*?\\?>' + // processing instruction, e.g. <?php ?>
  '|^<![a-zA-Z]+\\s[\\s\\S]*?>' + // declaration, e.g. <!DOCTYPE html>
  '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'; // CDATA section

/**
 * Inline-Level Grammar.
 */
const baseInlineRules: BaseInlineRules = {
  _escapes: /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g,
  _label: /(?:\[[^\[\]]*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,
  autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
  br: /^( {2,}|\\)\n(?!\s*$)/,
  code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
  em: /^_([^\s_])_(?!_)|^\*([^\s*<\[])\*(?!\*)|^_([^\s<][\s\S]*?[^\s_])_(?!_|[^\spunctuation])|^_([^\s_<][\s\S]*?[^\s])_(?!_|[^\spunctuation])|^\*([^\s<"][\s\S]*?[^\s\*])\*(?!\*|[^\spunctuation])|^\*([^\s*"<\[][\s\S]*?[^\s])\*(?!\*)/,
  escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
  link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
  nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
  reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
  strong: /^__([^\s_])__(?!_)|^\*\*([^\s*])\*\*(?!\*)|^__([^\s][\s\S]*?[^\s])__(?!_)|^\*\*([^\s][\s\S]*?[^\s])\*\*(?!\*)/,
  tag: new RegExp(baseInlineTag),
  text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n))|(?= {2,}\n))/
};

const baseInlineAattribute: RegExp = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
const baseInlineEmail: RegExp = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
const baseInlineHref: RegExp = /<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*/;
const baseInlinePunctuation: string = '!"#$%&\'()*+,\\-./:;<=>?@\\[^_{|}~';
const baseInlineScheme: RegExp = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
const baseInlineTitle: RegExp = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;

// list of punctuation marks from common mark spec
// without ` and ] to workaround Rule 17 (inline code blocks/links)
baseInlineRules.em = new ExtendRegexp(baseInlineRules.em)
  .setGroup(/punctuation/g, baseInlinePunctuation)
  .getRegex();

baseInlineRules.autolink = new ExtendRegexp(baseInlineRules.autolink)
  .setGroup('scheme', baseInlineScheme)
  .setGroup('email', baseInlineEmail)
  .getRegex();

baseInlineRules.tag = new ExtendRegexp(baseInlineRules.tag)
  .setGroup('comment', blockCommentRegex)
  .setGroup('attribute', baseInlineAattribute)
  .getRegex();

baseInlineRules.link = new ExtendRegexp(baseInlineRules.link)
  .setGroup('label', baseInlineRules._label)
  .setGroup('href', baseInlineHref)
  .setGroup('title', baseInlineTitle)
  .getRegex();

baseInlineRules.reflink = new ExtendRegexp(baseInlineRules.reflink)
  .setGroup('label', baseInlineRules._label)
  .getRegex();

/**
 * pedanticInlineRules
 */
const pedanticInlineLinkRegex: RegExp = new ExtendRegexp(
  /^!?\[(label)\]\((.*?)\)/
)
  .setGroup('label', baseInlineRules._label)
  .getRegex();
const pedanticInlineReflinkRegex: RegExp = new ExtendRegexp(
  /^!?\[(label)\]\s*\[([^\]]*)\]/
)
  .setGroup('label', baseInlineRules._label)
  .getRegex();

const pedanticInlineRules = {
  ...baseInlineRules,
  ...{
    em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,
    link: pedanticInlineLinkRegex,
    reflink: pedanticInlineReflinkRegex,
    strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/
  }
};

/**
 * gfmInlineRules
 */
const gfmInlineEscape: RegExp = new ExtendRegexp(baseInlineRules.escape)
  .setGroup('])', '~|])')
  .getRegex();

const gfmInlineExtendedEmail: RegExp = /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/;
const _url: RegExp = /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/;
const gfmInlineUrl: RegExp = new ExtendRegexp(_url, 'i')
  .setGroup('email', gfmInlineExtendedEmail)
  .getRegex();

const gfmInlineBackpedal: RegExp = /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/;

/**
 * [GFM Strikethrough](https://github.github.com/gfm/#strikethrough-extension-)
 * Strikethrough text is any text wrapped in two tildes (~).
 * For now, gfm allows strikethrough text wrapped in single tilde on github, it's conflict with subscript extension.
 * [Single tilde in GFM spec](https://github.com/github/cmark/issues/99)
 *
 * const del = /^~+(?=\S)([\s\S]*?\S)~+/
 */
const gfmInlineDel: RegExp = /^~~(?=\S)([\s\S]*?\S)~~/;

const gfmInlineText = /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?= {2,}\n|[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/;

const gfmInlineRules: GfmInlineRules = {
  ...baseInlineRules,
  _backpedal: gfmInlineBackpedal,
  del: gfmInlineDel,
  escape: gfmInlineEscape,
  text: gfmInlineText,
  url: gfmInlineUrl
};

/**
 * breaksInlineRules
 */
const breaksInlineRules: BreaksInlineRules = {
  ...gfmInlineRules,
  br: new ExtendRegexp(gfmInlineRules.br).setGroup('{2,}', '*').getRegex(),
  text: new ExtendRegexp(gfmInlineRules.text)
    .setGroup('\\b_', '\\b_| {2,}\\n')
    .setGroup(/\{2,\}/g, '*')
    .getRegex()
};

/**
 * extraInlineRules
 */
const extraInlineRules: ExtraMoreInlineRules = {
  fnref: new ExtendRegexp(/^!?\[\^(label)\]/)
    .setGroup('label', gfmInlineRules._label)
    .getRegex()
};

export {
  baseBlockRules,
  pedanticBlockRules,
  gfmBlockRules,
  extraBlockRules,
  baseInlineRules,
  pedanticInlineRules,
  gfmInlineRules,
  breaksInlineRules,
  extraInlineRules
};
