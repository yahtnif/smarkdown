// ensure pre char is \s, \B or ''
function checkPreChar(char) {
  return !char || /\s|\B/.test(char)
}

const regSub = /^~(?=\S)([\s\S]*?\S)~/
const regSup = /^\^(?=\S)([\s\S]*?\S)\^/
const regMark = /^==(?=\S)([\s\S]*?\S)==/
const regHashtag = /^#([^\s#]+)((?:\b)|(?=\s|$))/
const regRubyAnnotation = /^\[([^\[\]{}]+)\]\{([^\[\]{}]+)\}/
const regExt = /^::: *([\w-_]+) *\n([\s\S]*?)\n:::\s?/

const inlineRegs = [regSub, regSup, regMark, regHashtag, regRubyAnnotation]
const blockRegs = [regExt]

exports.setExtensions = function() {
  /**
   * sub
   *
   * H~2~O
   * H<sub>2</sub>O
   */
  Smarkdown.setInlineRule(regSub, function(execArr) {
    return `<sub>${this.output(execArr[1])}</sub>`
  })

  /**
   * sup
   *
   * 1^st^
   * 1<sup>st</sup>
   */
  Smarkdown.setInlineRule(regSup, function(execArr) {
    return `<sup>${this.output(execArr[1])}</sup>`
  })

  /**
   * mark
   *
   * ==Experience== is the best teacher.
   * <mark>Experience</mark> is the best teacher.
   */
  Smarkdown.setInlineRule(regMark, function(execArr) {
    return `<mark>${execArr[1]}</mark>`
  })

  /**
   * hashtag
   *
   * #tag
   * <span class="hashtag">tag</span>
   */
  Smarkdown.setInlineRule(
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
  Smarkdown.setInlineRule(
    regRubyAnnotation,
    function(execArr) {
      return `<ruby>${execArr[1]}<rt>${execArr[2]}</rt></ruby>`
    },
    {
      priority: 1
    }
  )

  /**
   * block container
   *
   * `::: warning
Lorem ipsum...
:::`
   * <div class="warning">Lorem ipsum...</div>
   */
  Smarkdown.setBlockRule(regExt, (execArr) => {
    return `<div class="${execArr[1]}">${execArr[2]}</div>`
  })

  return Smarkdown
}

exports.unsetExtensions = function() {
  inlineRegs.forEach(R => {
    Smarkdown.unsetInlineRule(R)
  })

  blockRegs.forEach(R => {
    Smarkdown.unsetBlockRule(R)
  })
}