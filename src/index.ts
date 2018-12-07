import { BlockLexer } from './block-lexer'
import { isBlockRule } from './helpers'
import { InlineLexer } from './inline-lexer'
import {
  BlockRuleOption,
  InlineRuleOption,
  LexerReturns,
  Links,
  NewRenderer,
  Option,
  Token
} from './interfaces'
import { Parser } from './parser'
import { Renderer } from './renderer'

export default class Smarkdown {
  static BlockLexer: typeof BlockLexer = BlockLexer
  static InlineLexer: typeof InlineLexer = InlineLexer
  static option: Option = new Option()
  static Parser: typeof Parser = Parser
  static Renderer: typeof Renderer = Renderer

  static getOption(option: Option): Option {
    if (!option) {
      return this.option
    }

    if (typeof option.renderer === 'function') {
      option.renderer = new (<typeof Renderer>option.renderer)(this.option)
    }

    return {
      ...this.option,
      ...option
    }
  }

  static setOption(option: Option) {
    this.option = this.getOption(option)
  }

  static resetOption() {
    this.option = new Option()
  }

  static setRule(
    regExp: RegExp,
    renderer: NewRenderer,
    option: InlineRuleOption | BlockRuleOption = {}
  ) {
    if (!regExp.source.startsWith('^')) {
      throw new Error(`[setRule] RegExp MUST start with '^', please check: '${regExp.source}'`)
    }

    if (isBlockRule(regExp)) {
      BlockLexer.setRule(regExp, renderer, option)
    } else {
      InlineLexer.setRule(regExp, renderer, option)
    }
  }

  static unsetRule(regExp: RegExp) {
    if (isBlockRule(regExp)) {
      BlockLexer.unsetRule(regExp)
    } else {
      InlineLexer.unsetRule(regExp)
    }
  }

  static inlineParse(src: string, option: Option): string {
    return new InlineLexer(
      InlineLexer,
      {},
      this.getOption(option)
    ).output(src)
  }

  static parse(src: string, option: Option): string {
    try {
      const opts: Option = this.getOption(option)
      const { tokens, links } = this.callBlockLexer(src, opts)

      return this.callParser(tokens, links, opts)
    } catch (e) {
      return this.callError(e)
    }
  }

  protected static callBlockLexer(
    src: string = '',
    option?: Option
  ): LexerReturns {
    if (typeof src !== 'string') {
      throw new Error(`Expected that the 'src' parameter would have a 'string' type, got '${typeof src}'`)
    }

    // Preprocessing.
    src = src
      .replace(/\r\n|\r/g, '\n')
      .replace(/\t/g, '    ')
      .replace(/\u00a0/g, ' ')
      .replace(/\u2424/g, '\n')
      .replace(/^ +$/gm, '')

    return BlockLexer.lex(src, option, true)
  }

  protected static callParser(
    tokens: Token[],
    links: Links,
    option?: Option
  ): string {
    if (BlockLexer.blockRenderers.length) {
      const parser: Parser = new Parser(option)
      parser.blockRenderers = BlockLexer.blockRenderers

      return parser.parse(links, tokens)
    } else {
      return Parser.parse(tokens, links, option)
    }
  }

  protected static callError(err: Error) {
    if (this.option.silent) {
      return `<p>An error occurred:</p><pre>${this.option.escape(err.message + '', true)}</pre>`
    }

    throw err
  }
}
