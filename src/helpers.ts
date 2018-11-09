import { EmptyObject } from './interfaces'

const escapeTestRegex: RegExp = /[&<>"']/
const escapeReplaceRegex: RegExp = /[&<>"']/g
const replacements: EmptyObject = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const escapeTestNoEncodeRegex: RegExp = /[<>"']|&(?!#?\w+;)/
const escapeReplaceNoEncodeRegex: RegExp = /[<>"']|&(?!#?\w+;)/g
const unescapeRegex: RegExp = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi

// Escape HTML entities.
export function escape(html: string, encode?: boolean): string {
  if (encode) {
    if (escapeTestRegex.test(html)) {
      return html.replace(escapeReplaceRegex, (ch: string) => replacements[ch])
    }
  } else if (escapeTestNoEncodeRegex.test(html)) {
    return html.replace(escapeReplaceNoEncodeRegex, (ch: string) => replacements[ch])
  }

  return html
}

// Unescape HTML entities.
export function unescape(html: string): string {
  // Explicitly match decimal, hex, and named HTML entities
  return html.replace(unescapeRegex, function(_, n) {
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

const htmlTagsRegex: RegExp = /<(?:.|\n)*?>/gm
const specialCharsRegex: RegExp = /[!\"#$%&'\(\)\*\+,\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g
const dotSpaceRegex: RegExp = /(\s|\.)/g

export function slug(str: string): string {
  return str
    // Remove html tags
    .replace(htmlTagsRegex, '')
    // Remove special characters
    .replace(specialCharsRegex, '')
    // Replace dots and spaces with a separator
    .replace(dotSpaceRegex, '-')
    // Make the whole thing lowercase
    .toLowerCase()
}

// Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
// /c*$/ is vulnerable to REDOS.
// invert: Remove suffix of non-c chars instead. Default falsey.
export function rtrim(str: string, c: string, invert: boolean = false): string {
  if (str.length === 0) {
    return ''
  }

  // Length of suffix matching the invert condition.
  let suffLen: number = 0

  // Step left until we fail to match the invert condition.
  while (suffLen < str.length) {
    const currChar: string = str.charAt(str.length - suffLen - 1)
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

const originIndependentUrlRegex: RegExp = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i
const noLastSlashUrlRegex: RegExp = /^[^:]+:\/*[^/]*$/
const baseUrls: EmptyObject = {}

// Render image/link URLs relative to a base url.
export function resolveUrl(base: string, href: string): string {
  if (originIndependentUrlRegex.test(href)) {
    return href
  }

  const baseUrlsKey: string = ' ' + base
  if (!baseUrls[baseUrlsKey]) {
    // we can ignore everything in base after the last slash of its path component,
    // but we might need to add _that_
    // https://tools.ietf.org/html/rfc3986#section-3
    if (noLastSlashUrlRegex.test(base)) {
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

export function cleanUrl(sanitize: boolean, base: string, href: string): string {
  if (sanitize) {
    let prot: string

    try {
      prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase()
    } catch (e) {
      return null
    }

    if (
      prot.indexOf('javascript:') === 0 ||
      prot.indexOf('vbscript:') === 0 ||
      prot.indexOf('data:') === 0
    ) {
      return null
    }
  }
  if (base && !originIndependentUrlRegex.test(href)) {
    href = resolveUrl(base, href)
  }
  try {
    href = encodeURI(href).replace(/%25/g, '%')
  } catch (e) {
    return null
  }
  return href
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
      typeof groupRegexp === 'string' ? groupRegexp : groupRegexp.source

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

// from a part of InlineLexer.rules.text
export const defaultTextBreak: string = '\\<![`*~'

// match nothing
export const noopRegex: RegExp = /S^/

// Escape RegExp special characters
const escapeCharsRegex: RegExp = /[-|\\{}()[\]^$+*?.]/g

export function escapeStringRegex(str: string): string {
  return str.replace(escapeCharsRegex, '\\$&')
}

export function getRuleType(regExp: RegExp): string {
  return regExp.toString()
}

const breakCharRegex: RegExp = /^\/\^\(*\\?(.)/

export function getBreakChar(regExp: RegExp): string {
  return regExp.toString().match(breakCharRegex)[1]
}