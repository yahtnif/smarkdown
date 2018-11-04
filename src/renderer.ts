import { Options, TablecellFlags } from './interfaces'

export class Renderer {
  private _footnotes: string[] = []
  _headings: string[] = []
  options: Options

  constructor(options?: Options) {
    this.options = options || {}
  }

  //*** Block level renderer methods. ***

  blockquote(quote: string): string {
    return `<blockquote>
${quote}</blockquote>
`
  }

  code(code: string, lang?: string, escaped?: boolean): string {
    if (this.options.highlight) {
      const out: string = this.options.highlight(code, lang)

      if (out != null && out !== code) {
        escaped = true
        code = out
      }
    }

    if (!lang) {
      return `<pre><code>${escaped ? code : this.options.escape(code, true)}</code></pre>`
    }

    const dataLang: string = this.options.langAttribute
      ? ` data-lang="${this.options.escape(lang, true)}"`
      : ''

    return `<pre${dataLang}><code class="${this.options.langPrefix}${this.options.escape(
      lang,
      true
    )}">${escaped ? code : this.options.escape(code, true)}</code></pre>
`
  }

  footnote(footnotes: { [key: string]: string }): string {
    let out: string = `<div class="footnotes" role="doc-endnotes">${this.hr()}<ol>`

    for (const refname of this._footnotes) {
      out += `<li id="fn:${refname}" role="doc-endnote"><span class="cite-text">${footnotes[
        refname
      ] ||
        '?'}</span><a href="#fnref:${refname}" class="footnote-backref" role="doc-backlink">&#8617;</a></li>`
    }

    out += '</ol></div>'

    this._footnotes = []

    return out
  }

  heading(text: string, level: number, raw: string, ends: string): string {
    const { headerId } = this.options
    let attr: string = ''

    if (
      (headerId === true) ||
      (headerId === 'off' && ends) ||
      (headerId === 'on' && !ends)
    ) {
      let id: string = this.options.slug(raw)
      const count: number = this._headings.filter((h) => h === raw).length
      if (count > 0) {
        id += `-${count}`
      }
      attr += ` id="${this.options.headerPrefix}${id}"`
      this._headings.push(raw)
    }

    return `<h${level}${attr}>${text}</h${level}>
`
  }

  hr(): string {
    return this.options.xhtml ? '<hr/>\n' : '<hr>\n'
  }

  html(html: string): string {
    return html
  }

  list(body: string, ordered?: boolean, start?: string | number, isTaskList?: boolean): string {
    const type: string = ordered ? 'ol' : 'ul'
    const startatt: string = (ordered && start !== 1) ? (' start="' + start + '"') : ''

    return `<${type}${startatt}>\n${body}</${type}>\n`
  }

  listitem(text: string, checked?: boolean | null): string {
    return checked === null ? `<li>${text}</li>
` : `<li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox" ${
      checked ? 'checked ' : ''
    } disabled> ${text}</li>
`
  }

  paragraph(text: string): string {
    return `<p>${text}</p>
`
  }

  table(header: string, body: string): string {
    if (body) body = '<tbody>' + body + '</tbody>'

    return `
<table>
<thead>
${header}</thead>
${body}</table>
`
  }

  tablerow(content: string): string {
    return `<tr>
${content}</tr>
`
  }

  tablecell(
    content: string,
    flags: TablecellFlags
  ): string {
    const { header, align } = flags
    const type: string = header ? 'th' : 'td'
    const tag: string = align
      ? '<' + type + ' align="' + align + '">'
      : '<' + type + '>'
    return tag + content + '</' + type + '>\n'
  }

  //*** Inline level renderer methods. ***

  br(): string {
    return this.options.xhtml ? '<br/>' : '<br>'
  }

  codespan(text: string): string {
    return `<code>${text}</code>`
  }

  del(text: string): string {
    return `<del>${text}</del>`
  }

  em(text: string): string {
    return `<em>${text}</em>`
  }

  fnref(refname: string): string {
    if (!this._footnotes.includes(refname)) {
      this._footnotes.push(refname)
    }

    return `<sup id="fnref:${refname}"><a href="#fn:${refname}" class="footnote-ref" role="doc-noteref">${
      this._footnotes.length
    }</a></sup>`
  }

  image(href: string, title: string, text: string): string {
    href = this.options.cleanUrl(this.options.sanitize, this.options.baseUrl, href)

    if (href === null) return text

    let out: string = '<img src="' + href + '" alt="' + text + '"'

    if (title) {
      out += ' title="' + title + '"'
    }

    out += this.options.xhtml ? '/>' : '>'

    return out
  }

  link(href: string, title: string, text: string): string {
    href = this.options.cleanUrl(this.options.sanitize, this.options.baseUrl, href)

    if (href === null) return text

    let out: string = '<a href="' + this.options.escape(href) + '"'

    if (title) {
      out += ' title="' + title + '"'
    }

    const { linksInNewTab, trimLinkText } = this.options
    const targetBlank: boolean =
      linksInNewTab === true ||
      (typeof linksInNewTab === 'function' && linksInNewTab.call(this, href))

    if (typeof targetBlank === 'string') {
      out += targetBlank
    } else if (targetBlank) {
      out += ` target="_blank"`
    }

    if (trimLinkText) {
      text = trimLinkText(text)
    }

    out += '>' + text + '</a>'

    return out
  }

  strong(text: string): string {
    return `<strong>${text}</strong>`
  }

  text(text: string): string {
    return text
  }
}
export class TextRenderer {
  br() {
    return ''
  }

  codespan(text: string): string {
    return text
  }

  del(text: string): string {
    return text
  }

  em(text: string): string {
    return text
  }

  image(href: string, title: string, text: string): string {
    return '' + text
  }

  link(href: string, title: string, text: string): string {
    return '' + text
  }

  strong(text: string): string {
    return text
  }

  text(text: string): string {
    return text
  }
}
