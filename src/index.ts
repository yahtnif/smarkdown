import { BlockLexer } from './block-lexer'
import { isBlockRule } from './helpers'
import { InlineLexer } from './inline-lexer'
import {
  BlockRuleOptions,
  InlineRuleOptions,
  LexerReturns,
  Links,
  NewRenderer,
  Options,
  Token
} from './interfaces'
import { Parser } from './parser'
import { Renderer } from './renderer'

export default class Smarkdown {
  static BlockLexer: typeof BlockLexer = BlockLexer
  static InlineLexer: typeof InlineLexer = InlineLexer
  static options: Options = new Options()
  static Parser: typeof Parser = Parser
  static Renderer: typeof Renderer = Renderer

  static getOptions(options: Options): Options {
    if (!options) {
      return this.options
    }

    if (typeof options.renderer === 'function') {
      options.renderer = new (<typeof Renderer>options.renderer)(this.options)
    }

    return {
      ...this.options,
      ...options
    }
  }

  static setOptions(options: Options) {
    this.options = this.getOptions(options)
  }

  static resetOptions() {
    this.options = new Options()
  }

  protected static resolveRule(regExp: RegExp): RegExp {
    let newRegExp = regExp
    if (!newRegExp.source.startsWith('^')) {
      newRegExp = new RegExp('^' + newRegExp.source)
    }
    return newRegExp
  }

  static setRule(
    regExp: RegExp,
    renderer: NewRenderer,
    options: InlineRuleOptions | BlockRuleOptions = {}
  ) {
    regExp = this.resolveRule(regExp)

    if (isBlockRule(regExp)) {
      BlockLexer.setRule(regExp, renderer, options)
    } else {
      InlineLexer.setRule(regExp, renderer, options)
    }
  }

  static unsetRule(regExp: RegExp) {
    regExp = this.resolveRule(regExp)

    if (isBlockRule(regExp)) {
      BlockLexer.unsetRule(regExp)
    } else {
      InlineLexer.unsetRule(regExp)
    }
  }

  static inlineParse(src: string, options: Options): string {
    return new InlineLexer(InlineLexer, {}, this.getOptions(options)).output(
      src
    )
  }

  static parse(src: string, options?: Options): string {
    try {
      const opts: Options = this.getOptions(options)

      if (opts && opts.sanitize && !opts.silent) {
        console.warn(
          'Smarkdown: sanitize and sanitizer parameters are deprecated since version 0.15.0, should not be used and will be removed in the future. Read more here: https://github.com/yahtnif/smarkdown/blob/master/docs/options.md'
        )
      }

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
    if (typeof src !== 'string') {
      throw new Error(
        `Smarkdown: Expected that the 'src' parameter would have a 'string' type, got '${typeof src}'`
      )
    }

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
    if (BlockLexer.blockRenderers.length) {
      const parser: Parser = new Parser(options)
      parser.blockRenderers = BlockLexer.blockRenderers

      return parser.parse(links, tokens)
    } else {
      return Parser.parse(tokens, links, options)
    }
  }

  protected static callError(err: Error): string {
    if (this.options.silent) {
      return `<p>An error occurred:</p><pre>${this.options.escape(
        err.message + '',
        true
      )}</pre>`
    }

    throw err
  }
}
