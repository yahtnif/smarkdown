import { InlineLexer } from './InlineLexer';
import {
  BlockRenderer,
  EmptyObject,
  Links,
  Options,
  TablecellFlags,
  Token,
  TokenType
} from './Interfaces';
import { Renderer, TextRenderer } from './Renderer';

/**
 * Parsing & Compiling.
 */
export class Parser {
  private footnotes: EmptyObject = {};
  private inlineLexer: InlineLexer;
  private inlineTextLexer: InlineLexer;
  private options: Options;
  private renderer: Renderer;
  private textOptions: Options;
  private token: Token;
  private tokens: Token[];
  blockRenderers: BlockRenderer[] = [];

  constructor(options?: Options) {
    this.tokens = [];
    this.token = null;
    this.options = options;
    this.renderer = this.options.renderer || new Renderer(this.options);
    this.renderer.options = this.options;
    this.textOptions = Object.assign({}, this.options, {
      renderer: new TextRenderer()
    });
  }

  /**
   * Parse Loop
   */
  static parse(tokens: Token[], links: Links, options?: Options): string {
    const parser: Parser = new this(options);
    return parser.parse(links, tokens);
  }

  parse(links: Links, tokens: Token[]): string {
    this.inlineLexer = new InlineLexer(
      InlineLexer,
      links,
      this.options,
      this.renderer
    );
    this.inlineTextLexer = new InlineLexer(
      InlineLexer,
      links,
      this.textOptions
    );
    this.tokens = tokens.reverse();

    let out: string = '';

    while (this.next()) {
      out += this.tok();
    }

    if (Object.keys(this.footnotes).length) {
      out += this.renderer.footnote(this.footnotes);
      this.footnotes = {};
    }

    // Remove cached
    this.renderer._headings = [];

    return out;
  }

  /**
   * Next Token
   */
  protected next(): Token {
    this.token = this.tokens.pop();
    return this.token;
  }

  /**
   * Preview Next Token
   */
  protected peek(): Token {
    return this.tokens[this.tokens.length - 1] || { type: '' };
  }

  /**
   * Parse Text Tokens
   */
  protected parseText(): string {
    let body: string = this.token.text;

    while (this.peek().type === TokenType.text) {
      body += '\n' + this.next().text;
    }

    return this.inlineLexer.output(body);
  }

  /**
   * Parse Current Token
   */
  protected tok(): string {
    switch (this.token.type) {
      case TokenType.space: {
        return '';
      }
      case TokenType.paragraph: {
        return this.renderer.paragraph(
          this.inlineLexer.output(this.token.text)
        );
      }
      case TokenType.text: {
        return this.options.nop
          ? this.parseText()
          : this.renderer.paragraph(this.parseText());
      }
      case TokenType.heading: {
        return this.renderer.heading(
          this.inlineLexer.output(this.token.text),
          this.token.depth,
          this.options.unescape(this.inlineTextLexer.output(this.token.text)),
          this.token.ends
        );
      }
      case TokenType.listStart: {
        let body: string = '',
          ordered: boolean = this.token.ordered,
          start: string | number = this.token.start,
          isTaskList: boolean = false;

        while (this.next().type !== TokenType.listEnd) {
          if (this.token.checked !== null) {
            isTaskList = true;
          }

          body += this.tok();
        }

        return this.renderer.list(body, ordered, start, isTaskList);
      }
      case TokenType.listItemStart: {
        let body: string = '';
        const loose: boolean = this.token.loose;
        const checked: boolean = this.token.checked;
        const isTaskList: boolean = checked !== null;

        if (isTaskList && loose) {
          const nextToken = this.peek();
          if (nextToken.type === TokenType.text) {
            nextToken.text = this.inlineLexer.output(nextToken.text);
            nextToken.type = TokenType.raw;
          }
        }

        while (this.next().type !== TokenType.listItemEnd) {
          body +=
            !loose && this.token.type === <number>TokenType.text
              ? this.parseText()
              : this.tok();
        }

        return this.renderer.listitem(body, checked);
      }
      case TokenType.footnote: {
        this.footnotes[this.token.refname] = this.inlineLexer.output(
          this.token.text
        );
        return '';
      }
      case TokenType.code: {
        return this.renderer.code(
          this.token.text,
          this.token.lang,
          this.token.escaped
        );
      }
      case TokenType.table: {
        let header: string = '',
          body: string = '',
          cell: string = '',
          row: string | string[];

        // header
        for (let i = 0; i < this.token.header.length; i++) {
          const flags: TablecellFlags = {
            header: true,
            align: this.token.align[i]
          };
          const out: string = this.inlineLexer.output(this.token.header[i]);

          cell += this.renderer.tablecell(out, flags);
        }

        header += this.renderer.tablerow(cell);

        for (let i = 0; i < this.token.cells.length; i++) {
          row = this.token.cells[i];

          cell = '';

          for (let j = 0; j < row.length; j++) {
            cell += this.renderer.tablecell(this.inlineLexer.output(row[j]), {
              header: false,
              align: this.token.align[j]
            });
          }

          body += this.renderer.tablerow(cell);
        }

        return this.renderer.table(header, body);
      }
      case TokenType.blockquoteStart: {
        let body: string = '';

        let nextToken: Token;
        while (
          (nextToken = this.next()) &&
          nextToken.type !== TokenType.blockquoteEnd
        ) {
          body += this.tok();
        }
        return this.renderer.blockquote(body);
      }
      case TokenType.hr: {
        return this.renderer.hr(this.token.text);
      }
      case TokenType.html: {
        // TODO parse inline content if parameter markdown=1
        return this.renderer.html(this.token.text);
      }
      case TokenType.raw: {
        return this.token.text;
      }
      default: {
        for (const sr of this.blockRenderers) {
          if (this.token.type === sr.type) {
            return sr.renderer.call(this.renderer, this.token.execArr);
          }
        }

        const errMsg: string = `Smarkdown: token with "${this.token.type}" type was not found.`;

        if (this.options.silent) {
          console.log(errMsg);
        } else {
          throw new Error(errMsg);
        }
      }
    }
  }
}
