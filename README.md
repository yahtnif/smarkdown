# Smarkdown

> Markdown parser, simple and powerful. Fork of [marked](https://github.com/markedjs/marked) and [marked-ts](https://github.com/KostyaTretyak/marked-ts).

## Features

* **Fast:** low-level compiler for parsing markdown without caching or blocking for long periods of time
* **Lightweight:** it's 9kb of minified and gzipped
* **Powerful:** easily to write extensions in an elegant way

## Table of contents

* [Installation](#installation)
* [Usage](#usage)
  * [Basic](#basic)
  * [Setting options](#setting-options)
  * [Syntax highlighting](#syntax-highlighting)
* [Options](#options)
* [Extensions](#extensions)
  * [Inline](#inline)
  * [Block](#block)
  * [Extension's Options](#extension-s-options)
* [Renderer methods](#renderer-methods)
  * [Overriding renderer methods](#overriding-renderer-methods)
* [Size Comparison](#size-comparison)
* [License](#license)


## Installation

```bash
npm install smarkdown --save

yarn add smarkdown
```

## Usage

### Basic

```js
import { Smarkdown } from 'smarkdown'

const str = 'I am using **Smarkdown**.'

console.log(Smarkdown.parse(str))
// <p>I am using <strong>Smarkdown</strong>.</p>

console.log(Smarkdown.parse(str, { nop: true }))
// I am using <strong>Smarkdown</strong>.
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

### Syntax highlighting

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

| Name | Type | Default | Note |
| :-: | :-: | :-: | :-: |
| baseUrl | String | null | |
| breaks | boolean | false | |
| disabledRules | array | [] | |
| extra | boolean | false | |
| gfm | boolean | true | |
| headerId | boolean \| string | false | |
| headerPrefix | string | '' | |
| highlight | function | (code, lang) => string | |
| inlineSplitChars | string | '<!\[\`*~' | Split by chars, the value will append to default  |
| langAttribute | boolean | false | |
| langPrefix | string | 'language-' | |
| linksInNewTab | boolean \| function | false | |
| mangle | boolean | true | |
| nop | boolean | false | If set to `true`, an inline text will not be taken in paragraph. |
| pedantic | boolean | false | |
| renderer | Renderer | | |
| sanitize | boolean | false | |
| sanitizer | function | text => string | |
| silent | boolean | false | |
| smartLists | boolean | false | |
| smartypants | boolean | false | |
| tables | boolean | true | |
| taskList | boolean | false | |
| trimLinkText | function | | |
| xhtml | boolean | false | Self-close the tags for void elements (&lt;br/&gt;, &lt;img/&gt;, etc.) with a "/" as required by XHTML. |
| slug | function \| false | str => string | |


## Extensions

### Inline

Using `Smarkdown.setInlineRule( regexp, callback, [, options] )`, which takes a regular expression as the first argument, and returns result `regexp.exec(string)` to `callback(execArr)`, which can be passed as a second argument.

`regexp` **MUST** start with `^`.

```js
import { Smarkdown } from 'smarkdown'

Smarkdown.setOptions({
  // = for <mark></mark>
  // ^ for <sup></sup>
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
| priority | number | null | ✓ | ✓ |
| checkPreChar | function | null | ✓ | |

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

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2011-2018, Christopher Jeffrey.

Copyright (c) 2018, Костя Третяк.

Copyright (c) 2018-present, Yahtnif.
