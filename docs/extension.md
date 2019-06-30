# Extension

Using `Smarkdown.setRule(regExp, callback, [, options])`, which takes a regular expression as the first argument, and returns result `regExp.exec(string)` to `callback(execArr)`, which can be passed as a second argument.

Extension options:

|     Name     |   Type   | Default | inline | block |
| :----------: | :------: | :-----: | :----: | :---: |
|   priority   |  Number  |  null   |   ✓    |   ✓   |
| checkPreChar | Function |  null   |   ✓    |       |

## Inline

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

## Block

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

## Unset

```js
Smarkdown.unsetRule(regExp)
```
