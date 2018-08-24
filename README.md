# Smarkdown

> Markdown parser, simple and powerful.

This is fork of [marked](https://github.com/markedjs/marked) and [marked-ts](https://github.com/KostyaTretyak/marked-ts).

## Size Comparison

| | Smarkdown | Marked | markdown-it |
| - | - | - | - |
| Uncompressed | 76.6 KB | 38.8 KB | 258.5 KB |
| Minified | 30.1 KB | 21.5 KB | 106.3 KB |
| Minified & Gzipped | 9.34 KB | 7.18 KB | 34 KB |

## Table of contents

* [Install](#install)
* [Usage](#usage)
  * [Minimal usage](#minimal-usage)
  * [Example usage with highlight.js](#example-usage-with-highlightjs)
  * [Overriding renderer methods](#overriding-renderer-methods)
  * [Example of setting a simple inline rule](#example-of-setting-a-simple-inline-rule)
  * [Example of setting a simple block rule](#example-of-setting-a-simple-block-rule)
* [API](#api)
  * [Methods of Smarkdown class and necessary types](#methods-of-marked-class-and-necessary-types)
  * [Renderer methods API](#renderer-methods-api)
* [License](#license)

## Install

```bash
npm install smarkdown --save
```

or

```bash
yarn add smarkdown
```

## Usage

### Minimal usage:

```js
import { Smarkdown } from 'smarkdown'

console.log(Smarkdown.parse('I am using __markdown__.'))
// Outputs: I am using <strong>markdown</strong>.
```

Example setting options with default values:

```js
import { Smarkdown, Renderer } from 'smarkdown'

Smarkdown.setOptions({
  renderer: Renderer,
  gfm: true,
  tables: true,
  breaks: false,
  extra: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  baseUrl: null,
  linksInNewTab: false,
  disabledRules: []
})

console.log(Smarkdown.parse('I am using __markdown__.'))
```

### Example usage with highlight.js

A function to highlight code blocks:

````js
import { Smarkdown } from 'smarkdown'
import { highlight } from 'highlight.js'

Smarkdown.setOptions({
  highlight: (code, lang) => {
    return lang && highlight.getLanguage(lang)
      ? highlight.highlight(lang, code).value
      : highlight.highlightAuto(code).value
  }
})
let md = '```js\n console.log("hello"); \n```'
console.log(Smarkdown.parse(md))
````

### Overriding renderer methods

The renderer option allows you to render tokens in a custom manner. Here is an
example of overriding the default heading token rendering by adding custom head id:

```js
import { Smarkdown, Renderer } from 'smarkdown'

class MyRenderer extends Renderer {
  // Overriding parent method.
  heading(text, level, raw) {
    const regexp = /\s*{([^}]+)}$/
    const execArr = regexp.exec(text)
    let id

    if (execArr) {
      text = text.replace(regexp, '')
      id = execArr[1]
    } else {
      id = text.toLocaleLowerCase().replace(/[^\wа-яіїє]+/gi, '-')
    }

    return `<h${level} id="${id}">${text}</h${level}>`
  }
}

Smarkdown.setOptions({ renderer: MyRenderer })

console.log(Smarkdown.parse('# heading {my-custom-hash}'))
```

This code will output the following HTML:

```html
<h1 id="my-custom-hash">heading</h1>
```

See also [Renderer methods API](#renderer-methods-api).

### Example of setting a simple inline rule

If you do not need recursiveness or checks some conditions before execute a regular expression, you can use the
`Smarkdown.setInlineRule( regexp[, callback] )` method, which takes a regular expression as the first argument,
and returns result `regexp.exec(string)` to `callback(execArr)`, which can be passed as a second argument.

In regular expression very important adding symbol `^` from start. You should do this anyway.

Works with `inlineSplitChars` option.

```js
import { Smarkdown } from 'smarkdown'

Smarkdown.setOptions({
  inlineSplitChars: '=^'
})

const regSub = /^~(?=\S)([\s\S]*?\S)~/
Smarkdown.setInlineRule(regSub, function(execArr) {
  return `<sub>${this.output(execArr[1])}</sub>`
})

const regSup = /^\^(?=\S)([\s\S]*?\S)\^/
Smarkdown.setInlineRule(regSup, function(execArr) {
  return `<sup>${this.output(execArr[1])}</sup>`
})

const regMark = /^==(?=\S)([\s\S]*?\S)==/
Smarkdown.setInlineRule(regMark, function(execArr) {
  return `<mark>${this.output(execArr[1])}</mark>`
})
```

### Example of setting a simple block rule

If you do not need recursiveness or checks some conditions before execute a regular expression, you can use the
`Smarkdown.setBlockRule( regexp[, callback] )` method, which takes a regular expression as the first argument,
and returns result `regexp.exec(string)` to `callback(execArr)`, which can be passed as a second argument.

In regular expression very important adding symbol `^` from start. You should do this anyway.

```js
import { Smarkdown, escape } from 'smarkdown'

/**
 * KaTeX is a fast, easy-to-use JavaScript library for TeX math rendering on the web.
 */
import * as katex from 'katex'

Smarkdown.setBlockRule(/^@@@ *(\w+)\n([\s\S]+?)\n@@@/, function(execArr) {
  // Don't use arrow function for this callback
  // if you need Renderer's context, for example to `this.options`.

  const channel = execArr[1]
  const content = execArr[2]

  switch (channel) {
    case 'youtube': {
      const id = escape(content)
      return `\n<iframe width="420" height="315" src="https://www.youtube.com/embed/${id}"></iframe>\n`
    }
    case 'katex': {
      return katex.renderToString(escape(content))
    }
    default: {
      const msg = `[Error: a channel "${channel}" for an embedded code is not recognized]`
      return '<div style="color: red">' + msg + '</div>'
    }
  }
})

const blockStr = `
# Example usage with embed block code

@@@ katex
c = \\pm\\sqrt{a^2 + b^2}
@@@

@@@ youtube
JgwnkM5WwWE
@@@
`

const html = Smarkdown.parse(blockStr)

console.log(html)
```

## API

### Methods of Smarkdown class and necessary types

````ts
/**
 * Accepts Markdown text and returns text in HTML format.
 *
 * @param src String of markdown source to be compiled.
 *
 * @param options Hash of options. They replace, but do not merge with the default options.
 * If you want the merging, you can to do this via `Smarkdown.setOptions()`.
 *
 * Can also be set using the `Smarkdown.setOptions` method as seen above.
 */
static parse(src: string, options?: SmarkdownOptions): string

/**
 * Accepts Markdown text and returns object with text in HTML format,
 * tokens and links from `BlockLexer.parser()`.
 *
 * @param src String of markdown source to be compiled.
 * @param options Hash of options. They replace, but do not merge with the default options.
 * If you want the merging, you can to do this via `Smarkdown.setOptions()`.
 */
static debug(src: string, options?: SmarkdownOptions): {result: string, tokens: Token[], links: Links};


/**
 * Merges the default options with options that will be set.
 *
 * @param options Hash of options.
 */
static setOptions(options: SmarkdownOptions): this;

interface Token {
  type: number | string
  text?: string
  lang?: string
  depth?: number
  header?: string[]
  align?: Align[]
  cells?: string[][]
  ordered?: boolean
  pre?: boolean
  escaped?: boolean
  execArr?: RegExpExecArray
  ends?: string
  /**
   * GFM
   */
  checked?: boolean | null
  /**
   * Extra
   */
  footnote?: string
  refname?: string
  footnotes?: string[]
  /**
   * Used for debugging. Identifies the line number in the resulting HTML file.
   */
  line?: number
}

enum TokenType {
  space = 1,
  text,
  paragraph,
  heading,
  listStart,
  listEnd,
  looseItemStart,
  looseItemEnd,
  listItemStart,
  listItemEnd,
  blockquoteStart,
  blockquoteEnd,
  code,
  table,
  html,
  hr,
  footnote
}

// This class also using as an interface.
class SmarkdownOptions {
  gfm?: boolean = true
  tables?: boolean = true
  extra?: boolean = false
  breaks?: boolean = false
  taskList?: boolean
  pedantic?: boolean = false
  sanitize?: boolean = false
  sanitizer?: (text: string) => string
  mangle?: boolean = true
  smartLists?: boolean = false
  silent?: boolean = false
  baseUrl?: string = null
  linksInNewTab?: boolean | Function = false
  trimLinkText?: Function
  disabledRules?: string[] = []
  /**
   * @param code The section of code to pass to the highlighter.
   * @param lang The programming language specified in the code block.
   */
  highlight?: (code: string, lang?: string) => string
  langPrefix?: string = 'lang-'
  langAttribute?: boolean = false
  smartypants?: boolean = false
  headerId?: string = ''
  headerPrefix?: string = ''
  /**
   * An object containing functions to render tokens to HTML. Default: `new Renderer()`
   */
  renderer?: Renderer
  /**
   * Self-close the tags for void elements (&lt;br/&gt;, &lt;img/&gt;, etc.)
   * with a "/" as required by XHTML.
   */
  xhtml?: boolean = false
  /**
   * The function that will be using to escape HTML entities.
   * By default using inner helper.
   */
  escape?: (html: string, encode?: boolean) => string = escape
  /**
   * The function that will be using to unescape HTML entities.
   * By default using inner helper.
   */
  unescape?: (html: string) => string = unescape
  /**
   * The function that will be using to slug string.
   * By default using inner helper.
   */
  slug?: (str: string) => string = slug
  /**
   * The RegExp that will be using to make RegExp.exec as noop.
   * By default using inner helper.
   */
  noop?: Function = noop
  /**
   * The function that will be using to render image/link URLs relative to a base url.
   * By default using inner helper.
   */
  resolveUrl?: (base: string, href: string) => string = resolveUrl
  /**
   * If set to `true`, an inline text will not be taken in paragraph.
   *
   * ```ts
   * // isNoP == false
   * Smarkdown.parse('some text'); // returns '<p>some text</p>'
   *
   * Smarkdown.setOptions({isNoP: true});
   *
   * Smarkdown.parse('some text'); // returns 'some text'
   * ```
   */
  isNoP?: boolean
  /**
   * Split by chars inline
   * Default: \<![`*~
   * Append new chars to default split chars
   * Useful for set new inline rules
   */
  inlineSplitChars?: string
}
````

#### linksInNewTab

Type: `boolean`<br>
Type: `boolean | (href: string) => boolean`<br>
Default: `false`

Open links in a new window/tab.

### Renderer methods API

```ts
//*** Block level renderer methods. ***

code(code: string, lang?: string, escaped?: boolean): string

blockquote(quote: string): string

html(html: string): string

heading(text: string, level: number, raw: string): string

hr(): string

list(body: string, ordered?: boolean, isTaskList?: boolean | null): string

listitem(text: string, checked?: boolean): string

paragraph(text: string): string

table(header: string, body: string): string

tablerow(content: string): string

tablecell(content: string, flags: {header?: boolean, align?: 'center' | 'left' | 'right'}): string

//*** Inline level renderer methods. ***

strong(text: string): string

em(text: string): string

codespan(text: string): string

br(): string

del(text: string): string

link(href: string, title: string, text: string): string

image(href: string, title: string, text: string): string

text(text: string): string
```

## License

Copyright (c) 2011-2018, Christopher Jeffrey. (MIT License)

Copyright (c) 2018, Костя Третяк. (MIT License)

Copyright (c) 2018, Yahtnif. (MIT License)
