# Smarkdown

[![996ICU Licence](<https://img.shields.io/badge/license-NPL%20(The%20996%20Prohibited%20License)-blue.svg>)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
[![npm](https://badgen.net/npm/v/smarkdown)](https://www.npmjs.com/package/smarkdown)
[![gzip size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/smarkdown/dist/smarkdown.min.js?compression=gzip)](https://cdn.jsdelivr.net/npm/smarkdown/dist/smarkdown.min.js)
[![install size](https://badgen.net/packagephobia/install/smarkdown)](https://packagephobia.now.sh/result?p=smarkdown)
[![downloads](https://badgen.net/npm/dt/smarkdown)](https://www.npmjs.com/package/smarkdown)
[![Build Status](https://travis-ci.org/yahtnif/smarkdown.svg?branch=master)](https://travis-ci.org/yahtnif/smarkdown)

> Markdown parser, simplicity and extensibility. Fork of [marked](https://github.com/markedjs/marked) and [marked-ts](https://github.com/KostyaTretyak/marked-ts).

## Features

- **Awesome:** ES6, TypeScript, Rollup, Jest...
- **Extensible:** Add your own [extensions](#extensions)
- **Fast:** Low-level compiler for parsing markdown without caching or blocking for long periods of time
- **Lightweight:** It's 9kb of minified and gzipped

## Table of contents

- [Install](#install)
- [Usage](#usage)
- [Options](#options)
- [Extension](#extension)
- [Renderer](#renderer)
- [Comparison](#comparison)
- [License](#license)

## Install

```sh
yarn add smarkdown
# or
npm install smarkdown
```

**browser (CDN):** [jsDelivr](https://www.jsdelivr.com/package/npm/smarkdown) | [unpkg](https://unpkg.com/smarkdown/)

## Usage

Import the library as a module:

```js
import Smarkdown from 'smarkdown'
```

Or import the library with a script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/smarkdown/dist/smarkdown.min.js"></script>
```

Example:

```js
// Resetting options
Smarkdown.resetOptions()

// Setting options
Smarkdown.setOptions({
  breaks: true
})

const str = 'I am using **Smarkdown**.'

console.log(Smarkdown.parse(str))
// <p>I am using <strong>Smarkdown</strong>.</p>

console.log(Smarkdown.parse(str, { nop: true }))
// I am using <strong>Smarkdown</strong>.
```

### Syntax highlighting

```js
// highlight.js
import Smarkdown from 'smarkdown'
import { highlight } from 'highlight.js'

Smarkdown.setOptions({
  highlight: (code, lang) => {
    return lang && highlight.getLanguage(lang)
      ? highlight.highlight(lang, code).value
      : highlight.highlightAuto(code).value
  }
})
```

```js
// prismjs
import Smarkdown from 'smarkdown'
import Prism from 'prismjs'
import 'prismjs/components/prism-markdown'

Smarkdown.setOptions({
  highlight: (code, lang) => {
    const language = Prism.languages[lang] ? lang : 'markdown'

    return Prism.highlight(code, Prism.languages[language], language)
  }
})
```

## Options

|     Name      |        Type         |          Default          |                                                                                                          Note                                                                                                           |
| :-----------: | :-----------------: | :-----------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|    baseUrl    |       String        |           null            |                                                                                           A prefix url for any relative link.                                                                                           |
|    breaks     |       Boolean       |           false           |                                                                  If true, add `<br>` on a single line break (copies GitHub). Requires `gfm` be `true`.                                                                  |
| disabledRules |        Array        |            []             |                                                                        If set to `['lheading']`, will disable headers of an underline-ish style.                                                                        |
|     extra     |       Boolean       |           false           |                                                                                  If true, enable `footnote`. Requires `gfm` be `true`.                                                                                  |
|      gfm      |       Boolean       |           true            |                                                          If true, use approved [GitHub Flavored Markdown (GFM) specification](https://github.github.com/gfm/).                                                          |
|   headerId    |  Boolean \| String  |           false           | Include an `id` attribute when emitting headings.<br>If true, for all headings.<br>If set to `on`, for “non-close” atx-style headings (## h2, etc).<br>If set to `off`, for “close” atx-style headings (## h2 ##, etc). |
| headerPrefix  |       String        |            ''             |                                                                               A string to prefix the id attribute when emitting headings.                                                                               |
|   highlight   |      Function       |  (code, lang) => string   |                                                                  A function to highlight code blocks, see [Syntax highlighting](#syntax-highlighting)                                                                   |
| langAttribute |       Boolean       |           false           |                                                                              If `true`, add `data-lang` attribute to highlight block code.                                                                              |
|  langPrefix   |       String        |        'language-'        |                                                                  A string to prefix the className in a `<code>` block. Useful for syntax highlighting.                                                                  |
| linksInNewTab | Boolean \| Function |           false           |                                                                                            If true, open links in new tabs.                                                                                             |
|    mangle     |       Boolean       |           true            |                                                                      If true, autolinked email address is escaped with HTML character references.                                                                       |
|      nop      |       Boolean       |           false           |                                                                                If `true`, an inline text will not be taken in paragraph.                                                                                |
|   pedantic    |       Boolean       |           false           |                                    If true, conform to the original `markdown.pl` as much as possible. Don't fix original markdown bugs or behavior. Turns off and overrides `gfm`.                                     |
|   renderer    |      Renderer       |         Renderer          |                                                          An object containing functions to render tokens to HTML. See [Renderer](#renderer) for more details.                                                           |
|   sanitize    |       Boolean       |           false           |                                                                 If true, sanitize the HTML passed into `markdownString` with the `sanitizer` function.                                                                  |
|   sanitizer   |      Function       |           null            |                                                                              A function to sanitize the HTML passed into `markdownString`.                                                                              |
|    silent     |       Boolean       |           false           |                                                                                    If true, the parser does not throw any exception.                                                                                    |
|     slug      |      Function       | str => built_in_slug(str) |                                                                                    Slugify `id` attribute for heading and footnote.                                                                                     |
|  smartLists   |       Boolean       |           false           |                                                                          If true, use smarter list behavior than those found in `markdown.pl`.                                                                          |
|  smartypants  |       Boolean       |           false           |                                                                     If true, use "smart" typographic punctuation for things like quotes and dashes.                                                                     |
| trimLinkText  |      Function       |           null            |                                                                                               Useful for text truncation.                                                                                               |
|     xhtml     |       Boolean       |           false           |                                                        Self-close the tags for void elements (&lt;br/&gt;, &lt;img/&gt;, etc.) with a "/" as required by XHTML.                                                         |

## Extension

Using `Smarkdown.setRule(regExp, callback, [, options])`, which takes a regular expression as the first argument, and returns result `regExp.exec(string)` to `callback(execArr)`, which can be passed as a second argument.

Extension options:

|     Name     |   Type   | Default | inline | block |
| :----------: | :------: | :-----: | :----: | :---: |
|   priority   |  Number  |  null   |   ✓    |   ✓   |
| checkPreChar | Function |  null   |   ✓    |       |

### Inline

```js
/**
 * sub
 *
 * H~2~O
 * H<sub>2</sub>O
 */
const subRegex = /~(?=\S)([\s\S]*?\S)~/
Smarkdown.setRule(subRegex, function(execArr) {
  return `<sub>${this.output(execArr[1])}</sub>`
})

/**
 * sup
 *
 * 1^st^
 * 1<sup>st</sup>
 */
const supRegex = /\^(?=\S)([\s\S]*?\S)\^/
Smarkdown.setRule(supRegex, function(execArr) {
  return `<sup>${this.output(execArr[1])}</sup>`
})

/**
 * mark
 *
 * ==Experience== is the best teacher.
 * <mark>Experience</mark> is the best teacher.
 */
const markRegex = /==(?=\S)([\s\S]*?\S)==/
Smarkdown.setRule(markRegex, function(execArr) {
  return `<mark>${this.output(execArr[1])}</mark>`
})

/**
 * hashtag
 *
 * #tag
 * <span class="hashtag">tag</span>
 */
const hashtagRegex = /#([^\s#]+)((?:\b)|(?=\s|$))/
Smarkdown.setRule(
  hashtagRegex,
  function(execArr) {
    return `<span class="hashtag">${execArr[1]}</span>`
  },
  {
    checkPreChar(char) {
      return !char || /\s|\B/.test(char)
    }
  }
)

/**
 * ruby annotation
 *
 * [注音]{zhuyin}
 * <ruby>注音<rt>zhuyin</rt></ruby>
 */
const rubyAnnotationRegex = /\[([^\[\]{}]+)\]\{([^\[\]{}]+)\}/
Smarkdown.setRule(
  rubyAnnotationRegex,
  function(execArr) {
    return `<ruby>${execArr[1]}<rt>${execArr[2]}</rt></ruby>`
  },
  {
    priority: 1
  }
)

/**
 * small text
 *
 * --small text-- => <span class="small-text">small text</span>
 */
const smallTextRegex = /--(?=\S)([\s\S]*?\S)--/
Smarkdown.setRule(smallTextRegex, function(execArr) {
  return `<span class="small-text">${execArr[1]}</span>`
})

/**
 * large text
 *
 * ++large text++ => <span class="large-text is-1">large text</span>
 * +++large text+++ => <span class="large-text is-2">large text</span>
 * ++++large text++++ => <span class="large-text is-3">large text</span>
 */
const largeTextRegex = /(\+{2,})(?=\S)([\s\S]*?\S)\+{2,}/
Smarkdown.setRule(largeTextRegex, function(execArr) {
  let size = execArr[1].length - 1

  if (size > 3) {
    size = 3
  }

  return `<span class="large-text is-${size}">${execArr[2]}</span>`
})
```

### Block

```js
// block container
const extRegex = /::: *([\w-_]+) *\n([\s\S]*?)\n:::\s?/
Smarkdown.setRule(extRegex, execArr => {
  return `<div class="${execArr[1]}">${execArr[2]}</div>`
})

const str = `::: warning
Lorem ipsum dolor sit amet, consectetur adipiscing elit lorem ipsum dolor.
:::`

console.log(Smarkdown.parse(str))

// <div class="warning">Lorem ipsum dolor sit amet, consectetur adipiscing elit lorem ipsum dolor.</div>
```

### Unset

```js
Smarkdown.unsetRule(regExp)
```

## Renderer

### Methods

```js
//*** Block level renderer methods. ***

blockquote(quote)

code(code, lang, escaped)

footnote(footnotes)

heading(text, level, raw, ends)

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

### Overriding Renderer methods

```js
import Smarkdown from 'smarkdown'

class NewRenderer extends Smarkdown.Renderer {
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

Smarkdown.setOptions({ renderer: NewRenderer })
// or pass new options to new Renderer
Smarkdown.setOptions({ renderer: new NewRenderer(NewOptions) })
```

## Comparison

|                    |                                                                                      Smarkdown                                                                                       |                                                                             Marked                                                                             |                                                                                         markdown-it                                                                                          |
| :----------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|      Version       |                                                [![npm](https://badgen.net/npm/v/smarkdown)](https://www.npmjs.com/package/smarkdown)                                                 |                                        [![npm](https://badgen.net/npm/v/marked)](https://www.npmjs.com/package/marked)                                         |                                                  [![npm](https://badgen.net/npm/v/markdown-it)](https://www.npmjs.com/package/markdown-it)                                                   |
| Minified & Gzipped | [![gzip size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/smarkdown/dist/smarkdown.min.js?compression=gzip)](https://cdn.jsdelivr.net/npm/smarkdown/dist/smarkdown.min.js) | [![gzip size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/marked/marked.min.js?compression=gzip)](https://cdn.jsdelivr.net/npm/marked/marked.min.js) | [![gzip size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/markdown-it/dist/markdown-it.min.js?compression=gzip)](https://cdn.jsdelivr.net/npm/markdown-it/dist/markdown-it.min.js) |

## License

[996ICU](./LICENSE)
