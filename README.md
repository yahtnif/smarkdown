# Smarkdown

> Markdown parser, simple and powerful.

Fork of [marked](https://github.com/markedjs/marked) and [marked-ts](https://github.com/KostyaTretyak/marked-ts).

## Table of contents

* [Install](#install)
* [Usage](#usage)
  * [Basic](#basic)
  * [Setting options](#setting-options)
  * [Highlight code blocks](#highlight-code-blocks)
* [Options](#options)
* [Extensions](#extensions)
  * [Inline](#inline)
  * [Block](#block)
  * [Extension's Options](#extension-s-options)
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

### Setting options

```js
import { Smarkdown, Renderer } from 'smarkdown'

Smarkdown.setOptions({
  renderer: Renderer,
  gfm: true,
  tables: true,
  breaks: true,
  extra: true,
  linksInNewTab: true,
  disabledRules: ['lheading']
})
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
import 'prismjs/components/prism-markdown'

Smarkdown.setOptions({
  highlight: (code, lang) => {
    const language = Prism.languages[lang] ? lang : 'markdown'

    return Prism.highlight(code, Prism.languages[language], language)
  }
})
````

## Options

```ts
{
  baseUrl?: string = null
  breaks?: boolean = false
  disabledRules?: string[] = []
  extra?: boolean = false
  gfm?: boolean = true
  headerId?: boolean | string = false
  headerPrefix?: string = ''
  highlight?: (code: string, lang?: string) => string
  langAttribute?: boolean = false
  langPrefix?: string = 'language-'
  linksInNewTab?: boolean | Function = false
  mangle?: boolean = true
  pedantic?: boolean = false
  renderer?: Renderer
  sanitize?: boolean = false
  sanitizer?: (text: string) => string
  silent?: boolean = false
  smartLists?: boolean = false
  smartypants?: boolean = false
  tables?: boolean = true
  taskList?: boolean
  trimLinkText?: Function
  /**
   * Self-close the tags for void elements (&lt;br/&gt;, &lt;img/&gt;, etc.)
   * with a "/" as required by XHTML.
   */
  xhtml?: boolean = false
  /**
   * The function that will be using to slug string.
   * By default using inner helper.
   */
  slug?: (str: string) => string = slug
  /**
   * If set to `true`, an inline text will not be taken in paragraph.
   *
   * ```js
   * Smarkdown.parse('some text'); // returns '<p>some text</p>'
   *
   * Smarkdown.setOptions({nop: true});
   *
   * Smarkdown.parse('some text'); // returns 'some text'
   * ```
   */
  nop?: boolean
  /**
   * Split by chars inline
   * Default: \<![`*~
   * Append new chars to default split chars
   * Useful for set new inline rules
   */
  inlineSplitChars?: string
}
```

## Extensions

### Inline

Using `Smarkdown.setInlineRule( regexp, callback, [, options] )`, which takes a regular expression as the first argument, and returns result `regexp.exec(string)` to `callback(execArr)`, which can be passed as a second argument.

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

Using `Smarkdown.setBlockRule( regexp, callback, [, options] )`, like `Smarkdown.setInlineRule( regexp, callback, [, options] )`

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

### Extension's Options

| Name | Type | Default | inline | block |
| :-: | :-: | :-: | :-: | :-: |
| priority | Number | null | ✓ | ✓ |
| checkPreChar | Function | null | ✓ | |

## Renderer methods

```js
//*** Block level renderer methods. ***

blockquote(quote)

code(code, lang, escaped)

footnote(footnotes:

heading(text, level: number, raw, ends)

hr()

html(html)

list(body, ordered, start, isTaskList)

listitem(text, checked)

paragraph(text)

table(header, body)

tablerow(content)

tablecell(content, flags)

//*** Inline level renderer methods. ***

br()

codespan(text)

del(text)

em(text)

fnref(refname)

image(href, title, text)

link(href, title, text)

strong(text)

text(text)
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
| :-: | :-: | :-: | :-: |
| Version | 0.2.0 | 0.5.0 | 8.4.2 |
| Uncompressed | 76.5 KB | 38.8 KB | 258.5 KB |
| Minified | 30 KB | 21.5 KB | 106.3 KB |
| Minified & Gzipped | 9.26 KB | 7.18 KB | 34 KB |

## License

Copyright (c) 2011-2018, Christopher Jeffrey. (MIT License)

Copyright (c) 2018, Костя Третяк. (MIT License)

Copyright (c) 2018, Yahtnif. (MIT License)
