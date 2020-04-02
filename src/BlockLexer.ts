import { getRuleType, noopRegex } from './helpers';
import {
  Align,
  BaseBlockRules,
  BlockRenderer,
  BlockRuleOptions,
  BlockRule,
  BlockRulesType,
  BlockRulesTypes,
  ExtraBlockRules,
  GfmBlockRules,
  LexerReturns,
  Links,
  NewRenderer,
  Options,
  PedanticBlockRules,
  Token,
  TokenType
} from './Interfaces';
import {
  baseBlockRules,
  pedanticBlockRules,
  gfmBlockRules,
  extraBlockRules
} from './rules';

export class BlockLexer {
  private static baseRules: BaseBlockRules;
  /**
   * Pedantic Block Grammar.
   */
  private static pedanticRules: PedanticBlockRules;
  /**
   * GFM Block Grammar.
   */
  private static gfmRules: GfmBlockRules;
  /**
   * GFM + Extra Block Grammar.
   */
  private static extraRules: ExtraBlockRules;
  private isExtra: boolean;
  private isGfm: boolean;
  private links: Links = Object.create(null);
  private options: Options;
  private rules: BlockRulesTypes;
  private tokens: Token[] = [];
  static blockRenderers: BlockRenderer[] = [];
  static newRules: BlockRule[] = [];

  constructor(protected self: typeof BlockLexer, options?: object) {
    this.options = options;
    this.setRules();
  }

  // Accepts Markdown text and returns object with tokens and links.
  static lex(src: string, options?: Options, top?: boolean): LexerReturns {
    const lexer: BlockLexer = new this(this, options);
    return lexer.getTokens(src, top);
  }

  static setRule(
    regExp: RegExp,
    renderer: NewRenderer,
    options: BlockRuleOptions = {}
  ) {
    const ruleType: string = getRuleType(regExp);

    if (BlockLexer.newRules.some(R => R.type === ruleType)) {
      this.unsetRule(regExp);
    }

    BlockLexer.newRules.push({
      options,
      rule: regExp,
      type: ruleType
    });

    this.blockRenderers.push({
      renderer,
      type: ruleType
    });
  }

  static unsetRule(regExp: RegExp) {
    const ruleType: string = getRuleType(regExp);

    BlockLexer.newRules = BlockLexer.newRules.filter(R => R.type !== ruleType);

    this.blockRenderers = this.blockRenderers.filter(R => R.type !== ruleType);
  }

  private static getBaseRules(): BaseBlockRules {
    if (this.baseRules) return this.baseRules;

    return (this.baseRules = baseBlockRules);
  }

  // Pedantic grammar (original John Gruber's loose markdown specification)
  private static getPedanticRules(): PedanticBlockRules {
    if (this.pedanticRules) return this.pedanticRules;

    return (this.pedanticRules = pedanticBlockRules);
  }

  private static getGfmRules(): GfmBlockRules {
    if (this.gfmRules) return this.gfmRules;

    return (this.gfmRules = gfmBlockRules);
  }

  private static getExtraRules(): ExtraBlockRules {
    if (this.extraRules) return this.extraRules;

    return (this.extraRules = extraBlockRules);
  }

  private setRules() {
    if (this.options.pedantic) {
      this.rules = this.self.getPedanticRules();
    } else if (this.options.extra) {
      this.rules = this.self.getExtraRules();
    } else if (this.options.gfm) {
      this.rules = this.self.getGfmRules();
    } else {
      this.rules = this.self.getBaseRules();
    }

    this.options.disabledRules.forEach((rule: BlockRulesType) => {
      this.rules[rule] = noopRegex;
    });

    this.isGfm = (<GfmBlockRules>this.rules).fences !== undefined;
    this.isExtra = (<ExtraBlockRules>this.rules).footnote !== undefined;
  }

  /**
   * Lexing.
   */
  private getTokens(src: string, top?: boolean): LexerReturns {
    let nextPart: string = src;
    let execArr: RegExpExecArray;
    const newRules: BlockRule[] = this.self.newRules || [];
    const newRulesTop: BlockRule[] = newRules
      .filter(R => R.options.priority)
      .sort((a, b) => b.options.priority - a.options.priority);
    const newRulesBottom: BlockRule[] = newRules.filter(
      R => !R.options.priority
    );

    mainLoop: while (nextPart) {
      // newline
      if ((execArr = this.rules.newline.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);

        if (execArr[0].length > 1) {
          this.tokens.push({
            type: TokenType.space
          });
        }
      }

      // new rules before
      for (const R of newRulesTop) {
        if ((execArr = R.rule.exec(nextPart))) {
          nextPart = nextPart.substring(execArr[0].length);
          this.tokens.push({
            type: R.type,
            execArr: execArr
          });
          continue mainLoop;
        }
      }

      // code
      if ((execArr = this.rules.code.exec(nextPart))) {
        const lastToken = this.tokens[this.tokens.length - 1];
        nextPart = nextPart.substring(execArr[0].length);

        // An indented code block cannot interrupt a paragraph.
        if (lastToken && lastToken.type === 'paragraph') {
          lastToken.text += `\n${execArr[0].trimRight()}`;
        } else {
          const code = execArr[0].replace(/^ {4}/gm, '');
          this.tokens.push({
            type: TokenType.code,
            codeBlockStyle: 'indented',
            text: !this.options.pedantic ? this.options.rtrim(code, '\n') : code
          });
        }
        continue;
      }

      // fences
      if (
        this.isGfm &&
        (execArr = (<GfmBlockRules>this.rules).fences.exec(nextPart))
      ) {
        nextPart = nextPart.substring(execArr[0].length);

        this.tokens.push({
          type: TokenType.code,
          lang: execArr[2] ? execArr[2].trim() : execArr[2],
          text: execArr[3] || ''
        });
        continue;
      }

      // footnote
      if (
        this.isExtra &&
        (execArr = (<ExtraBlockRules>this.rules).footnote.exec(nextPart))
      ) {
        nextPart = nextPart.substring(execArr[0].length);

        const item: Token = {
          type: TokenType.footnote,
          refname: this.options.slug(execArr[1], false),
          text: execArr[2]
        };

        this.tokens.push(item);
        continue;
      }

      // heading
      if ((execArr = this.rules.heading.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);
        this.tokens.push({
          type: TokenType.heading,
          depth: execArr[1].length,
          text: execArr[2],
          ends: execArr[3] || ''
        });
        continue;
      }

      // table no leading pipe (gfm)
      if (
        this.isGfm &&
        (execArr = (<GfmBlockRules>this.rules).nptable.exec(nextPart))
      ) {
        const item: Token = {
          type: TokenType.table,
          header: this.splitCells(execArr[1].replace(/^ *| *\| *$/g, '')),
          align: execArr[2]
            .replace(/^ *|\| *$/g, '')
            .split(/ *\| */) as Align[],
          cells: []
        };

        if (item.header.length === item.align.length) {
          nextPart = nextPart.substring(execArr[0].length);

          for (let i = 0; i < item.align.length; i++) {
            if (/^ *-+: *$/.test(item.align[i])) {
              item.align[i] = 'right';
            } else if (/^ *:-+: *$/.test(item.align[i])) {
              item.align[i] = 'center';
            } else if (/^ *:-+ *$/.test(item.align[i])) {
              item.align[i] = 'left';
            } else {
              item.align[i] = null;
            }
          }

          const cells = execArr[3]
            ? execArr[3].replace(/\n$/, '').split('\n')
            : [];

          for (let i = 0; i < cells.length; i++) {
            item.cells[i] = this.splitCells(cells[i], item.header.length);
          }

          this.tokens.push(item);
          continue;
        }
      }

      // hr
      if ((execArr = this.rules.hr.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);
        this.tokens.push({
          type: TokenType.hr,
          text: execArr[0]
        });
        continue;
      }

      // blockquote
      if ((execArr = this.rules.blockquote.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);
        this.tokens.push({
          type: TokenType.blockquoteStart
        });
        let blockquote: string = execArr[0].replace(/^ *> ?/gm, '');

        // Pass `top` to keep the current
        // "toplevel" state. This is exactly
        // how markdown.pl works.
        this.getTokens(blockquote, top);

        this.tokens.push({
          type: TokenType.blockquoteEnd
        });

        continue;
      }

      // list
      if ((execArr = this.rules.list.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);
        const bull: string = execArr[2];
        const isordered: boolean = bull.length > 1;

        const listStart: Token = {
          type: TokenType.listStart,
          ordered: isordered,
          start: isordered ? +bull : '',
          loose: false
        };

        this.tokens.push(listStart);

        // Get each top-level item.
        const arr: RegExpMatchArray = execArr[0].match(this.rules.item);
        const listItems: Token[] = [];
        const length: number = arr.length;

        let next: boolean = false,
          space: number,
          blockBullet: string,
          loose: boolean,
          item: string,
          checked: boolean | null;

        for (let i = 0; i < length; i++) {
          item = arr[i];
          checked = null;

          // Remove the list item's bullet, so it is seen as the next token.
          space = item.length;
          item = item.replace(/^ *([*+-]|\d+\.) */, '');

          // Check for task list items
          if (
            this.isGfm &&
            (execArr = (<GfmBlockRules>this.rules).checkbox.exec(item))
          ) {
            checked = execArr[1] !== ' ';
            item = item.replace((<GfmBlockRules>this.rules).checkbox, '');
          }

          // Outdent whatever the list item contains. Hacky.
          if (item.indexOf('\n ') !== -1) {
            space -= item.length;
            item = !this.options.pedantic
              ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
              : item.replace(/^ {1,4}/gm, '');
          }

          // Determine whether the next list item belongs here.
          // Backpedal if it does not belong in this list.
          if (i !== length - 1) {
            blockBullet = this.self.getBaseRules().bullet.exec(arr[i + 1])[0];

            if (
              bull.length > 1
                ? blockBullet.length === 1
                : blockBullet.length > 1 ||
                  (this.options.smartLists && blockBullet !== bull)
            ) {
              nextPart = arr.slice(i + 1).join('\n') + nextPart;
              i = length - 1;
            }
          }

          // Determine whether item is loose or not.
          // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
          // for discount behavior.
          loose = next || /\n\n(?!\s*$)/.test(item);

          if (i !== length - 1) {
            next = item.charAt(item.length - 1) === '\n';

            if (!loose) loose = next;
          }

          if (loose) {
            listStart.loose = true;
          }

          const token: Token = {
            loose,
            checked,
            type: TokenType.listItemStart
          };

          listItems.push(token);
          this.tokens.push(token);

          // Recurse.
          this.getTokens(item, false);
          this.tokens.push({
            type: TokenType.listItemEnd
          });
        }

        if (listStart.loose) {
          for (let i = 0; i < listItems.length; i++) {
            listItems[i].loose = true;
          }
        }

        this.tokens.push({
          type: TokenType.listEnd
        });
        continue;
      }

      // html
      if ((execArr = this.rules.html.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);
        const attr: string = execArr[1];
        const isPre: boolean =
          attr === 'pre' || attr === 'script' || attr === 'style';

        this.tokens.push({
          type: this.options.sanitize ? TokenType.paragraph : TokenType.html,
          pre: !this.options.sanitizer && isPre,
          text: this.options.sanitize
            ? this.options.sanitizer
              ? this.options.sanitizer(execArr[0])
              : escape(execArr[0])
            : execArr[0]
        });
        continue;
      }

      // def
      if (top && (execArr = this.rules.def.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);

        const tag: string = execArr[1].toLowerCase().replace(/\s+/g, ' ');

        if (!this.links[tag]) {
          let title: string = execArr[3];

          if (title) {
            title = title.substring(1, title.length - 1);
          }

          this.links[tag] = { title, href: execArr[2] };
        }
        continue;
      }

      // table (gfm)
      if (
        this.isGfm &&
        (execArr = (<GfmBlockRules>this.rules).table.exec(nextPart))
      ) {
        const item: Token = {
          type: TokenType.table,
          header: this.splitCells(execArr[1].replace(/^ *| *\| *$/g, '')),
          align: execArr[2]
            .replace(/^ *|\| *$/g, '')
            .split(/ *\| */) as Align[],
          cells: []
        };

        if (item.header.length === item.align.length) {
          nextPart = nextPart.substring(execArr[0].length);

          for (let i = 0; i < item.align.length; i++) {
            if (/^ *-+: *$/.test(item.align[i])) {
              item.align[i] = 'right';
            } else if (/^ *:-+: *$/.test(item.align[i])) {
              item.align[i] = 'center';
            } else if (/^ *:-+ *$/.test(item.align[i])) {
              item.align[i] = 'left';
            } else {
              item.align[i] = null;
            }
          }

          const cells = execArr[3]
            ? execArr[3].replace(/\n$/, '').split('\n')
            : [];

          for (let i = 0; i < cells.length; i++) {
            item.cells[i] = this.splitCells(
              cells[i].replace(/^ *\| *| *\| *$/g, ''),
              item.header.length
            );
          }

          this.tokens.push(item);
          continue;
        }
      }

      // new rules
      for (const R of newRulesBottom) {
        if ((execArr = R.rule.exec(nextPart))) {
          nextPart = nextPart.substring(execArr[0].length);
          this.tokens.push({
            type: R.type,
            execArr: execArr
          });
          continue mainLoop;
        }
      }

      // lheading
      if ((execArr = this.rules.lheading.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);

        this.tokens.push({
          type: TokenType.heading,
          depth: execArr[2].charAt(0) === '=' ? 1 : 2,
          text: execArr[1]
        });
        continue;
      }

      // top-level paragraph
      if (top && (execArr = this.rules.paragraph.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);

        if (execArr[1].slice(-1) === '\n') {
          this.tokens.push({
            type: TokenType.paragraph,
            text: execArr[1].slice(0, -1)
          });
        } else {
          this.tokens.push({
            type: this.tokens.length > 0 ? TokenType.paragraph : TokenType.text,
            text: execArr[1]
          });
        }
        continue;
      }

      // text
      // Top-level should never reach here.
      if ((execArr = this.rules.text.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);
        this.tokens.push({
          type: TokenType.text,
          text: execArr[0]
        });
        continue;
      }

      if (nextPart) {
        throw new Error(
          `Infinite loop on byte: ${nextPart.charCodeAt(
            0
          )}, near text '${nextPart.slice(0, 30)}...'`
        );
      }
    }

    return { tokens: this.tokens, links: this.links };
  }

  private splitCells(tableRow: string, count?: number): string[] {
    // ensure that every cell-delimiting pipe has a space
    // before it to distinguish it from an escaped pipe
    let row: string = tableRow.replace(/\|/g, function(match, offset, str) {
      let escaped: boolean = false,
        curr: number = offset;

      while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;

      if (escaped) {
        // odd number of slashes means | is escaped
        // so we leave it alone
        return '|';
      } else {
        // add space before unescaped |
        return ' |';
      }
    });
    let cells: string[] = row.split(/ \|/);

    if (cells.length > count) {
      cells.splice(count);
    } else {
      while (cells.length < count) cells.push('');
    }

    for (let i = 0; i < cells.length; i++) {
      // leading or trailing whitespace is ignored per the gfm spec
      cells[i] = cells[i].trim().replace(/\\\|/g, '|');
    }
    return cells;
  }
}
