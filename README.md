# Smarkdown

> Markdown parser, simple and powerful.

Fork of [marked](https://github.com/markedjs/marked) and [marked-ts](https://github.com/KostyaTretyak/marked-ts).

## Table of contents

* [Install](#install)
* [Usage](#usage)
  * [Basic](#basic)
  * [Highlight code blocks](#highlight-code-blocks)
* [Extensions](#extensions)
  * [Inline](#inline)
  * [Block](#block)
* [Renderer methods](#renderer-methods)
  * [Overriding renderer methods](#overriding-renderer-methods)
* [Size Comparison](#size-comparison)
* [License](#license)

## Install

```bash
npm install smarkdown --save

yarn add smarkdown
```

## Usage

### Basic

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

### Highlight code blocks

````js
// highlight.js
import { Smarkdown } from 'smarkdown'
import { highlight } from 'highlight.js'

Smarkdown.setOptions({
  highlight: (code, lang) => {
    return lang && highlight.getLanguage(lang)
      ? highlight.highlight(lang, code).value
      : highlight.highlightAuto(code).value
  }
})
````

````js
// prismjs
import { Smarkdown } from 'smarkdown'
import Prism from 'prismjs'

Smarkdown.setOptions({
  highlight: (code, lang) => {
    const language = Prism.languages[lang] ? lang : defaultLanguage

    return Prism.highlight(code, Prism.languages[language], language)
  }
})
````

## Extensions

### Inline

Using `Smarkdown.setInlineRule( regexp, callback, [, option] )`, which takes a regular expression as the first argument, and returns result `regexp.exec(string)` to `callback(execArr)`, which can be passed as a second argument.

`regexp` **MUST** start with `^`.

```js
import { Smarkdown } from 'smarkdown'

Smarkdown.setOptions({
  // ^ for <sup></sup>
  // = for <mark></mark>
  // # for hashtag
  inlineSplitChars: '=^#'
})

/**
 * sub
 *
 * H~2~0
 * H<sub>2</sub>O
 */
const regSub = /^~(?=\S)([\s\S]*?\S)~/
Smarkdown.setInlineRule(regSub, function(execArr) {
  return `<sub>${this.output(execArr[1])}</sub>`
})

/**
 * sup
 *
 * 1^st^
 * 1<sup>st</sup>
 */
const regSup = /^\^(?=\S)([\s\S]*?\S)\^/
Smarkdown.setInlineRule(regSup, function(execArr) {
  return `<sup>${this.output(execArr[1])}</sup>`
})

/**
 * mark
 *
 * ==Experience== is the best teacher.
 * <mark>Experience</mark> is the best teacher.
 */
const regMark = /^==(?=\S)([\s\S]*?\S)==/
Smarkdown.setInlineRule(regMark, function(execArr) {
  return `<mark>${this.output(execArr[1])}</mark>`
})

/**
 * hashtag
 *
 * #tag
 * <span class="hashtag">tag</span>
 */
const regHashtag = /^#([^\s#]+)(?:\b)/
Smarkdown.setInlineRule(
  regHashtag,
  function(execArr) {
    return `<span class="hashtag">${execArr[1]}</span>`
  },
  {
    checkPreChar (char) {
      return !char || /\s/.test(char)
    }
  }
)

/**
 * ruby annotation
 *
 * [注音]{zhuyin}
 * <ruby>注音<rt>zhuyin</rt></ruby>
 */
const regRubyAnnotation = /^\[([^\[\]{}]+)\]\{([^\[\]{}]+)\}/
Smarkdown.setInlineRule(
  regRubyAnnotation,
  function(execArr) {
    return `<ruby><rb>${execArr[1]}</rb><rp>(</rp><rt>${
      execArr[2]
    }</rt><rp>)</rp></ruby>`
  },
  {
    priority: 1
  }
)
```

### Block

Using `Smarkdown.setBlockRule( regexp, callback, [, option] )`, like `Smarkdown.setInlineRule( regexp, callback, [, option] )`

```js
import { Smarkdown, escape } from 'smarkdown'

// block container
const regExt = /^::: *([\w-_]+) *\n([\s\S]*?)\n:::\s?/
Smarkdown.setBlockRule(regExt, (execArr) => {
  return `<div class="${execArr[1]}">${execArr[2]}</div>`
})

const str = `::: warning
Lorem ipsum dolor sit amet, consectetur adipiscing elit lorem ipsum dolor.
:::
`

console.log(Smarkdown.parse(str))

// <div class="warning">Lorem ipsum dolor sit amet, consectetur adipiscing elit lorem ipsum dolor.</div>
```

## Renderer methods

```ts
//*** Block level renderer methods. ***

blockquote(quote: string): string

code(code: string, lang?: string, escaped?: boolean): string

fnref(refname: string): string

footnote(footnotes:

heading(text: string, level: number, raw: string, ends: string): string

hr(): string

html(html: string): string

list(body: string, ordered?: boolean, start?: string | number, isTaskList?: boolean): string

listitem(text: string, checked?: boolean | null): string

paragraph(text: string): string

table(header: string, body: string): string

tablerow(content: string): string

tablecell(
  content: string,
  flags: { header?: boolean; align?: Align }
): string

//*** Inline level renderer methods. ***

br(): string

codespan(text: string): string

del(text: string): string

em(text: string): string

image(href: string, title: string, text: string): string

link(href: string, title: string, text: string): string

strong(text: string): string

text(text: string): string
```

### Overriding renderer methods

```js
import { Smarkdown, Renderer } from 'smarkdown'

class MyRenderer extends Renderer {
  // Overriding parent method.
  table(header, body) {
    if (body) body = '<tbody>' + body + '</tbody>'

    // add class .table to table
    return `
<table class="table">
<thead>
${header}</thead>
${body}</table>
`
  }
}

Smarkdown.setOptions({ renderer: MyRenderer })
```

## Size Comparison

| | Smarkdown | Marked | markdown-it |
| - | - | - | - |
| Uncompressed | 76.6 KB | 38.8 KB | 258.5 KB |
| Minified | 30.1 KB | 21.5 KB | 106.3 KB |
| Minified & Gzipped | 9.34 KB | 7.18 KB | 34 KB |

## License

Copyright (c) 2011-2018, Christopher Jeffrey. (MIT License)

Copyright (c) 2018, Костя Третяк. (MIT License)

Copyright (c) 2018, Yahtnif. (MIT License)
