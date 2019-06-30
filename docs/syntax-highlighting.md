# Syntax highlighting

```js
// highlight.js
const Smarkdown = require('smarkdown')
const { highlight } = require('highlight.js')

Smarkdown.setOptions({
  highlight: (code, lang) => {
    return lang && highlight.getLanguage(lang)
      ? highlight.highlight(lang, code).value
      : highlight.highlightAuto(code).value
  }
})
```

````js
// prismjs
const Smarkdown = require('smarkdown')
const Prism = require('prismjs')
require('prismjs/components/prism-markdown')

Smarkdown.setOptions({
  highlight: (code, lang) => {
    const language = Prism.languages[lang] ? lang : 'markdown'

    return Prism.highlight(code, Prism.languages[language], language)
  }
})
```
````
