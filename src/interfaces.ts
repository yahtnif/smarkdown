import { Renderer } from './renderer'
import { escape, unescape, slug, resolveUrl, noop } from './helpers'

export interface RulesBlockBase {
  newline: RegExp
  code: RegExp
  hr: RegExp
  heading: RegExp
  lheading: RegExp
  blockquote: RegExp
  list: RegExp
  html: RegExp
  def: RegExp
  paragraph: RegExp
  text: RegExp
  bullet: RegExp
  /**
   * List item (<li>).
   */
  item: RegExp
  _label: RegExp
  _title: RegExp
  _comment: RegExp
}

export interface RulesBlockPedantic extends RulesBlockBase {}

export interface RulesBlockGfm extends RulesBlockBase {
  fences: RegExp
  checkbox: RegExp
}

export interface RulesBlockTables extends RulesBlockGfm {
  nptable: RegExp
  table: RegExp
}

export interface RulesBlockExtra extends RulesBlockTables {
  footnote: RegExp
}

export interface Link {
  href: string
  title: string
}

export interface Links {
  [key: string]: Link
}

export enum TokenType {
  space = 1,
  text,
  paragraph,
  heading,
  listStart,
  listEnd,
  looseItemStart,
  looseItemEnd,
  listItemStart,
  listItemEnd,
  blockquoteStart,
  blockquoteEnd,
  code,
  table,
  html,
  hr,
  footnote
}

export type Align = 'center' | 'left' | 'right'

export interface Token {
  type: number | string
  text?: string
  lang?: string
  depth?: number
  header?: string[]
  align?: Align[]
  cells?: string[][]
  ordered?: boolean
  pre?: boolean
  escaped?: boolean
  execArr?: RegExpExecArray
  ends?: string
  start?: string | number
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
  escape: RegExp
  autolink: RegExp
  tag: RegExp
  link: RegExp
  reflink: RegExp
  nolink: RegExp
  strong: RegExp
  em: RegExp
  code: RegExp
  br: RegExp
  text: RegExp
  _scheme: RegExp
  _email: RegExp
  _label: RegExp
  _href: RegExp
  _title: RegExp
  _escapes: RegExp
  _attribute: RegExp
}

export interface RulesInlinePedantic extends RulesInlineBase {}

/**
 * GFM Inline Grammar
 */
export interface RulesInlineGfm extends RulesInlineBase {
  url: RegExp
  del: RegExp
  _backpedal: RegExp
}

export interface RulesInlineBreaks extends RulesInlineGfm {}

export interface RulesInlineExtra extends RulesInlineBreaks {
  fnref: RegExp
}

export class SmarkdownOptions {
  gfm?: boolean = true
  tables?: boolean = true
  extra?: boolean = false
  breaks?: boolean = false
  taskList?: boolean
  pedantic?: boolean = false
  sanitize?: boolean = false
  sanitizer?: (text: string) => string
  mangle?: boolean = true
  smartLists?: boolean = false
  silent?: boolean = false
  baseUrl?: string = null
  linksInNewTab?: boolean | Function = false
  trimLinkText?: Function
  disabledRules?: string[] = []
  /**
   * @param code The section of code to pass to the highlighter.
   * @param lang The programming language specified in the code block.
   */
  highlight?: (code: string, lang?: string) => string
  langPrefix?: string = 'language-'
  langAttribute?: boolean = false
  smartypants?: boolean = false
  headerId?: boolean | string = false
  headerPrefix?: string = ''
  /**
   * An object containing functions to render tokens to HTML. Default: `new Renderer()`
   */
  renderer?: Renderer
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
  /**
   * The RegExp that will be using to make RegExp.exec as noop.
   * By default using inner helper.
   */
  noop?: Function = noop
  /**
   * The function that will be using to render image/link URLs relative to a base url.
   * By default using inner helper.
   */
  resolveUrl?: (base: string, href: string) => string = resolveUrl
  /**
   * If set to `true`, an inline text will not be taken in paragraph.
   *
   * ```ts
   * // isNoP == false
   * Smarkdown.parse('some text'); // returns '<p>some text</p>'
   *
   * Smarkdown.setOptions({isNoP: true});
   *
   * Smarkdown.parse('some text'); // returns 'some text'
   * ```
   */
  isNoP?: boolean
  /**
   * Split by chars inline
   * Default: \<![`*~
   * Append new chars to default split chars
   * Useful for set new inline rules
   */
  inlineSplitChars?: string
}

export interface LexerReturns {
  tokens: Token[]
  links: Links
}

export interface Replacements {
  [key: string]: string
}

export interface RulesInlineCallback {
  condition(): RegExp
  tokenize(execArr: RegExpExecArray): void
  regexp?: RegExp
}

export type SimpleRenderer = (execArr?: RegExpExecArray) => string

export type InlineRuleOption = {
  priority?: string
  checkPreChar?: Function
}
