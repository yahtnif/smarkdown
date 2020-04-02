import { getBreakChar, getRuleType, noopRegex } from './helpers';
import {
  BaseInlineRules,
  BreaksInlineRules,
  ExtraInlineRules,
  GfmInlineRules,
  InlineRule,
  InlineRuleOptions,
  InlineRulesType,
  InlineRulesTypes,
  Link,
  Links,
  NewRenderer,
  Options,
  PedanticInlineRules
} from './Interfaces';
import { Renderer } from './Renderer';
import {
  baseInlineRules,
  pedanticInlineRules,
  gfmInlineRules,
  breaksInlineRules,
  extraInlineRules
} from './rules';

/**
 * Inline Lexer & Compiler.
 */
export class InlineLexer {
  private static baseRules: BaseInlineRules;
  /**
   * Pedantic Inline Grammar.
   */
  private static pedanticRules: PedanticInlineRules;
  /**
   * GFM Inline Grammar
   */
  private static gfmRules: GfmInlineRules;
  /**
   * GFM + Line Breaks Inline Grammar.
   */
  private static breaksRules: BreaksInlineRules;
  /**
   * GFM + Extra Inline Grammar.
   */
  private static extraRules: ExtraInlineRules;
  private inLink: boolean;
  private inRawBlock: boolean;
  private isExtra: boolean;
  private isGfm: boolean;
  private renderer: Renderer;
  private rules: InlineRulesTypes;
  private defaultTextBreak: string;
  static isTextBreakSync: boolean = true;
  static newRules: InlineRule[] = [];

  constructor(
    protected self: typeof InlineLexer,
    protected links: Links = {},
    protected options: Options,
    renderer?: Renderer
  ) {
    this.renderer =
      renderer || this.options.renderer || new Renderer(this.options);
    this.renderer.options = this.options;

    this.setRules();
  }

  /**
   * Static Lexing/Compiling Method.
   */
  static output(src: string, links: Links, options: Options): string {
    const inlineLexer: InlineLexer = new this(this, links, options);
    return inlineLexer.output(src);
  }

  static setRule(
    regExp: RegExp,
    renderer: NewRenderer,
    options: InlineRuleOptions = {}
  ) {
    const ruleType: string = getRuleType(regExp);

    if (this.newRules.some(R => R.type !== ruleType)) {
      this.unsetRule(regExp);
    }

    this.newRules.push({
      breakChar: getBreakChar(regExp),
      options,
      render: renderer,
      rule: regExp,
      type: ruleType
    });

    this.isTextBreakSync = false;
  }

  static unsetRule(regExp: RegExp) {
    const ruleType: string = getRuleType(regExp);

    InlineLexer.newRules = InlineLexer.newRules.filter(
      R => R.type !== ruleType
    );

    this.isTextBreakSync = false;
  }

  private static getBaseRules(): BaseInlineRules {
    if (this.baseRules) return this.baseRules;

    return (this.baseRules = baseInlineRules);
  }

  private static getPedanticRules(): PedanticInlineRules {
    if (this.pedanticRules) return this.pedanticRules;

    return (this.pedanticRules = pedanticInlineRules);
  }

  private static getGfmRules(): GfmInlineRules {
    if (this.gfmRules) return this.gfmRules;

    return (this.gfmRules = gfmInlineRules);
  }

  private static getBreaksRules(): BreaksInlineRules {
    if (this.breaksRules) return this.breaksRules;

    return (this.breaksRules = breaksInlineRules);
  }

  private static getExtraRules(options: Options): ExtraInlineRules {
    if (this.extraRules) return this.extraRules;

    const rules: BreaksInlineRules | GfmInlineRules = options.breaks
      ? this.getBreaksRules()
      : this.getGfmRules();

    return (this.extraRules = {
      ...rules,
      ...extraInlineRules
    });
  }

  private setRules() {
    if (this.options.pedantic) {
      this.rules = this.self.getPedanticRules();
    } else if (this.options.extra) {
      this.rules = this.self.getExtraRules(this.options);
    } else if (this.options.gfm) {
      this.rules = this.options.breaks
        ? this.self.getBreaksRules()
        : this.self.getGfmRules();
    } else {
      this.rules = this.self.getBaseRules();
    }

    if (!this.self.isTextBreakSync) {
      const textRuleStr: string = this.rules.text.source;

      if (!this.defaultTextBreak) {
        this.defaultTextBreak = textRuleStr.match(/\?=\[(.+?)\]/)[1];
      }

      const textBreak: string =
        this.defaultTextBreak +
        InlineLexer.newRules
          .filter(R => this.defaultTextBreak.indexOf(R.breakChar) === -1)
          .map(R => R.breakChar)
          // remove dulplicate
          .filter((v, i, a) => a.indexOf(v) === i)
          .join('');
      this.rules.text = new RegExp(
        textRuleStr.replace(this.defaultTextBreak, textBreak)
      );
    }

    this.options.disabledRules.forEach((rule: InlineRulesType) => {
      this.rules[rule] = noopRegex;
    });

    this.isGfm = (<GfmInlineRules>this.rules).url !== undefined;
    this.isExtra = (<ExtraInlineRules>this.rules).fnref !== undefined;
  }

  private escapes(text: string) {
    return text ? text.replace(this.rules._escapes, '$1') : text;
  }

  private findClosingBracket(str: string, b: string): number {
    if (str.indexOf(b[1]) === -1) {
      return -1;
    }
    let level = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '\\') {
        i++;
      } else if (str[i] === b[0]) {
        level++;
      } else if (str[i] === b[1]) {
        level--;
        if (level < 0) {
          return i;
        }
      }
    }
    return -1;
  }

  private sortByPriority = (a: InlineRule, b: InlineRule) =>
    b.options.priority - a.options.priority;

  /**
   * Lexing/Compiling.
   */
  output(nextPart: string): string {
    let execArr: RegExpExecArray;
    let out: string = '';
    const preParts: string[] = [nextPart, nextPart];
    const newRules: InlineRule[] =
      this.self.newRules.sort(this.sortByPriority) || [];
    const newRulesTop: InlineRule[] = [];
    const newRulesBottom: InlineRule[] = [];

    for (const R of newRules) {
      if (R.options.priority) {
        newRulesTop.push(R);
      } else {
        newRulesBottom.push(R);
      }
    }

    mainLoop: while (nextPart) {
      // escape
      if ((execArr = this.rules.escape.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);
        out += this.options.escape(execArr[1]);
        continue;
      }

      // new rules before
      for (const R of newRulesTop) {
        if ((execArr = R.rule.exec(nextPart))) {
          preParts[0] = preParts[1];
          preParts[1] = nextPart;
          if (
            !R.options.checkPreChar ||
            R.options.checkPreChar(
              preParts[0].charAt(preParts[0].length - nextPart.length - 1)
            )
          ) {
            nextPart = nextPart.substring(execArr[0].length);
            out += R.render.call(this, execArr);
            continue mainLoop;
          }
        }
      }

      // tag
      if ((execArr = this.rules.tag.exec(nextPart))) {
        if (!this.inLink && /^<a /i.test(execArr[0])) {
          this.inLink = true;
        } else if (this.inLink && /^<\/a>/i.test(execArr[0])) {
          this.inLink = false;
        }

        if (
          !this.inRawBlock &&
          /^<(pre|code|kbd|script)(\s|>)/i.test(execArr[0])
        ) {
          this.inRawBlock = true;
        } else if (
          this.inRawBlock &&
          /^<\/(pre|code|kbd|script)(\s|>)/i.test(execArr[0])
        ) {
          this.inRawBlock = false;
        }

        nextPart = nextPart.substring(execArr[0].length);

        out += this.options.sanitize
          ? this.options.sanitizer
            ? this.options.sanitizer.call(this, execArr[0])
            : this.options.escape(execArr[0])
          : execArr[0];
        continue;
      }

      // link
      if ((execArr = this.rules.link.exec(nextPart))) {
        const lastParenIndex = this.findClosingBracket(execArr[2], '()');
        if (lastParenIndex > -1) {
          const start = execArr[0].indexOf('!') === 0 ? 5 : 4;
          const linkLen = start + execArr[1].length + lastParenIndex;
          execArr[2] = execArr[2].substring(0, lastParenIndex);
          execArr[0] = execArr[0].substring(0, linkLen).trim();
          execArr[3] = '';
        }

        nextPart = nextPart.substring(execArr[0].length);
        this.inLink = true;

        let href = execArr[2];
        let title;

        if (this.options.pedantic) {
          const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

          if (link) {
            href = link[1];
            title = link[3];
          } else {
            title = '';
          }
        } else {
          title = execArr[3] ? execArr[3].slice(1, -1) : '';
        }
        href = href.trim().replace(/^<([\s\S]*)>$/, '$1');

        out += this.outputLink(execArr, {
          href: this.escapes(href),
          title: this.escapes(title)
        });

        this.inLink = false;
        continue;
      }

      // fnref
      if (
        this.isExtra &&
        (execArr = (<ExtraInlineRules>this.rules).fnref.exec(nextPart))
      ) {
        nextPart = nextPart.substring(execArr[0].length);
        out += this.renderer.fnref(this.options.slug(execArr[1]));
        continue;
      }

      // reflink, nolink
      if (
        (execArr = this.rules.reflink.exec(nextPart)) ||
        (execArr = this.rules.nolink.exec(nextPart))
      ) {
        nextPart = nextPart.substring(execArr[0].length);
        const keyLink: string = (execArr[2] || execArr[1]).replace(/\s+/g, ' ');
        const link: Link = this.links[keyLink.toLowerCase()];

        if (!link || !link.href) {
          out += execArr[0].charAt(0);
          nextPart = execArr[0].substring(1) + nextPart;
          continue;
        }

        this.inLink = true;
        out += this.outputLink(execArr, link);
        this.inLink = false;
        continue;
      }

      // strong
      if ((execArr = this.rules.strong.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);
        out += this.renderer.strong(
          this.output(execArr[4] || execArr[3] || execArr[2] || execArr[1])
        );
        continue;
      }

      // em
      if ((execArr = this.rules.em.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);
        out += this.renderer.em(
          this.output(
            execArr[6] ||
              execArr[5] ||
              execArr[4] ||
              execArr[3] ||
              execArr[2] ||
              execArr[1]
          )
        );
        continue;
      }

      // code
      if ((execArr = this.rules.code.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);
        out += this.renderer.codespan(
          this.options.escape(execArr[2].trim(), true)
        );
        continue;
      }

      // br
      if ((execArr = this.rules.br.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);
        out += this.renderer.br();
        continue;
      }

      // del (gfm)
      if (
        this.isGfm &&
        (execArr = (<GfmInlineRules>this.rules).del.exec(nextPart))
      ) {
        nextPart = nextPart.substring(execArr[0].length);
        out += this.renderer.del(this.output(execArr[1]));
        continue;
      }

      // autolink
      if ((execArr = this.rules.autolink.exec(nextPart))) {
        let text: string, href: string;
        nextPart = nextPart.substring(execArr[0].length);
        if (execArr[2] === '@') {
          text = this.options.escape(this.mangle(execArr[1]));
          href = 'mailto:' + text;
        } else {
          text = this.options.escape(execArr[1]);
          href = text;
        }

        out += this.renderer.link(href, null, text);
        continue;
      }

      // url (gfm)
      if (
        !this.inLink &&
        this.isGfm &&
        (execArr = (<GfmInlineRules>this.rules).url.exec(nextPart))
      ) {
        let text: string, href: string, prevCapZero: string;

        if (execArr[2] === '@') {
          text = this.options.escape(execArr[0]);
          href = 'mailto:' + text;
        } else {
          // do extended autolink path validation
          do {
            prevCapZero = execArr[0];
            execArr[0] = (<GfmInlineRules>this.rules)._backpedal.exec(
              execArr[0]
            )[0];
          } while (prevCapZero !== execArr[0]);

          text = this.options.escape(execArr[0]);

          if (execArr[1] === 'www.') {
            href = 'http://' + text;
          } else {
            href = text;
          }
        }

        nextPart = nextPart.substring(execArr[0].length);
        out += this.renderer.link(href, null, text);

        continue;
      }

      // new rules after
      for (const R of newRulesBottom) {
        if ((execArr = R.rule.exec(nextPart))) {
          preParts[0] = preParts[1];
          preParts[1] = nextPart;
          if (
            !R.options.checkPreChar ||
            R.options.checkPreChar(
              preParts[0].charAt(preParts[0].length - nextPart.length - 1)
            )
          ) {
            nextPart = nextPart.substring(execArr[0].length);
            out += R.render.call(this, execArr);
            continue mainLoop;
          }
        }
      }

      // text
      if ((execArr = this.rules.text.exec(nextPart))) {
        nextPart = nextPart.substring(execArr[0].length);

        if (this.inRawBlock) {
          out += this.renderer.text(
            this.options.sanitize
              ? this.options.sanitizer
                ? this.options.sanitizer(execArr[0])
                : escape(execArr[0])
              : execArr[0]
          );
        } else {
          out += this.renderer.text(
            this.options.escape(this.smartypants(execArr[0]))
          );
        }

        continue;
      }

      if (nextPart) {
        throw new Error('Infinite loop on byte: ' + nextPart.charCodeAt(0));
      }
    }

    return out;
  }

  /**
   * Compile Link.
   */
  private outputLink(execArr: RegExpExecArray, link: Link) {
    const href: string = link.href;
    const title: string | null = link.title
      ? this.options.escape(link.title)
      : null;

    return execArr[0].charAt(0) !== '!'
      ? this.renderer.link(href, title, this.output(execArr[1]))
      : this.renderer.image(href, title, this.options.escape(execArr[1]));
  }

  /**
   * Smartypants Transformations.
   */
  private smartypants(text: string) {
    if (!this.options.smartypants) return text;

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
    );
  }

  /**
   * Mangle Links.
   */
  private mangle(text: string) {
    if (!this.options.mangle) return text;

    let out: string = '';
    for (let i = 0; i < text.length; i++) {
      let ch: string | number = text.charCodeAt(i);

      if (Math.random() > 0.5) {
        ch = 'x' + ch.toString(16);
      }

      out += '&#' + ch + ';';
    }

    return out;
  }
}
