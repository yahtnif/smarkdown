import { ExtendRegexp } from './helpers'
import {
  Align,
  LexerReturns,
  Links,
  RulesBlockBase,
  RulesBlockExtra,
  RulesBlockGfm,
  RulesBlockPedantic,
  RulesBlockTables,
  SimpleBlockRules,
  SmarkdownOptions,
  Token,
  TokenType,
} from './interfaces'

export class BlockLexer<T extends typeof BlockLexer> {
  static simpleRules: SimpleBlockRules[] = []
  protected static rulesBase: RulesBlockBase
  /**
   * Pedantic Block Grammar.
   */
  protected static rulesPedantic: RulesBlockPedantic
  /**
   * GFM Block Grammar.
   */
  protected static rulesGfm: RulesBlockGfm
  /**
   * GFM + Tables Block Grammar.
   */
  protected static rulesTables: RulesBlockTables
  /**
   * GFM + Tables + Extra Block Grammar.
   */
  protected static rulesExtra: RulesBlockExtra

  protected isExtra: boolean
  protected isGfm: boolean
  protected isTable: boolean
  protected links: Links = Object.create(null)
  protected options: SmarkdownOptions
  protected rules:
    | RulesBlockBase
    | RulesBlockGfm
    | RulesBlockTables
    | RulesBlockExtra
  protected tokens: Token[] = []

  constructor(protected self: typeof BlockLexer, options?: object) {
    this.options = options
    this.setRules()
  }

  /**
   * Accepts Markdown text and returns object with tokens and links.
   *
   * @param src String of markdown source to be compiled.
   * @param options Hash of options.
   */
  static lex(
    src: string,
    options?: SmarkdownOptions,
    top?: boolean
  ): LexerReturns {
    const lexer = new this(this, options)
    return lexer.getTokens(src, top)
  }

  protected static getRulesBase(): RulesBlockBase {
    if (this.rulesBase) return this.rulesBase

    const html =
      '^ {0,3}(?:' + // optional indentation
      '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' + // (1)
      '|comment[^\\n]*(\\n+|$)' + // (2)
      '|<\\?[\\s\\S]*?\\?>\\n*' + // (3)
      '|<![A-Z][\\s\\S]*?>\\n*' + // (4)
      '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' + // (5)
      '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' + // (6)
      '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=\\h*\\n)[\\s\\S]*?(?:\\n{2,}|$)' + // (7) open tag
      '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=\\h*\\n)[\\s\\S]*?(?:\\n{2,}|$)' + // (7) closing tag
      ')'

    const htmlRegex = new RegExp(html)

    const base: RulesBlockBase = {
      newline: /^\n+/,
      code: /^( {4}[^\n]+\n*)+/,
      hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
      heading: /^ *(#{1,6}) *([^\n]+?) *(#+ *)?(?:\n+|$)/,
      blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
      list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
      html: htmlRegex,
      def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
      lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
      paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading| {0,3}>|<\/?(?:tag)(?: +|\n|\/?>)|<(?:script|pre|style|!--))[^\n]+)*)/,
      text: /^[^\n]+/,
      bullet: /(?:[*+-]|\d+\.)/,
      item: /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/,
      _label: /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/,
      _title: /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/,
      _comment: /<!--(?!-?>)[\s\S]*?-->/
    }

    base.def = new ExtendRegexp(base.def)
      .setGroup('label', base._label)
      .setGroup('title', base._title)
      .getRegex()

    base.item = new ExtendRegexp(base.item, 'gm')
      .setGroup(/bull/g, base.bullet)
      .getRegex()

    base.list = new ExtendRegexp(base.list)
      .setGroup(/bull/g, base.bullet)
      .setGroup(
        'hr',
        '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))'
      )
      .setGroup('def', '\\n+(?=' + base.def.source + ')')
      .getRegex()

    const tag =
      'address|article|aside|base|basefont|blockquote|body|caption' +
      '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption' +
      '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe' +
      '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option' +
      '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr' +
      '|track|ul'
    const attribute = / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/

    base.html = new ExtendRegexp(base.html, 'i')
      .setGroup('comment', base._comment)
      .setGroup('tag', tag)
      .setGroup('attribute', attribute)
      .getRegex()

    base.paragraph = new ExtendRegexp(base.paragraph)
      .setGroup('hr', base.hr)
      .setGroup('heading', base.heading)
      .setGroup('lheading', base.lheading)
      .setGroup('tag', tag) // pars can be interrupted by type (6) html blocks
      .getRegex()

    base.blockquote = new ExtendRegexp(base.blockquote)
      .setGroup('paragraph', base.paragraph)
      .getRegex()

    return (this.rulesBase = base)
  }

  protected static getRulesPedantic(): RulesBlockPedantic {
    if (this.rulesPedantic) return this.rulesPedantic

    const base = this.getRulesBase()

    const html =
      '^ *(?:comment *(?:\\n|\\s*$)' +
      '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' + // closed tag
      '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))'
    const tag =
      '(?!(?:' +
      'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub' +
      '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)' +
      '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b'
    const regexHtml = new ExtendRegexp(new RegExp(html))
      .setGroup('comment', base._comment)
      .setGroup(/tag/g, tag)
      .getRegex()

    const pedantic: RulesBlockPedantic = {
      ...base,
      ...{
        html: regexHtml,
        def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/
      }
    }

    return (this.rulesPedantic = pedantic)
  }

  protected static getRulesGfm(): RulesBlockGfm {
    if (this.rulesGfm) return this.rulesGfm

    const base = this.getRulesBase()

    const gfm: RulesBlockGfm = {
      ...base,
      ...{
        fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\n? *\1 *(?:\n+|$)/,
        checkbox: /^\[([ xX])\] +/,
        paragraph: /^/,
        heading: /^ *(#{1,6}) +([^\n]+?) *(#*) *(?:\n+|$)/
      }
    }

    const group1 = gfm.fences.source.replace('\\1', '\\2')
    const group2 = base.list.source.replace('\\1', '\\3')

    gfm.paragraph = new ExtendRegexp(base.paragraph)
      .setGroup('(?!', `(?!${group1}|${group2}|`)
      .getRegex()

    return (this.rulesGfm = gfm)
  }

  protected static getRulesTable(): RulesBlockTables {
    if (this.rulesTables) return this.rulesTables

    return (this.rulesTables = {
      ...this.getRulesGfm(),
      ...{
        nptable: /^ *([^|\n ].*\|.*)\n *([-:]+ *\|[-| :]*)(?:\n((?:.*[^>\n ].*(?:\n|$))*)\n*|$)/,
        table: /^ *\|(.+)\n *\|?( *[-:]+[-| :]*)(?:\n((?: *[^>\n ].*(?:\n|$))*)\n*|$)/
      }
    })
  }

  protected static getRulesExtra(): RulesBlockExtra {
    if (this.rulesExtra) return this.rulesExtra

    const table = this.getRulesTable()

    table.paragraph = new ExtendRegexp(table.paragraph)
      .setGroup(
        'footnote',
        /^\[\^([^\]]+)\]: *([^\n]*(?:\n+|$)(?: {1,}[^\n]*(?:\n+|$))*)/
      )
      .getRegex()

    return (this.rulesExtra = {
      ...table,
      footnote: /^\[\^([^\]]+)\]: ([^\n]+)/
    })
  }

  protected setRules() {
    if (this.options.extra) {
      this.rules = this.self.getRulesExtra()
    } else if (this.options.pedantic) {
      this.rules = this.self.getRulesPedantic()
    } else if (this.options.gfm) {
      if (this.options.tables) {
        this.rules = this.self.getRulesTable()
      } else {
        this.rules = this.self.getRulesGfm()
      }
    } else {
      this.rules = this.self.getRulesBase()
    }

    this.options.disabledRules.forEach(
      (
        rule: keyof (
          | RulesBlockBase
          | RulesBlockGfm
          | RulesBlockTables
          | RulesBlockExtra)
      ) => {
        ;(<any>this.rules)[rule] = this.options.noop
      }
    )

    this.isGfm = (<RulesBlockGfm>this.rules).fences !== undefined
    this.isTable = (<RulesBlockTables>this.rules).table !== undefined
    this.isExtra = (<RulesBlockExtra>this.rules).footnote !== undefined
  }

  /**
   * Lexing.
   */
  protected getTokens(src: string, top?: boolean): LexerReturns {
    let nextPart = src
    let execArr: RegExpExecArray
    const simpleRules = this.self.simpleRules || []
    const simpleRulesBefore = simpleRules.filter(
      (rule) => rule.options.priority
    ).sort((a, b) => b.options.priority - a.options.priority)
    const simpleRulesAfter = simpleRules.filter(
      (rule) => !rule.options.priority
    )

    mainLoop: while (nextPart) {
      // newline
      if ((execArr = this.rules.newline.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)

        if (execArr[0].length > 1) {
          this.tokens.push({
            type: TokenType.space
          })
        }
      }

      // simple rules before
      for (const sr of simpleRulesBefore) {
        if ((execArr = sr.rule.exec(nextPart))) {
          nextPart = nextPart.substring(execArr[0].length)
          this.tokens.push({
            type: sr.id,
            execArr: execArr
          })
          continue mainLoop
        }
      }

      // code
      if ((execArr = this.rules.code.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        const code = execArr[0].replace(/^ {4}/gm, '')

        this.tokens.push({
          type: TokenType.code,
          text: !this.options.pedantic ? this.options.rtrim(code, '\n') : code
        })
        continue
      }

      // fences code (gfm)
      if (
        this.isGfm &&
        (execArr = (<RulesBlockGfm>this.rules).fences.exec(nextPart))
      ) {
        nextPart = nextPart.substring(execArr[0].length)

        this.tokens.push({
          type: TokenType.code,
          lang: execArr[2],
          text: execArr[3] || ''
        })
        continue
      }

      // footnote
      if (
        this.isExtra &&
        (execArr = (<RulesBlockExtra>this.rules).footnote.exec(nextPart))
      ) {
        nextPart = nextPart.substring(execArr[0].length)

        const item: Token = {
          type: TokenType.footnote,
          refname: this.options.slug(execArr[1]),
          text: execArr[2]
        }

        this.tokens.push(item)
        continue
      }

      // heading
      if ((execArr = this.rules.heading.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        this.tokens.push({
          type: TokenType.heading,
          depth: execArr[1].length,
          text: execArr[2],
          ends: execArr[3] || ''
        })
        continue
      }

      // table no leading pipe (gfm)
      if (
        top &&
        this.isTable &&
        (execArr = (<RulesBlockTables>this.rules).nptable.exec(nextPart))
      ) {
        const item: Token = {
          type: TokenType.table,
          header: this.splitCells(execArr[1].replace(/^ *| *\| *$/g, '')),
          align: execArr[2]
            .replace(/^ *|\| *$/g, '')
            .split(/ *\| */) as Align[],
          cells: execArr[3]
            ? <any>execArr[3].replace(/\n$/, '').split('\n')
            : []
        }

        if (item.header.length === item.align.length) {
          nextPart = nextPart.substring(execArr[0].length)

          for (let i = 0; i < item.align.length; i++) {
            if (/^ *-+: *$/.test(item.align[i])) {
              item.align[i] = 'right'
            } else if (/^ *:-+: *$/.test(item.align[i])) {
              item.align[i] = 'center'
            } else if (/^ *:-+ *$/.test(item.align[i])) {
              item.align[i] = 'left'
            } else {
              item.align[i] = null
            }
          }

          let td: string[] = execArr[3].replace(/\n$/, '').split('\n')

          for (let i = 0; i < td.length; i++) {
            item.cells[i] = this.splitCells(td[i], item.header.length)
          }

          this.tokens.push(item)
          continue
        }
      }

      // hr
      if ((execArr = this.rules.hr.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        this.tokens.push({
          type: TokenType.hr
        })
        continue
      }

      // blockquote
      if ((execArr = this.rules.blockquote.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        this.tokens.push({
          type: TokenType.blockquoteStart
        })
        const str = execArr[0].replace(/^ *> ?/gm, '')

        // Pass `top` to keep the current
        // "toplevel" state. This is exactly
        // how markdown.pl works.
        this.getTokens(str)
        this.tokens.push({
          type: TokenType.blockquoteEnd
        })
        continue
      }

      // list
      if ((execArr = this.rules.list.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        const bull: string = execArr[2]
        const isordered = bull.length > 1

        const listStart = {
          type: TokenType.listStart,
          ordered: isordered,
          start: isordered ? +bull : '',
          loose: false
        }

        this.tokens.push(listStart)

        // Get each top-level item.
        const str = execArr[0].match(this.rules.item)
        const listItems = []
        const length = str.length

        let next: boolean = false,
          space: number,
          blockBullet: string,
          loose: boolean

        for (let i = 0; i < length; i++) {
          let item = str[i]
          let checked: boolean | null = null

          // Remove the list item's bullet, so it is seen as the next token.
          space = item.length
          item = item.replace(/^ *([*+-]|\d+\.) +/, '')

          // Check for task list items
          if (
            this.isGfm &&
            (execArr = (<RulesBlockGfm>this.rules).checkbox.exec(item))
          ) {
            checked = execArr[1] !== ' '
            item = item.replace((<RulesBlockGfm>this.rules).checkbox, '')
          }

          // Outdent whatever the list item contains. Hacky.
          if (item.indexOf('\n ') !== -1) {
            space -= item.length
            item = !this.options.pedantic
              ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
              : item.replace(/^ {1,4}/gm, '')
          }

          // Determine whether the next list item belongs here.
          // Backpedal if it does not belong in this list.
          if (this.options.smartLists && i !== length - 1) {
            blockBullet = this.self
              .getRulesBase()
              .bullet.exec(str[i + 1])[0]

            if (
              bull !== blockBullet &&
              !(bull.length > 1 && blockBullet.length > 1)
            ) {
              nextPart = str.slice(i + 1).join('\n') + nextPart
              i = length - 1
            }
          }

          // Determine whether item is loose or not.
          // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
          // for discount behavior.
          loose = next || /\n\n(?!\s*$)/.test(item)

          if (i !== length - 1) {
            next = item.charAt(item.length - 1) === '\n'

            if (!loose) loose = next
          }

          if (loose) {
            listStart.loose = true
          }

          const t = {
            loose,
            checked,
            type: TokenType.listItemStart
          }

          listItems.push(t)
          this.tokens.push(t)

          // Recurse.
          this.getTokens(item, false)
          this.tokens.push({
            type: TokenType.listItemEnd
          })
        }

        if (listStart.loose) {
          const l = listItems.length
          let i = 0
          for (; i < l; i++) {
            listItems[i].loose = true
          }
        }

        this.tokens.push({
          type: TokenType.listEnd
        })
        continue
      }

      // html
      if ((execArr = this.rules.html.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        const attr = execArr[1]
        const isPre = attr === 'pre' || attr === 'script' || attr === 'style'

        this.tokens.push({
          type: this.options.sanitize ? TokenType.paragraph : TokenType.html,
          pre: !this.options.sanitizer && isPre,
          text: execArr[0]
        })
        continue
      }

      // def
      if (top && (execArr = this.rules.def.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)

        const tag = execArr[1].toLowerCase().replace(/\s+/g, ' ')

        if (!this.links[tag]) {
          let title = execArr[3]

          if (title) {
            title = title.substring(1, title.length - 1)
          }

          this.links[tag] = { title, href: execArr[2] }
        }
        continue
      }

      // table (gfm)
      if (
        top &&
        this.isTable &&
        (execArr = (<RulesBlockTables>this.rules).table.exec(nextPart))
      ) {
        const item: Token = {
          type: TokenType.table,
          header: this.splitCells(execArr[1].replace(/^ *| *\| *$/g, '')),
          align: execArr[2]
            .replace(/^ *|\| *$/g, '')
            .split(/ *\| */) as Align[],
          cells: execArr[3]
            ? <any>execArr[3].replace(/(?: *\| *)?\n$/, '').split('\n')
            : []
        }

        if (item.header.length === item.align.length) {
          nextPart = nextPart.substring(execArr[0].length)

          for (let i = 0; i < item.align.length; i++) {
            if (/^ *-+: *$/.test(item.align[i])) {
              item.align[i] = 'right'
            } else if (/^ *:-+: *$/.test(item.align[i])) {
              item.align[i] = 'center'
            } else if (/^ *:-+ *$/.test(item.align[i])) {
              item.align[i] = 'left'
            } else {
              item.align[i] = null
            }
          }

          const td = execArr[3].replace(/(?: *\| *)?\n$/, '').split('\n')

          for (let i = 0; i < td.length; i++) {
            item.cells[i] = this.splitCells(
              td[i].replace(/^ *\| *| *\| *$/g, ''),
              item.header.length
            )
          }

          this.tokens.push(item)
          continue
        }
      }

      // simple rules
      for (const sr of simpleRulesAfter) {
        if ((execArr = sr.rule.exec(nextPart))) {
          nextPart = nextPart.substring(execArr[0].length)
          this.tokens.push({
            type: sr.id,
            execArr: execArr
          })
          continue mainLoop
        }
      }

      // lheading
      if ((execArr = this.rules.lheading.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)

        this.tokens.push({
          type: TokenType.heading,
          depth: execArr[2] === '=' ? 1 : 2,
          text: execArr[1]
        })
        continue
      }

      // top-level paragraph
      if (top && (execArr = this.rules.paragraph.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)

        if (execArr[1].slice(-1) === '\n') {
          this.tokens.push({
            type: TokenType.paragraph,
            text: execArr[1].slice(0, -1)
          })
        } else {
          this.tokens.push({
            type: this.tokens.length > 0 ? TokenType.paragraph : TokenType.text,
            text: execArr[1]
          })
        }
        continue
      }

      // text
      // Top-level should never reach here.
      if ((execArr = this.rules.text.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        this.tokens.push({
          type: TokenType.text,
          text: execArr[0]
        })
        continue
      }

      if (nextPart) {
        throw new Error(
          'Infinite loop on byte: ' +
            nextPart.charCodeAt(0) +
            `, near text '${nextPart.slice(0, 30)}...'`
        )
      }
    }

    return { tokens: this.tokens, links: this.links }
  }

  protected splitCells(tableRow: string, count?: number) {
    // ensure that every cell-delimiting pipe has a space
    // before it to distinguish it from an escaped pipe
    let row = tableRow.replace(/\|/g, function(match, offset, str) {
        let escaped = false,
          curr = offset
        while (--curr >= 0 && str[curr] === '\\') escaped = !escaped
        if (escaped) {
          // odd number of slashes means | is escaped
          // so we leave it alone
          return '|'
        } else {
          // add space before unescaped |
          return ' |'
        }
      }),
      cells = row.split(/ \|/),
      i = 0

    if (cells.length > count) {
      cells.splice(count)
    } else {
      while (cells.length < count) cells.push('')
    }

    for (; i < cells.length; i++) {
      // leading or trailing whitespace is ignored per the gfm spec
      cells[i] = cells[i].trim().replace(/\\\|/g, '|')
    }
    return cells
  }
}
