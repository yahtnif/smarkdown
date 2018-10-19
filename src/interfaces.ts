import { Renderer } from './renderer'
import { escape, unescape, slug, rtrim, resolveUrl, defaultTextBreak } from './helpers'

export interface RulesBlockBase {
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

export interface RulesBlockPedantic extends RulesBlockBase {}

export interface RulesBlockGfm extends RulesBlockBase {
  checkbox: RegExp
  fences: RegExp
}

export interface RulesBlockTables extends RulesBlockGfm {
  nptable: RegExp
  table: RegExp
}

export interface RulesBlockExtra extends RulesBlockTables {
  footnote: RegExp
}

export type RulesBlockTypes = RulesBlockBase | RulesBlockGfm | RulesBlockTables | RulesBlockExtra

export type RulesBlockType = keyof(RulesBlockTypes)

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
  refname?: string
  footnotes?: string[]
}

export interface RulesInlineBase {
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

export interface RulesInlinePedantic extends RulesInlineBase {}

/**
 * GFM Inline Grammar
 */
export interface RulesInlineGfm extends RulesInlineBase {
  _backpedal: RegExp
  del: RegExp
  url: RegExp
}

export interface RulesInlineBreaks extends RulesInlineGfm {}

export interface RulesInlineExtra extends RulesInlineBreaks {
  fnref: RegExp
}

export type RulesInlineTypes = RulesInlineBase | RulesInlinePedantic | RulesInlineGfm | RulesInlineBreaks | RulesInlineExtra

export type RulesInlineType = keyof(RulesInlineTypes)

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
  tables?: boolean = true
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
  /**
   * If set to `true`, an inline text will not be taken in paragraph.
   *
   * ```js
   * Smarkdown.parse('some text'); // returns '<p>some text</p>'
   *
   * Smarkdown.setOptions({nop: true});
   *
   * Smarkdown.parse('some text'); // returns 'some text'
   * ```
   */
  nop?: boolean = false
  /**
   * Break inline text
   * Useful for set new inline rules
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

export interface RulesInlineCallback {
  condition(): RegExp
  regexp?: RegExp
  tokenize(execArr: RegExpExecArray): void
}

export type NewRenderer = (execArr?: RegExpExecArray) => string

export interface NewRenderers {
  id: string
  renderer: NewRenderer
}

export type InlineRuleOption = {
  checkPreChar?: Function
  priority?: number
}

export type BlockRuleOption = {
  priority?: number
}

export interface InlineRule {
  options: InlineRuleOption
  render: Function
  rule: RegExp
}

export interface BlockRule {
  id: string
  options: BlockRuleOption
  rule: RegExp
}