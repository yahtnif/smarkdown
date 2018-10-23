import { Renderer } from './renderer'
import { escape, unescape, slug, rtrim, resolveUrl, cleanUrl, defaultTextBreak } from './helpers'

export interface BaseBlockRules {
  blockquote: RegExp
  bullet: RegExp
  code: RegExp
  def: RegExp
  heading: RegExp
  hr: RegExp
  html: RegExp
  lheading: RegExp
  list: RegExp
  newline: RegExp
  paragraph: RegExp
  text: RegExp
  _comment: RegExp
  _label: RegExp
  _title: RegExp
  /**
   * List item (<li>).
   */
  item: RegExp
}

export interface PedanticBlockRules extends BaseBlockRules {}

export interface GfmBlockRules extends BaseBlockRules {
  checkbox: RegExp
  fences: RegExp
  nptable: RegExp
  table: RegExp
}

export interface ExtraBlockRules extends GfmBlockRules {
  footnote: RegExp
}

export type BlockRulesTypes = BaseBlockRules | GfmBlockRules | ExtraBlockRules

export type BlockRulesType = keyof(BlockRulesTypes)

export interface Link {
  href: string
  title: string
}

export interface Links {
  [key: string]: Link
}

export enum TokenType {
  space = 1,
  blockquoteEnd,
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
  table,
  text,
}

export type Align = 'center' | 'left' | 'right'

export interface Token {
  align?: Align[]
  cells?: string[] | string[][]
  depth?: number
  ends?: string
  escaped?: boolean
  execArr?: RegExpExecArray
  header?: string[]
  lang?: string
  loose?: boolean
  ordered?: boolean
  pre?: boolean
  start?: string | number
  text?: string
  type: number | string
  /**
   * GFM
   */
  checked?: boolean | null
  /**
   * Extra
   */
  footnote?: string
  footnotes?: string[]
  refname?: string
}

export interface BaseInlineRules {
  _attribute: RegExp
  _email: RegExp
  _escapes: RegExp
  _href: RegExp
  _label: RegExp
  _scheme: RegExp
  _title: RegExp
  autolink: RegExp
  br: RegExp
  code: RegExp
  em: RegExp
  escape: RegExp
  link: RegExp
  nolink: RegExp
  reflink: RegExp
  strong: RegExp
  tag: RegExp
  text: RegExp
}

export interface PedanticInlineRules extends BaseInlineRules {}

/**
 * GFM Inline Grammar
 */
export interface GfmInlineRules extends BaseInlineRules {
  _backpedal: RegExp
  del: RegExp
  url: RegExp
}

export interface BreaksInlineRules extends GfmInlineRules {}

export interface ExtraInlineRules extends BreaksInlineRules {
  fnref: RegExp
}

export type InlineRulesTypes = BaseInlineRules | PedanticInlineRules | GfmInlineRules | BreaksInlineRules | ExtraInlineRules

export type InlineRulesType = keyof(InlineRulesTypes)

export class Options {
  baseUrl?: string = null
  breaks?: boolean = false
  disabledRules?: string[] = []
  extra?: boolean = false
  gfm?: boolean = true
  headerId?: boolean | string = false
  headerPrefix?: string = ''
  highlight?: (code: string, lang?: string) => string
  langAttribute?: boolean = false
  langPrefix?: string = 'language-'
  linksInNewTab?: boolean | Function = false
  mangle?: boolean = true
  pedantic?: boolean = false
  renderer?: Renderer
  sanitize?: boolean = false
  sanitizer?: (text: string) => string
  silent?: boolean = false
  smartLists?: boolean = false
  smartypants?: boolean = false
  trimLinkText?: Function
  /**
   * Self-close the tags for void elements (&lt;br/&gt;, &lt;img/&gt;, etc.)
   * with a "/" as required by XHTML.
   */
  xhtml?: boolean = false
  /**
   * The function that will be using to escape HTML entities.
   * By default using inner helper.
   */
  escape?: (html: string, encode?: boolean) => string = escape
  /**
   * The function that will be using to unescape HTML entities.
   * By default using inner helper.
   */
  unescape?: (html: string) => string = unescape
  /**
   * The function that will be using to slug string.
   * By default using inner helper.
   */
  slug?: (str: string) => string = slug
  rtrim?: (str: string, c: string, invert?: boolean) => string = rtrim
  /**
   * The function that will be using to render image/link URLs relative to a base url.
   * By default using inner helper.
   */
  resolveUrl?: (base: string, href: string) => string = resolveUrl
  cleanUrl?: (sanitize: boolean, base: string, href: string) => string = cleanUrl
  /**
   * If set to `true`, an inline text will not be taken in paragraph.
   *
   * ```js
   * Smarkdown.parse('some text') // returns '<p>some text</p>'
   *
   * Smarkdown.setOptions({nop: true})
   *
   * Smarkdown.parse('some text') // returns 'some text'
   * ```
   */
  nop?: boolean = false
  /**
   * Break inline text
   * Useful for setting new inline rules
   */
  textBreak?: string = defaultTextBreak
  isTextBreakSync?: boolean = true
}

export interface LexerReturns {
  links: Links
  tokens: Token[]
}

export interface EmptyObject {
  [key: string]: string
}

export interface InlineRulesCallback {
  condition(): RegExp
  regexp?: RegExp
  tokenize(execArr: RegExpExecArray): void
}

export type NewRenderer = (execArr?: RegExpExecArray) => string

export interface BlockRenderer {
  renderer: NewRenderer
  type: string
}

export type InlineRuleOption = {
  checkPreChar?: Function
  priority?: number
}

export type BlockRuleOption = {
  priority?: number
}

export interface InlineRule {
  breakChar: string
  options: InlineRuleOption
  render: Function
  rule: RegExp
}

export interface BlockRule {
  options: BlockRuleOption
  rule: RegExp
  type: string
}