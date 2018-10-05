import { Renderer, TextRenderer } from './renderer'
import { InlineLexer } from './inline-lexer'
import {
  Links,
  SimpleRenderer,
  SimpleRenderers,
  SmarkdownOptions,
  Token,
  TokenType,
} from './interfaces'

/**
 * Parsing & Compiling.
 */
export class Parser {
  protected footnotes: { [key: string]: string }
  protected inlineLexer: InlineLexer
  protected inlineTextLexer: InlineLexer
  protected line: number = 0
  protected options: SmarkdownOptions
  protected renderer: Renderer
  protected textRenderer: TextRenderer
  protected token: Token
  protected tokens: Token[]
  simpleRenderers: SimpleRenderers[] = []

  constructor(options?: SmarkdownOptions) {
    this.tokens = []
    this.token = null
    this.footnotes = {}
    this.options = options
    this.renderer = this.options.renderer || new Renderer(this.options)
    this.renderer.options = this.options
  }

  static parse(tokens: Token[], links: Links, options?: SmarkdownOptions): string {
    const parser = new this(options)
    return parser.parse(links, tokens)
  }

  parse(links: Links, tokens: Token[]) {
    this.inlineLexer = new InlineLexer(
      InlineLexer,
      links,
      this.options,
      this.renderer
    )
    this.inlineTextLexer = new InlineLexer(
      InlineLexer,
      links,
      Object.assign({}, this.options, {
        renderer: new TextRenderer()
      })
    )
    this.tokens = tokens.reverse()

    let out = ''

    while (this.next()) {
      out += this.tok()
    }

    if (Object.keys(this.footnotes).length) {
      out += this.renderer.footnote(this.footnotes)
      this.footnotes = {}
    }

    // Remove cached
    this.renderer._headings = []

    return out
  }

  protected next() {
    return (this.token = this.tokens.pop())
  }

  protected getNextElement() {
    return this.tokens[this.tokens.length - 1]
  }

  protected parseText() {
    let body = this.token.text
    let nextElement: Token

    while (
      (nextElement = this.getNextElement()) &&
      nextElement.type == TokenType.text
    ) {
      body += '\n' + this.next().text
    }

    return this.inlineLexer.output(body)
  }

  protected tok() {
    switch (this.token.type) {
      case TokenType.space: {
        return ''
      }
      case TokenType.paragraph: {
        return this.renderer.paragraph(this.inlineLexer.output(this.token.text))
      }
      case TokenType.text: {
        if (this.options.nop) return this.parseText()
        else return this.renderer.paragraph(this.parseText())
      }
      case TokenType.heading: {
        return this.renderer.heading(
          this.inlineLexer.output(this.token.text),
          this.token.depth,
          this.options.unescape(this.inlineTextLexer.output(this.token.text)),
          this.token.ends
        )
      }
      case TokenType.listStart: {
        let body = '',
          ordered = this.token.ordered,
          start = this.token.start,
          isTaskList = false

        while (this.next().type != TokenType.listEnd) {
          if (this.token.checked !== null) {
            isTaskList = true
          }

          body += this.tok()
        }

        return this.renderer.list(body, ordered, start, isTaskList)
      }
      case TokenType.listItemStart: {
        let body = ''
        const loose = this.token.loose
        const checked = this.token.checked

        while (this.next().type != TokenType.listItemEnd) {
          body += !loose && this.token.type === <any>TokenType.text
            ? this.parseText()
            : this.tok()
        }

        return this.renderer.listitem(body, checked)
      }
      case TokenType.footnote: {
        this.footnotes[this.token.refname] = this.inlineLexer.output(
          this.token.text
        )
        return ''
      }
      case TokenType.code: {
        return this.renderer.code(
          this.token.text,
          this.token.lang,
          this.token.escaped
        )
      }
      case TokenType.table: {
        let header = '',
          body = '',
          row,
          cell

        // header
        cell = ''
        for (let i = 0; i < this.token.header.length; i++) {
          const flags = { header: true, align: this.token.align[i] }
          const out = this.inlineLexer.output(this.token.header[i])

          cell += this.renderer.tablecell(out, flags)
        }

        header += this.renderer.tablerow(cell)

        for (let i = 0; i < this.token.cells.length; i++) {
          row = this.token.cells[i]

          cell = ''

          for (let j = 0; j < row.length; j++) {
            cell += this.renderer.tablecell(this.inlineLexer.output(row[j]), {
              header: false,
              align: this.token.align[j]
            })
          }

          body += this.renderer.tablerow(cell)
        }

        return this.renderer.table(header, body)
      }
      case TokenType.blockquoteStart: {
        let body = ''

        while (this.next().type != TokenType.blockquoteEnd) {
          body += this.tok()
        }

        return this.renderer.blockquote(body)
      }
      case TokenType.hr: {
        return this.renderer.hr()
      }
      case TokenType.html: {
        // TODO parse inline content if parameter markdown=1
        return this.renderer.html(this.token.text);
      }
      default: {
        for (const sr of this.simpleRenderers) {
          if (this.token.type === sr.id) {
            return sr.renderer.call(
              this.renderer,
              this.token.execArr
            )
          }
        }

        const errMsg = `Token with "${this.token.type}" type was not found.`

        if (this.options.silent) {
          console.log(errMsg)
        } else {
          throw new Error(errMsg)
        }
      }
    }
  }
}
