import { ExtendRegexp, defaultTextBreak } from './helpers'
import { Renderer } from './renderer'
import {
  RulesInlineBase,
  SmarkdownOptions,
  Links,
  Link,
  RulesInlineGfm,
  RulesInlineBreaks,
  RulesInlineExtra,
  RulesInlinePedantic,
  RulesInlineCallback,
  InlineRuleOption
} from './interfaces'

/**
 * Inline Lexer & Compiler.
 */
export class InlineLexer {
  static simpleRules: {
    rule: RegExp
    render: Function
    options: InlineRuleOption
  }[] = []
  protected static rulesBase: RulesInlineBase
  /**
   * Pedantic Inline Grammar.
   */
  protected static rulesPedantic: RulesInlinePedantic
  /**
   * GFM Inline Grammar
   */
  protected static rulesGfm: RulesInlineGfm
  /**
   * GFM + Line Breaks Inline Grammar.
   */
  protected static rulesBreaks: RulesInlineBreaks
  /**
   * GFM + Line Breaks + Extra Inline Grammar.
   */
  protected static rulesExtra: RulesInlineExtra
  protected rules:
    | RulesInlineBase
    | RulesInlinePedantic
    | RulesInlineGfm
    | RulesInlineBreaks
    | RulesInlineExtra
  protected renderer: Renderer
  protected inLink: boolean
  protected isGfm: boolean
  protected isExtra: boolean
  protected ruleCallbacks: RulesInlineCallback[]
  protected textBreak: string = defaultTextBreak

  constructor(
    protected self: typeof InlineLexer,
    protected links: Links = {},
    protected options: SmarkdownOptions,
    renderer?: Renderer
  ) {
    this.renderer = renderer || this.options.renderer || new Renderer(this.options)
    this.renderer.options = this.options

    this.setRules()
  }

  /**
   * Static Lexing/Compiling Method.
   */
  static output(src: string, links: Links, options: SmarkdownOptions): string {
    const inlineLexer = new this(this, links, options)
    return inlineLexer.output(src)
  }

  protected static getRulesBase(): RulesInlineBase {
    if (this.rulesBase) return this.rulesBase

    const tag = '^comment'
      + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
      + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
      + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
      + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
      + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>' // CDATA section
    const regexTag = new RegExp(tag)

    /**
     * Inline-Level Grammar.
     */
    const base: RulesInlineBase = {
      escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
      autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
      tag: regexTag,
      link: /^!?\[(label)\]\(href(?:\s+(title))?\s*\)/,
      reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
      nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
      strong: /^__([^\s])__(?!_)|^\*\*([^\s])\*\*(?!\*)|^__([^\s][\s\S]*?[^\s])__(?!_)|^\*\*([^\s][\s\S]*?[^\s])\*\*(?!\*)/,
      em: /^_([^\s_])_(?!_)|^\*([^\s*"<\[])\*(?!\*)|^_([^\s][\s\S]*?[^\s_])_(?!_)|^_([^\s_][\s\S]*?[^\s])_(?!_)|^\*([^\s"<\[][\s\S]*?[^\s*])\*(?!\*)|^\*([^\s*"<\[][\s\S]*?[^\s])\*(?!\*)/,
      code: /^(`+)\s*([\s\S]*?[^`]?)\s*\1(?!`)/,
      br: /^( {2,}|\\)\n(?!\s*$)/,
      text: /^[\s\S]+?(?=[\\<!\[`*]|\b_| {2,}\n|$)/,
      _scheme: /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/,
      _email: /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/,
      _label: /(?:\[[^\[\]]*\]|\\[\[\]]?|`[^`]*`|[^\[\]\\])*?/,
      _href: /\s*(<(?:\\[<>]?|[^\s<>\\])*>|(?:\\[()]?|\([^\s\x00-\x1f\\]*\)|[^\s\x00-\x1f()\\])*?)/,
      _title: /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/,
      _escapes: /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g,
      _attribute: /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/
    }

    base.autolink = new ExtendRegexp(base.autolink)
      .setGroup('scheme', base._scheme)
      .setGroup('email', base._email)
      .getRegex()

    const comment = /<!--(?!-?>)[\s\S]*?-->/ // block comment

    base.tag = new ExtendRegexp(base.tag)
      .setGroup('comment', comment)
      .setGroup('attribute', base._attribute)
      .getRegex()

    base.link = new ExtendRegexp(base.link)
      .setGroup('label', base._label)
      .setGroup('href', base._href)
      .setGroup('title', base._title)
      .getRegex()

    base.reflink = new ExtendRegexp(base.reflink)
      .setGroup('label', base._label)
      .getRegex()

    return (this.rulesBase = base)
  }

  protected static getRulesPedantic(): RulesInlinePedantic {
    if (this.rulesPedantic) return this.rulesPedantic

    const base = this.getRulesBase()
    const regexLink = new ExtendRegexp(/^!?\[(label)\]\((.*?)\)/)
      .setGroup('label', base._label)
      .getRegex()
    const regexReflink = new ExtendRegexp(/^!?\[(label)\]\s*\[([^\]]*)\]/)
      .setGroup('label', base._label)
      .getRegex()

    return (this.rulesPedantic = {
      ...base,
      ...{
        strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
        em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,
        link: regexLink,
        reflink: regexReflink
      }
    })
  }

  protected static getRulesGfm(): RulesInlineGfm {
    if (this.rulesGfm) return this.rulesGfm

    const base = this.getRulesBase()

    const escape = new ExtendRegexp(base.escape)
      .setGroup('])', '~|])')
      .getRegex()

    const _url = /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/
    const url = new ExtendRegexp(_url)
      .setGroup('email', base._email)
      .getRegex()

    const _backpedal = /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/

    /**
     * [GFM Strikethrough](https://github.github.com/gfm/#strikethrough-extension-)
     * Strikethrough text is any text wrapped in two tildes (~).
     * For now, gfm allow strikethrough text wrapped in single tilde on github, it's conflict with subscript extension.
     * [Single tilde in GFM spec](https://github.com/github/cmark/issues/99)
     */
    const del = /^~~(?=\S)([\s\S]*?\S)~~/

    const text = new ExtendRegexp(base.text)
      .setGroup(']|', '~]|')
      .setGroup(
        '|',
        "|https?://|ftp://|www\\.|[a-zA-Z0-9.!#$%&'*+/=?^_`{\\|}~-]+@|"
      )
      .getRegex()

    return (this.rulesGfm = {
      ...base,
      ...{ escape, url, _backpedal, del, text }
    })
  }

  protected static getRulesBreaks(): RulesInlineBreaks {
    if (this.rulesBreaks) return this.rulesBreaks

    const gfm = this.getRulesGfm()

    return (this.rulesBreaks = {
      ...gfm,
      ...{
        br: new ExtendRegexp(gfm.br).setGroup('{2,}', '*').getRegex(),
        text: new ExtendRegexp(gfm.text).setGroup('{2,}', '*').getRegex()
      }
    })
  }

  protected static getRulesExtra(options: SmarkdownOptions): RulesInlineExtra {
    if (this.rulesExtra) return this.rulesExtra

    const breaks = options.breaks ? this.getRulesBreaks() : <RulesInlineBreaks>{}

    return (this.rulesExtra = {
      ...breaks,
      ...{
        fnref: new ExtendRegexp(/^!?\[\^(label)\]/)
          .setGroup('label', breaks._label)
          .getRegex()
      }
    })
  }

  protected setRules() {
    if (this.options.extra) {
      this.rules = this.self.getRulesExtra(this.options)
    } else if (this.options.pedantic) {
      this.rules = this.self.getRulesPedantic()
    } else if (this.options.gfm) {
      this.rules = this.options.breaks
        ? this.self.getRulesBreaks()
        : this.self.getRulesGfm()
    } else {
      this.rules = this.self.getRulesBase()
    }

    if (!this.options.isTextBreakSync) {
      const textRuleStr = this.rules.text.toString()

      this.rules.text = new RegExp(
        textRuleStr.replace(this.textBreak.slice(4), this.options.textBreak.slice(4)).slice(1, -1)
      )
      this.textBreak = this.options.textBreak
      this.options.isTextBreakSync = true
    }

    this.options.disabledRules.forEach(
      (
        rule: keyof (
          | RulesInlineBase
          | RulesInlinePedantic
          | RulesInlineGfm
          | RulesInlineBreaks
          | RulesInlineExtra)
      ) => {
        ;(<any>this.rules)[rule] = this.options.noop
      }
    )

    this.isGfm = (<RulesInlineGfm>this.rules).url !== undefined
    this.isExtra = (<RulesInlineExtra>this.rules).fnref !== undefined
  }

  protected escapes (text: string) {
    return text ? text.replace(this.rules._escapes, '$1') : text
  }

  /**
   * Lexing/Compiling.
   */
  output(nextPart: string): string {
    nextPart = nextPart
    let execArr: RegExpExecArray
    let out = ''
    const preParts = [nextPart, nextPart]
    const simpleRules = this.self.simpleRules || []
    const simpleRulesBefore = simpleRules.filter(
      (rule) => rule.options.priority
    ).sort((a, b) => b.options.priority - a.options.priority)
    const simpleRulesAfter = simpleRules.filter(
      (rule) => !rule.options.priority
    )

    mainLoop: while (nextPart) {
      // escape
      if ((execArr = this.rules.escape.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        out += execArr[1]
        continue
      }

      // simple rules before
      for (const sr of simpleRulesBefore) {
        if ((execArr = sr.rule.exec(nextPart))) {
          preParts[0] = preParts[1]
          preParts[1] = nextPart
          if (!sr.options.checkPreChar || sr.options.checkPreChar(preParts[0].charAt(preParts[0].length - nextPart.length - 1))) {
            nextPart = nextPart.substring(execArr[0].length)
            out += sr.render.call(this, execArr)
            continue mainLoop
          }
        }
      }

      // autolink
      if ((execArr = this.rules.autolink.exec(nextPart))) {
        let text: string, href: string
        nextPart = nextPart.substring(execArr[0].length)
        if (execArr[2] === '@') {
          text = this.options.escape(this.mangle(execArr[1]))
          href = 'mailto:' + text
        } else {
          text = this.options.escape(execArr[1])
          href = text
        }

        out += this.renderer.link(href, null, text)
        continue
      }

      // url (gfm)
      if (
        !this.inLink &&
        this.isGfm &&
        (execArr = (<RulesInlineGfm>this.rules).url.exec(nextPart))
      ) {
        let text: string, href: string, prevCapZero: string
        do {
          prevCapZero = execArr[0]
          execArr[0] = (<RulesInlineGfm>this.rules)._backpedal.exec(execArr[0])[0]
        } while (prevCapZero !== execArr[0])
        nextPart = nextPart.substring(execArr[0].length)
        text = this.options.escape(execArr[0])
        if (execArr[2] === '@') {
          href = 'mailto:' + text
        } else {
          if (execArr[1] === 'www.') {
            href = 'http://' + text
          } else {
            href = text
          }
        }
        out += this.renderer.link(href, null, text)
        continue
      }

      // tag
      if ((execArr = this.rules.tag.exec(nextPart))) {
        if (!this.inLink && /^<a /i.test(execArr[0])) {
          this.inLink = true
        } else if (this.inLink && /^<\/a>/i.test(execArr[0])) {
          this.inLink = false
        }

        nextPart = nextPart.substring(execArr[0].length)

        out += this.options.sanitize
          ? this.options.sanitizer
            ? this.options.sanitizer.call(this, execArr[0])
            : this.options.escape(execArr[0])
          : execArr[0]
        continue
      }

      // link
      if ((execArr = this.rules.link.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        this.inLink = true

        let href = execArr[2]
        let title

        if (this.options.pedantic) {
          const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href)

          if (link) {
            href = link[1]
            title = link[3]
          } else {
            title = ''
          }
        } else {
          title = execArr[3] ? execArr[3].slice(1, -1) : ''
        }
        href = href.trim().replace(/^<([\s\S]*)>$/, '$1');

        out += this.outputLink(execArr, {
          href: this.escapes(href),
          title: this.escapes(title)
        })

        this.inLink = false
        continue
      }

      // fnref
      if (
        this.isExtra &&
        (execArr = (<RulesInlineExtra>this.rules).fnref.exec(nextPart))
      ) {
        nextPart = nextPart.substring(execArr[0].length)
        out += this.renderer.fnref(this.options.slug(execArr[1]))
        continue
      }

      // reflink, nolink
      if (
        (execArr = this.rules.reflink.exec(nextPart)) ||
        (execArr = this.rules.nolink.exec(nextPart))
      ) {
        nextPart = nextPart.substring(execArr[0].length)
        const keyLink = (execArr[2] || execArr[1]).replace(/\s+/g, ' ')
        const link = this.links[keyLink.toLowerCase()]

        if (!link || !link.href) {
          out += execArr[0].charAt(0)
          nextPart = execArr[0].substring(1) + nextPart
          continue
        }

        this.inLink = true
        out += this.outputLink(execArr, link)
        this.inLink = false
        continue
      }

      // strong
      if ((execArr = this.rules.strong.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        out += this.renderer.strong(this.output(execArr[4] || execArr[3] || execArr[2] || execArr[1]))
        continue
      }

      // em
      if ((execArr = this.rules.em.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        out += this.renderer.em(this.output(execArr[6] || execArr[5] || execArr[4] || execArr[3] || execArr[2] || execArr[1]))
        continue
      }

      // code
      if ((execArr = this.rules.code.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        out += this.renderer.codespan(
          this.options.escape(execArr[2].trim(), true)
        )
        continue
      }

      // br
      if ((execArr = this.rules.br.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        out += this.renderer.br()
        continue
      }

      // del (gfm)
      if (
        this.isGfm &&
        (execArr = (<RulesInlineGfm>this.rules).del.exec(nextPart))
      ) {
        nextPart = nextPart.substring(execArr[0].length)
        out += this.renderer.del(this.output(execArr[1]))
        continue
      }

      // simple rules after
      for (const sr of simpleRulesAfter) {
        if ((execArr = sr.rule.exec(nextPart))) {
          preParts[0] = preParts[1]
          preParts[1] = nextPart
          if (!sr.options.checkPreChar || sr.options.checkPreChar(preParts[0].charAt(preParts[0].length - nextPart.length - 1))) {
            nextPart = nextPart.substring(execArr[0].length)
            out += sr.render.call(this, execArr)
            continue mainLoop
          }
        }
      }

      // text
      if ((execArr = this.rules.text.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length)
        out += this.renderer.text(
          this.options.escape(this.smartypants(execArr[0]))
        )
        continue
      }

      if (nextPart)
        throw new Error('Infinite loop on byte: ' + nextPart.charCodeAt(0))
    }

    return out
  }

  /**
   * Compile Link.
   */
  protected outputLink(execArr: RegExpExecArray, link: Link) {
    const href = link.href
    const title = link.title ? this.options.escape(link.title) : null

    return execArr[0].charAt(0) !== '!'
      ? this.renderer.link(href, title, this.output(execArr[1]))
      : this.renderer.image(href, title, this.options.escape(execArr[1]))
  }

  /**
   * Smartypants Transformations.
   */
  protected smartypants(text: string) {
    if (!this.options.smartypants) return text

    return (
      text
        // em-dashes
        .replace(/---/g, '\u2014')
        // en-dashes
        .replace(/--/g, '\u2013')
        // opening singles
        .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
        // closing singles & apostrophes
        .replace(/'/g, '\u2019')
        // opening doubles
        .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
        // closing doubles
        .replace(/"/g, '\u201d')
        // ellipses
        .replace(/\.{3}/g, '\u2026')
    )
  }

  /**
   * Mangle Links.
   */
  protected mangle(text: string) {
    if (!this.options.mangle) return text

    let out = ''
    let length = text.length
    for (let i = 0; i < length; i++) {
      let ch: string | number = text.charCodeAt(i)

      if (Math.random() > 0.5) {
        ch = 'x' + ch.toString(16)
      }

      out += '&#' + ch + ';'
    }

    return out
  }
}
