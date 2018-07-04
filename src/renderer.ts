import { SmarkdownOptions, Align } from './interfaces'

export class Renderer {
  protected options: SmarkdownOptions
  _headings: string[]
  _footnotes: string[]

  constructor(options?: SmarkdownOptions) {
    this.options = options
    this._headings = []
    this._footnotes = []
  }

  code(code: string, lang?: string, escaped?: boolean): string {
    if (this.options.highlight) {
      const out = this.options.highlight(code, lang)

      if (out != null && out !== code) {
        escaped = true
        code = out
      }
    }

    if (!lang) {
      return `<pre><code>${escaped ? code : this.options.escape(code, true)}</code></pre>`
    }

    const dataLang = this.options.langAttribute
      ? ` data-lang="${this.options.escape(lang, true)}"`
      : ''

    return `<pre${dataLang}><code class="${this.options.langPrefix}${this.options.escape(
      lang,
      true
    )}">${escaped ? code : this.options.escape(code, true)}</code></pre>
`
  }

  blockquote(quote: string): string {
    return `<blockquote>
${quote}</blockquote>
`
  }

  html(html: string): string {
    return html
  }

  heading(text: string, level: number, raw: string, ends: string): string {
    const { headerId } = this.options
    let idHtml = ''
    if (
      (headerId === true) ||
      (headerId === 'off' && ends) ||
      (headerId === 'on' && !ends)
    ) {
      let id: string = this.options.slug(raw)
      const count = this._headings.filter((h) => h === raw).length
      if (count > 0) {
        id += `-${count}`
      }
      idHtml = ` id="${this.options.headerPrefix}${id}"`
      this._headings.push(raw)
    }

    return `<h${level}${idHtml}>${text}</h${level}>
`
  }

  hr(): string {
    return this.options.xhtml ? '<hr/>\n' : '<hr>\n'
  }

  list(body: string, ordered?: boolean, start?: string | number, isTaskList?: boolean): string {
    const type = ordered ? 'ol' : 'ul'
    const startatt = (ordered && start !== 1) ? (' start="' + start + '"') : ''

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
    flags: { header?: boolean; align?: Align }
  ): string {
    const type = flags.header ? 'th' : 'td'
    const tag = flags.align
      ? '<' + type + ' align="' + flags.align + '">'
      : '<' + type + '>'
    return tag + content + '</' + type + '>\n'
  }

  //*** Inline level renderer methods. ***

  strong(text: string): string {
    return `<strong>${text}</strong>`
  }

  em(text: string): string {
    return `<em>${text}</em>`
  }

  codespan(text: string): string {
    return `<code>${text}</code>`
  }

  br(): string {
    return this.options.xhtml ? '<br/>' : '<br>'
  }

  del(text: string): string {
    return `<del>${text}</del>`
  }

  fnref(refname: string): string {
    if (!this._footnotes.includes(refname)) {
      this._footnotes.push(refname)
    }

    return `<sup id="fnref:${refname}"><a href="#fn:${refname}" class="footnote-ref" role="doc-noteref">${
      this._footnotes.length
    }</a></sup>`
  }

  footnote(footnotes: { [key: string]: string }): string {
    let out = `<div class="footnotes" role="doc-endnotes">${this.hr()}<ol>`

    for (let refname of this._footnotes) {
      out += `<li id="fn:${refname}" role="doc-endnote"><span class="cite-text">${footnotes[
        refname
      ] ||
        '?'}</span><a href="#fnref:${refname}" class="footnote-backref" role="doc-backlink">&#8617;</a></li>`
    }

    out += '</ol></div>'

    this._footnotes = []

    return out
  }

  link(href: string, title: string, text: string): string {
    if (this.options.sanitize) {
      let prot: string

      try {
        prot = decodeURIComponent(this.options.unescape(href))
          .replace(/[^\w:]/g, '')
          .toLowerCase()
      } catch (e) {
        return text
      }

      if (
        prot.indexOf('javascript:') === 0 ||
        prot.indexOf('vbscript:') === 0 ||
        prot.indexOf('data:') === 0
      ) {
        return text
      }
    }

    if (this.options.baseUrl) {
      href = this.options.resolveUrl(this.options.baseUrl, href)
    }

    try {
      href = encodeURI(href).replace(/%25/g, '%')
    } catch (e) {
      return text
    }
    let out = '<a href="' + this.options.escape(href) + '"'

    if (title) {
      out += ' title="' + title + '"'
    }

    const { linksInNewTab, trimLinkText } = this.options
    const targetBlank =
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

  image(href: string, title: string, text: string): string {
    if (this.options.baseUrl) {
      href = this.options.resolveUrl(this.options.baseUrl, href)
    }

    let out = '<img src="' + href + '" alt="' + text + '"'

    if (title) {
      out += ' title="' + title + '"'
    }

    out += this.options.xhtml ? '/>' : '>'

    return out
  }

  text(text: string): string {
    return text
  }
}
export class TextRenderer {
  strong(text: string): string {
    return text
  }

  em(text: string): string {
    return text
  }

  codespan(text: string): string {
    return text
  }

  del(text: string): string {
    return text
  }

  text(text: string): string {
    return text
  }

  link(href: string, title: string, text: string): string {
    return '' + text
  }

  image(href: string, title: string, text: string): string {
    return '' + text
  }

  br() {
    return ''
  }
}
