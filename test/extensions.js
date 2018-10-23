// ensure pre char is \s, \B or ''
function checkPreChar(char) {
  return !char || /\s|\B/.test(char)
}

const subRe = /^~(?=\S)([\s\S]*?\S)~/
const supRe = /^\^(?=\S)([\s\S]*?\S)\^/
const markRe = /^==(?=\S)([\s\S]*?\S)==/
const hashtagRe = /^#([^\s#]+)((?:\b)|(?=\s|$))/
const rubyAnnotationRe = /^\[([^\[\]{}]+)\]\{([^\[\]{}]+)\}/
const smallTextRe = /^--(?=\S)([\s\S]*?\S)--/
const largeTextRe = /^(\+{2,})(?=\S)([\s\S]*?\S)\+{2,}/

const extRe = /^::: *([\w-_]+) *\n([\s\S]*?)\n:::\s?/

const inlineRes = [subRe, supRe, markRe, hashtagRe, rubyAnnotationRe, smallTextRe, largeTextRe]
const blockRes = [extRe]

exports.setExtensions = function() {
  /**
   * sub
   *
   * H~2~O
   * H<sub>2</sub>O
   */
  Smarkdown.setInlineRule(subRe, function(execArr) {
    return `<sub>${this.output(execArr[1])}</sub>`
  })

  /**
   * sup
   *
   * 1^st^
   * 1<sup>st</sup>
   */
  Smarkdown.setInlineRule(supRe, function(execArr) {
    return `<sup>${this.output(execArr[1])}</sup>`
  })

  /**
   * mark
   *
   * ==Experience== is the best teacher.
   * <mark>Experience</mark> is the best teacher.
   */
  Smarkdown.setInlineRule(markRe, function(execArr) {
    return `<mark>${execArr[1]}</mark>`
  })

  /**
   * hashtag
   *
   * #tag
   * <span class="hashtag">tag</span>
   */
  Smarkdown.setInlineRule(
    hashtagRe,
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
  Smarkdown.setInlineRule(
    rubyAnnotationRe,
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
  const smallTextRe = /^--(?=\S)([\s\S]*?\S)--/
  Smarkdown.setInlineRule(smallTextRe, function(execArr) {
    return `<span class="small-text">${execArr[1]}</span>`
  })

  /**
   * large text
   *
   * ++large text++ => <span class="large-text is-1">large text</span>
   * +++large text+++ => <span class="large-text is-2">large text</span>
   * ++++large text++++ => <span class="large-text is-3">large text</span>
   */
  const largeTextRe = /^(\+{2,})(?=\S)([\s\S]*?\S)\+{2,}/
  Smarkdown.setInlineRule(largeTextRe, function(execArr) {
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
  Smarkdown.setBlockRule(extRe, (execArr) => {
    return `<div class="${execArr[1]}">${execArr[2]}</div>`
  })

  return Smarkdown
}

exports.unsetExtensions = function() {
  inlineRes.forEach(R => {
    Smarkdown.unsetInlineRule(R)
  })

  blockRes.forEach(R => {
    Smarkdown.unsetBlockRule(R)
  })
}