// ensure pre char is \s, \B or ''
function checkPreChar(char) {
  return !char || /\s|\B/.test(char)
}

module.exports = function(markdown) {
  /**
   * sub
   *
   * H~2~O
   * H<sub>2</sub>O
   */
  const regSub = /^~(?=\S)([\s\S]*?\S)~/
  markdown.setInlineRule(regSub, function(execArr) {
    return `<sub>${this.output(execArr[1])}</sub>`
  })

  /**
   * sup
   *
   * 1^st^
   * 1<sup>st</sup>
   */
  const regSup = /^\^(?=\S)([\s\S]*?\S)\^/
  markdown.setInlineRule(regSup, function(execArr) {
    return `<sup>${this.output(execArr[1])}</sup>`
  })

  /**
   * mark
   *
   * ==Experience== is the best teacher.
   * <mark>Experience</mark> is the best teacher.
   */
  const regMark = /^==(?=\S)([\s\S]*?\S)==/
  markdown.setInlineRule(regMark, function(execArr) {
    return `<mark>${execArr[1]}</mark>`
  })

  /**
   * hashtag
   *
   * #tag
   * <span class="hashtag">tag</span>
   */
  const regHashtag = /^#([^\s#]+)((?:\b)|(?=\s|$))/
  markdown.setInlineRule(
    regHashtag,
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
  const regRubyAnnotation = /^\[([^\[\]{}]+)\]\{([^\[\]{}]+)\}/
  markdown.setInlineRule(
    regRubyAnnotation,
    function(execArr) {
      return `<ruby>${execArr[1]}<rt>${execArr[2]}</rt></ruby>`
    },
    {
      priority: 1
    }
  )

  return markdown
}
