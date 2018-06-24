import { Parser } from './parser'
import { InlineLexer } from './inline-lexer'
import { BlockLexer } from './block-lexer'
import {
  SmarkdownOptions,
  Token,
  Links,
  TokenType,
  LexerReturns,
  SimpleRenderer,
  InlineRuleOption,
  DebugReturns
} from './interfaces'

export class Smarkdown {
  static options = new SmarkdownOptions()
  protected static simpleRenderers: SimpleRenderer[] = []

  /**
   * Merges the default options with options that will be set.
   *
   * @param options Hash of options.
   */
  static setOptions(options: SmarkdownOptions) {
    if (typeof options.renderer === 'function') {
      options.renderer = new (<any>options.renderer)(this.options)
    }

    Object.assign(this.options, options)
    return this
  }

  /**
   * Setting simple block rule.
   */
  static setBlockRule(regexp: RegExp, renderer: SimpleRenderer = () => '') {
    BlockLexer.simpleRules.push(regexp)
    this.simpleRenderers.push(renderer)
    return this
  }

  /**
   * Setting simple inline rule.
   */
  static setInlineRule(
    regexp: RegExp,
    renderer: SimpleRenderer,
    options: InlineRuleOption = {}
  ) {
    InlineLexer.simpleRules.push({
      rule: regexp,
      render: renderer,
      options
    })

    return this
  }

  /**
   * Accepts Markdown text and returns text in HTML format.
   *
   * @param src String of markdown source to be compiled.
   * @param options Hash of options. They replace, but do not merge with the default options.
   * If you want the merging, you can to do this via `Smarkdown.setOptions()`.
   */
  static inlineParse(
    src: string,
    options: SmarkdownOptions = this.options
  ): string {
    return new InlineLexer(InlineLexer, {}, options).output(src)
  }

  /**
   * Accepts Markdown text and returns text in HTML format.
   *
   * @param src String of markdown source to be compiled.
   * @param options Hash of options. They replace, but do not merge with the default options.
   * If you want the merging, you can to do this via `Smarkdown.setOptions()`.
   */
  static parse(src: string, options: SmarkdownOptions = this.options): string {
    try {
      const { tokens, links } = this.callBlockLexer(src, options)
      return this.callParser(tokens, links, options)
    } catch (e) {
      return this.callMe(e)
    }
  }

  protected static callBlockLexer(
    src: string = '',
    options?: SmarkdownOptions
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
    options?: SmarkdownOptions
  ): string {
    if (this.simpleRenderers.length) {
      const parser = new Parser(options)
      parser.simpleRenderers = this.simpleRenderers
      return parser.parse(links, tokens)
    } else {
      return Parser.parse(tokens, links, options)
    }
  }

  protected static callMe(err: Error) {
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
