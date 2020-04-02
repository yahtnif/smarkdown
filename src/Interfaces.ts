import {
  cleanUrl,
  escape,
  resolveUrl,
  rtrim,
  slugger,
  unescape
} from './helpers';
import { Renderer } from './Renderer';

export interface BaseBlockRules {
  _comment: RegExp;
  blockquote: RegExp;
  bullet: RegExp;
  code: RegExp;
  def: RegExp;
  fences: RegExp;
  heading: RegExp;
  hr: RegExp;
  html: RegExp;
  item: RegExp; // List item (<li>)
  lheading: RegExp;
  list: RegExp;
  newline: RegExp;
  paragraph?: RegExp;
  text: RegExp;
  _paragraph: RegExp;
}

export interface PedanticBlockRules extends BaseBlockRules {}

export interface GfmBlockRules extends BaseBlockRules {
  checkbox: RegExp;
  fences: RegExp;
  nptable: RegExp;
  table: RegExp;
}

export interface ExtraBlockRules extends GfmBlockRules {
  footnote: RegExp;
}

export type BlockRulesTypes = BaseBlockRules | GfmBlockRules | ExtraBlockRules;

export type BlockRulesType = keyof (BlockRulesTypes);

export interface Link {
  href: string;
  title: string;
}

export interface Links {
  [key: string]: Link;
}

export enum TokenType {
  blockquoteEnd = 1,
  blockquoteStart,
  code,
  footnote,
  heading,
  hr,
  html,
  listEnd,
  listItemEnd,
  listItemStart,
  listStart,
  looseItemEnd,
  looseItemStart,
  paragraph,
  raw,
  space,
  table,
  text
}

export type Align = 'center' | 'left' | 'right';

export interface Token {
  align?: Align[];
  cells?: string[][];
  depth?: number;
  ends?: string;
  escaped?: boolean;
  execArr?: RegExpExecArray;
  header?: string[];
  lang?: string;
  loose?: boolean;
  ordered?: boolean;
  pre?: boolean;
  start?: string | number;
  text?: string;
  type: number | string;
  /**
   * GFM
   */
  checked?: boolean | null;
  /**
   * Extra
   */
  footnote?: string;
  footnotes?: string[];
  refname?: string;
  codeBlockStyle?: string;
}

export interface BaseInlineRules {
  _escapes: RegExp;
  _label: RegExp;
  autolink: RegExp;
  br: RegExp;
  code: RegExp;
  em: RegExp;
  escape: RegExp;
  link: RegExp;
  nolink: RegExp;
  reflink: RegExp;
  strong: RegExp;
  tag: RegExp;
  text: RegExp;
}

export interface PedanticInlineRules extends BaseInlineRules {}

/**
 * GFM Inline Grammar
 */
export interface GfmInlineRules extends BaseInlineRules {
  _backpedal: RegExp;
  del: RegExp;
  url: RegExp;
}

export interface BreaksInlineRules extends GfmInlineRules {}

export interface ExtraInlineRules extends BreaksInlineRules {
  fnref: RegExp;
}

export interface ExtraMoreInlineRules {
  fnref: RegExp;
}

export type InlineRulesTypes =
  | BaseInlineRules
  | PedanticInlineRules
  | GfmInlineRules
  | BreaksInlineRules
  | ExtraInlineRules;

export type InlineRulesType = keyof (InlineRulesTypes);

export class Options {
  baseUrl?: string = null;
  breaks?: boolean = false;
  disabledRules?: string[] = [];
  extra?: boolean = false;
  gfm?: boolean = true;
  headerId?: boolean | string = false;
  headerPrefix?: string = '';
  highlight?: (code: string, lang?: string) => string;
  langAttribute?: boolean = false;
  langPrefix?: string = 'language-';
  linksInNewTab?: boolean | Function = false;
  mangle?: boolean = true;
  pedantic?: boolean = false;
  renderer?: Renderer;
  sanitize?: boolean = false;
  sanitizer?: (text: string) => string;
  silent?: boolean = false;
  smartLists?: boolean = false;
  smartypants?: boolean = false;
  trimLinkText?: Function;
  /**
   * Self-close the tags for void elements (&lt;br/&gt;, &lt;img/&gt;, etc.)
   * with a "/" as required by XHTML.
   */
  xhtml?: boolean = false;
  escape?: (html: string, encode?: boolean) => string = escape;
  unescape?: (html: string) => string = unescape;
  slug?: (str: string, isUnique?: boolean) => string = (
    str: string,
    isUnique?: boolean
  ): string => slugger.slug(str, isUnique);
  rtrim?: (str: string, c: string, invert?: boolean) => string = rtrim;
  resolveUrl?: (base: string, href: string) => string = resolveUrl;
  cleanUrl?: (
    sanitize: boolean,
    base: string,
    href: string
  ) => string = cleanUrl;
  /**
   * If set to `true`, an inline text will not be taken in paragraph.
   *
   * ```js
   * Smarkdown.parse('some text') // returns '<p>some text</p>'
   *
   * Smarkdown.parse('some text', {nop: true}) // returns 'some text'
   * ```
   */
  nop?: boolean = false;
}

export interface LexerReturns {
  links: Links;
  tokens: Token[];
}

export interface EmptyObject {
  [key: string]: any;
}

export type NewRenderer = (execArr?: RegExpExecArray) => string;

export interface BlockRenderer {
  renderer: NewRenderer;
  type: string;
}

export type InlineRuleOptions = {
  checkPreChar?: Function;
  priority?: number;
};

export type BlockRuleOptions = {
  priority?: number;
};

export interface InlineRule {
  breakChar: string;
  options: InlineRuleOptions;
  render: Function;
  rule: RegExp;
  type: string;
}

export interface BlockRule {
  options: BlockRuleOptions;
  rule: RegExp;
  type: string;
}

export interface TablecellFlags {
  align?: Align;
  header?: boolean;
}

export interface Footnotes {
  [key: string]: string;
}
