# Renderer

## Methods

```js
//*** Block level renderer methods. ***

blockquote(quote)

code(code, lang, escaped)

footnote(footnotes)

heading(text, level, raw, ends)

hr(text)

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

## Overriding Renderer methods

```js
const Smarkdown = require('smarkdown')

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
