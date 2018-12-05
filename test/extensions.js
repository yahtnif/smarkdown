// ensure pre char is \s, \B or ''
function checkPreChar(char) {
  return !char || /\s|\B/.test(char)
}

const subRegex = /^~(?=\S)([\s\S]*?\S)~/
const supRegex = /^\^(?=\S)([\s\S]*?\S)\^/
const markRegex = /^==(?=\S)([\s\S]*?\S)==/
const hashtagRegex = /^#([^\s#]+)((?:\b)|(?=\s|$))/
const rubyAnnotationRegex = /^\[([^\[\]{}]+)\]\{([^\[\]{}]+)\}/
const smallTextRegex = /^--(?=\S)([\s\S]*?\S)--/
const largeTextRegex = /^(\+{2,})(?=\S)([\s\S]*?\S)\+{2,}/

const extRegex = /^::: *([\w-_]+) *\n([\s\S]*?)\n:::\s?/

const rules = [subRegex, supRegex, markRegex, hashtagRegex, rubyAnnotationRegex, smallTextRegex, largeTextRegex, extRegex, extRegex]

exports.setExtensions = function() {
  /**
   * sub
   *
   * H~2~O
   * H<sub>2</sub>O
   */
  Smarkdown.setRule(subRegex, function(execArr) {
    return `<sub>${this.output(execArr[1])}</sub>`
  })

  /**
   * sup
   *
   * 1^st^
   * 1<sup>st</sup>
   */
  Smarkdown.setRule(supRegex, function(execArr) {
    return `<sup>${this.output(execArr[1])}</sup>`
  })

  /**
   * mark
   *
   * ==Experience== is the best teacher.
   * <mark>Experience</mark> is the best teacher.
   */
  Smarkdown.setRule(markRegex, function(execArr) {
    return `<mark>${execArr[1]}</mark>`
  })

  /**
   * hashtag
   *
   * #tag
   * <span class="hashtag">tag</span>
   */
  Smarkdown.setRule(
    hashtagRegex,
    function(execArr) {
      return `<span class="hashtag">${execArr[1]}</span>`
    },
    { checkPreChar }
  )

  /**
   * ruby annotation
   *
   * [注音]{zhuyin}
   * <ruby>注音<rt>zhuyin</rt></ruby>
   */
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
  const smallTextRegex = /^--(?=\S)([\s\S]*?\S)--/
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
  const largeTextRegex = /^(\+{2,})(?=\S)([\s\S]*?\S)\+{2,}/
  Smarkdown.setRule(largeTextRegex, function(execArr) {
    let size = execArr[1].length - 1

    if (size > 3) {
      size = 3
    }

    return `<span class="large-text is-${size}">${execArr[2]}</span>`
  })

  /**
   * block container
   *
   * `::: warning
Lorem ipsum...
:::`
   * <div class="warning">Lorem ipsum...</div>
   */
  Smarkdown.setRule(extRegex, (execArr) => {
    return `<div class="${execArr[1]}">${execArr[2]}</div>`
  })

  return Smarkdown
}

exports.unsetExtensions = function() {
  rules.forEach(R => {
    Smarkdown.unsetRule(R)
  })
}