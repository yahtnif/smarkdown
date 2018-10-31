import { BlockLexer } from './block-lexer'
import { defaultTextBreak, escapeStringRegexp, getBreakChar, getRuleType } from './helpers'
import { InlineLexer } from './inline-lexer'
import {
  BlockRenderer,
  BlockRuleOption,
  InlineRuleOption,
  LexerReturns,
  Links,
  NewRenderer,
  Options,
  Token
} from './interfaces'
import { Parser } from './parser'
import { Renderer } from './renderer'

export default class Smarkdown {
  static options: Options = new Options()
  static Renderer: typeof Renderer = Renderer
  protected static blockRenderers: BlockRenderer[] = []

  static getOptions(options: Options): Options {
    if (!options) {
      return this.options
    }

    if (typeof options.renderer === 'function') {
      options.renderer = new (<typeof Renderer>options.renderer)(this.options)
    }

    return Object.assign({}, this.options, options)
  }

  static setOptions(options: Options) {
    this.options = this.getOptions(options)
  }

  static resetOptions() {
    this.options = new Options()
  }

  static setInlineRule(
    regExp: RegExp,
    renderer: NewRenderer,
    options: InlineRuleOption = {}
  ) {
    let breakChar: string = getBreakChar(regExp)

    if (breakChar && !this.options.textBreak.includes(breakChar)) {
      breakChar = escapeStringRegexp(breakChar)
      this.options.textBreak += breakChar
      this.options.isTextBreakSync = false
    }

    InlineLexer.newRules.push({
      breakChar,
      options,
      render: renderer,
      rule: regExp
    })
  }

  static unsetInlineRule(regExp: RegExp) {
    InlineLexer.newRules = InlineLexer.newRules.filter(
      (R) => getRuleType(R.rule) !== getRuleType(regExp)
    )

    // Reset textBreak
    const breakchars: string =
      defaultTextBreak +
      InlineLexer.newRules
        .filter((R) => !defaultTextBreak.includes(R.breakChar))
        .map((R) => R.breakChar)
        // remove dulplicate
        .filter((v, i, a) => a.indexOf(v) === i)
        .join('')

    if (this.options.textBreak !== breakchars) {
      this.options.textBreak = breakchars
      this.options.isTextBreakSync = false
    }
  }

  static setBlockRule(
    regExp: RegExp,
    renderer: NewRenderer,
    options: BlockRuleOption = {}
  ) {
    const ruleType: string = getRuleType(regExp)

    BlockLexer.newRules.push({
      options,
      rule: regExp,
      type: ruleType
    })

    this.blockRenderers.push({
      renderer,
      type: ruleType
    })
  }

  static unsetBlockRule(regExp: RegExp) {
    const ruleType: string = getRuleType(regExp)

    BlockLexer.newRules = BlockLexer.newRules.filter((R) => R.type !== ruleType)

    this.blockRenderers = this.blockRenderers.filter((R) => R.type !== ruleType)
  }

  static inlineParse(src: string, options: Options): string {
    return new InlineLexer(InlineLexer, {}, this.getOptions(options)).output(
      src
    )
  }

  static parse(src: string, options: Options): string {
    try {
      const opts: Options = this.getOptions(options)
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
    if (this.blockRenderers.length) {
      const parser: Parser = new Parser(options)
      parser.blockRenderers = this.blockRenderers
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
