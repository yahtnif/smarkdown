import fs from 'fs-extra'
import klawSync from 'klaw-sync'
import JSON5 from 'json5'
import Smarkdown from '../src'
import { Options } from '../src/interfaces'

interface testOption {
  dir: string
  runAtFirstAndOnce?: Function
  title?: string
}

function testFunc(options: testOption) {
  const { dir, runAtFirstAndOnce, title } = options

  const files = klawSync('__tests__/' + dir, { nodir: true })
  let isInit = false

  for (const file of files) {
    const filename: string = file.path.split('/').slice(-1)[0]

    const data: string = fs.readFileSync(file.path, 'utf-8')

    let [option, text] = data.split('\n===\n')
    let opt: Options

    if (text) {
      option = option
        .trim()
        .split(/\n+/)
        .map(s => s + ',')
        .join('\n')
      opt = JSON5.parse(`{${option}}`)
    } else {
      text = option
      option = null
    }

    let [actual, expected] = text.split(/\n{4,}/)

    let testTitle: string = title ? `${title} - ${filename}` : filename

    test(testTitle, function() {
      if (runAtFirstAndOnce && !isInit) {
        runAtFirstAndOnce()
        isInit = true
      }
      expect(Smarkdown.parse(actual, opt).trim()).toBe(expected.trim())
    })
  }
}

// ensure pre char is \s, \B or ''
function checkPreChar(char: string): boolean {
  return !char || /\s|\B/.test(char)
}

const subRegex: RegExp = /^~(?=\S)([\s\S]*?\S)~/
const supRegex: RegExp = /^\^(?=\S)([\s\S]*?\S)\^/
const markRegex: RegExp = /^==(?=\S)([\s\S]*?\S)==/
const hashtagRegex: RegExp = /^#([^\s#]+)((?:\b)|(?=\s|$))/
const rubyAnnotationRegex: RegExp = /^\[([^\[\]{}]+)\]\{([^\[\]{}]+)\}/
const smallTextRegex: RegExp = /^--(?=\S)([\s\S]*?\S)--/
const largeTextRegex: RegExp = /^(\+{2,})(?=\S)([\s\S]*?\S)\+{2,}/

const extRegex: RegExp = /^::: *([\w-_]+) *\n([\s\S]*?)\n:::\s?/

const rules = [
  subRegex,
  supRegex,
  markRegex,
  hashtagRegex,
  rubyAnnotationRegex,
  smallTextRegex,
  largeTextRegex,
  extRegex,
  extRegex
]

function setExtensions() {
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
  Smarkdown.setRule(extRegex, execArr => {
    return `<div class="${execArr[1]}">${execArr[2]}</div>`
  })

  return Smarkdown
}

function unsetExtensions() {
  rules.forEach(R => {
    Smarkdown.unsetRule(R)
  })
}

describe('Smarkdown', () => {
  describe('base', () => {
    testFunc({
      dir: 'base'
    })
  })

  describe('option', () => {
    testFunc({
      dir: 'option'
    })
  })

  describe('extensions', () => {
    testFunc({
      dir: 'extensions',
      runAtFirstAndOnce() {
        setExtensions()
      }
    })

    testFunc({
      dir: 'unset-extensions',
      runAtFirstAndOnce() {
        unsetExtensions()
      }
    })

    it('no-duplicate-rule', function() {
      const testRegex: RegExp = /^\n$/

      Smarkdown.setRule(testRegex, () => 'old')
      Smarkdown.setRule(testRegex, () => 'new')

      expect(Smarkdown.BlockLexer.blockRenderers[0].renderer()).toEqual('new')
      expect(Smarkdown.BlockLexer.blockRenderers.length).toBe(1)
    })
  })
})
