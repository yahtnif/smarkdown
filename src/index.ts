import { Parser } from './parser'
import { Renderer } from './renderer'
import { InlineLexer } from './inline-lexer'
import { BlockLexer } from './block-lexer'
import {
  BlockRenderer,
  BlockRuleOption,
  InlineRuleOption,
  LexerReturns,
  Links,
  NewRenderer,
  Options,
  Token,
} from './interfaces'

export default class Smarkdown {
  static options = new Options()
  static Renderer = Renderer
  protected static ruleCounter = 0
  protected static newRenderers: BlockRenderer[] = []

  static getOptions(options: Options) {
    if (!options) {
      return this.options
    }

    if (typeof options.renderer === 'function') {
      options.renderer = new (<typeof Renderer>options.renderer)(this.options)
    }

    return Object.assign({}, this.options, options)
  }

  /**
   * Merges the default options with options that will be set.
   *
   * @param options Hash of options.
   */
  static setOptions(options: Options) {
    this.options = this.getOptions(options)
    return this
  }

  /**
   * Setting new inline rule.
   */
  static setInlineRule(
    regExp: RegExp,
    renderer: NewRenderer,
    options: InlineRuleOption = {}
  ) {
    const breakChar = regExp.toString().match(/^\/\^\(*\\?(.)/)[1]

    if (breakChar && !this.options.textBreak.includes(breakChar)) {
      this.options.textBreak += breakChar
      this.options.isTextBreakSync = false
    }

    InlineLexer.newRules.push({
      rule: regExp,
      render: renderer,
      options
    })

    return this
  }

  /**
   * Setting new block rule.
   */
  static setBlockRule(
    regExp: RegExp,
    renderer: NewRenderer,
    options: BlockRuleOption = {}
  ) {
    const id = 'SRule-' + (++this.ruleCounter)

    BlockLexer.newRules.push({
      rule: regExp,
      options,
      id
    })

    this.newRenderers.push({
      renderer,
      id
    })
    return this
  }

  /**
   * Accepts Markdown text and returns text in HTML format.
   *
   * @param src String of markdown source to be compiled.
   * @param options Hash of options, merge with the default options.
   */
  static inlineParse(
    src: string,
    options: Options
  ): string {
    return new InlineLexer(InlineLexer, {}, this.getOptions(options)).output(src)
  }

  /**
   * Accepts Markdown text and returns text in HTML format.
   *
   * @param src String of markdown source to be compiled.
   * @param options Hash of options, merge with the default options.
   */
  static parse(src: string, options: Options): string {
    try {
      const opts = this.getOptions(options)
      const { tokens, links } = this.callBlockLexer(src, opts)
      return this.callParser(tokens, links, opts)
    } catch (e) {
      return this.callError(e)
    }
  }

  protected static callBlockLexer(
    src: string = '',
    options?: Options
  ): LexerReturns {
    if (typeof src != 'string')
      throw new Error(
        `Expected that the 'src' parameter would have a 'string' type, got '${typeof src}'`
      )

    // Preprocessing.
    src = src
      .replace(/\r\n|\r/g, '\n')
      .replace(/\t/g, '    ')
      .replace(/\u00a0/g, ' ')
      .replace(/\u2424/g, '\n')
      .replace(/^ +$/gm, '')

    return BlockLexer.lex(src, options, true)
  }

  protected static callParser(
    tokens: Token[],
    links: Links,
    options?: Options
  ): string {
    if (this.newRenderers.length) {
      const parser = new Parser(options)
      parser.newRenderers = this.newRenderers
      return parser.parse(links, tokens)
    } else {
      return Parser.parse(tokens, links, options)
    }
  }

  protected static callError(err: Error) {
    if (this.options.silent) {
      return (
        '<p>An error occurred:</p><pre>' +
        this.options.escape(err.message + '', true) +
        '</pre>'
      )
    }

    throw err
  }
}
