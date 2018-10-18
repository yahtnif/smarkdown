import { EmptyObject } from './interfaces'

const escapeTest = /[&<>"']/
const escapeReplace = /[&<>"']/g
const replacements: EmptyObject = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/
const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g
const regUnescape = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi

export function escape(html: string, encode?: boolean) {
  if (encode) {
    if (escapeTest.test(html)) {
      return html.replace(escapeReplace, (ch: string) => replacements[ch])
    }
  } else if (escapeTestNoEncode.test(html)) {
    return html.replace(
      escapeReplaceNoEncode,
      (ch: string) => replacements[ch]
    )
  }

  return html
}

export function unescape(html: string) {
  // Explicitly match decimal, hex, and named HTML entities
  return html.replace(regUnescape, function(_, n) {
    n = n.toLowerCase()

    if (n === 'colon') return ':'

    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1))
    }

    return ''
  })
}

const regHtmlTags: RegExp = /<(?:.|\n)*?>/gm
const regSpecialChars: RegExp = /[!\"#$%&'\(\)\*\+,\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g
const regDotSpace: RegExp = /(\s|\.)/g

export function slug(str: string) {
  return (
    str
      // Remove html tags
      .replace(regHtmlTags, '')
      // Remove special characters
      .replace(regSpecialChars, '')
      // Replace dots and spaces with a separator
      .replace(regDotSpace, '-')
      // Make the whole thing lowercase
      .toLowerCase()
  )
}

// Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
// /c*$/ is vulnerable to REDOS.
// invert: Remove suffix of non-c chars instead. Default falsey.
export function rtrim(str: string, c: string, invert: boolean = false) {
  if (str.length === 0) {
    return ''
  }

  // Length of suffix matching the invert condition.
  let suffLen = 0

  // Step left until we fail to match the invert condition.
  while (suffLen < str.length) {
    const currChar = str.charAt(str.length - suffLen - 1)
    if (currChar === c && !invert) {
      suffLen++
    } else if (currChar !== c && invert) {
      suffLen++
    } else {
      break
    }
  }

  return str.substr(0, str.length - suffLen)
}

const regOriginIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i
const regNoLastSlashUrl = /^[^:]+:\/*[^/]*$/
const baseUrls: EmptyObject = {}

export function resolveUrl(base: string, href: string) {
  if (regOriginIndependentUrl.test(href)) {
    return href
  }

  const baseUrlsKey = ' ' + base
  if (!baseUrls[baseUrlsKey]) {
    // we can ignore everything in base after the last slash of its path component,
    // but we might need to add _that_
    // https://tools.ietf.org/html/rfc3986#section-3
    if (regNoLastSlashUrl.test(base)) {
      baseUrls[baseUrlsKey] = base + '/'
    } else {
      baseUrls[baseUrlsKey] = rtrim(base, '/', true)
    }
  }

  base = baseUrls[baseUrlsKey]

  if (href.slice(0, 2) === '//') {
    return base.replace(/:[\s\S]*/, ':') + href
  } else if (href.charAt(0) === '/') {
    return base.replace(/(:\/*[^/]*)[\s\S]*/, '$1') + href
  } else {
    return base + href
  }
}

export class ExtendRegexp {
  private source: string
  private flags: string

  constructor(regex: RegExp, flags: string = '') {
    this.source = regex.source
    this.flags = flags
  }

  /**
   * Extend regular expression.
   *
   * @param groupName Regular expression for search a group name.
   * @param groupRegexp Regular expression of named group.
   */
  setGroup(groupName: RegExp | string, groupRegexp: RegExp | string): this {
    let newRegexp: string =
      typeof groupRegexp == 'string' ? groupRegexp : groupRegexp.source
    newRegexp = newRegexp.replace(/(^|[^\[])\^/g, '$1')

    // Extend regexp.
    this.source = this.source.replace(groupName, newRegexp)
    return this
  }

  /**
   * Returns a result of extending a regular expression.
   */
  getRegex(): RegExp {
    return new RegExp(this.source, this.flags)
  }
}

// from a part of this.rules.text
export const defaultTextBreak = '\\<![`*~'

export const noopExec = /^$/