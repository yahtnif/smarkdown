# Options

```js
// Reset options
// Smarkdown.resetOptions()

// Set options
Smarkdown.setOptions({
  breaks: true
})
```

---

|     Name      |        Type         |          Default          |                                                                                                          Note                                                                                                           |
| :-----------: | :-----------------: | :-----------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|    baseUrl    |       String        |           null            |                                                                                           A prefix url for any relative link.                                                                                           |
|    breaks     |       Boolean       |           false           |                                                                  If true, add `<br>` on a single line break (copies GitHub). Requires `gfm` be `true`.                                                                  |
| disabledRules |        Array        |            []             |                                                                        If set to `['lheading']`, will disable headers of an underline-ish style.                                                                        |
|     extra     |       Boolean       |           false           |                                                                                  If true, enable `footnote`. Requires `gfm` be `true`.                                                                                  |
|      gfm      |       Boolean       |           true            |                                                          If true, use approved [GitHub Flavored Markdown (GFM) specification](https://github.github.com/gfm/).                                                          |
|   headerId    |  Boolean \| String  |           false           | Include an `id` attribute when emitting headings.<br>If true, for all headings.<br>If set to `on`, for “non-close” atx-style headings (## h2, etc).<br>If set to `off`, for “close” atx-style headings (## h2 ##, etc). |
| headerPrefix  |       String        |            ''             |                                                                               A string to prefix the id attribute when emitting headings.                                                                               |
|   highlight   |      Function       |  (code, lang) => string   |                                                                  A function to highlight code blocks, see [Syntax highlighting](#syntax-highlighting)                                                                   |
| langAttribute |       Boolean       |           false           |                                                                              If `true`, add `data-lang` attribute to highlight block code.                                                                              |
|  langPrefix   |       String        |        'language-'        |                                                                  A string to prefix the className in a `<code>` block. Useful for syntax highlighting.                                                                  |
| linksInNewTab | Boolean \| Function |           false           |                                                                                            If true, open links in new tabs.                                                                                             |
|    mangle     |       Boolean       |           true            |                                                                      If true, autolinked email address is escaped with HTML character references.                                                                       |
|      nop      |       Boolean       |           false           |                                                                                If `true`, an inline text will not be taken in paragraph.                                                                                |
|   pedantic    |       Boolean       |           false           |                                    If true, conform to the original `markdown.pl` as much as possible. Don't fix original markdown bugs or behavior. Turns off and overrides `gfm`.                                     |
|   renderer    |      Renderer       |         Renderer          |                                                          An object containing functions to render tokens to HTML. See [Renderer](#renderer) for more details.                                                           |
|   sanitize    |       Boolean       |           false           |                                                                 If true, sanitize the HTML passed into `markdownString` with the `sanitizer` function. <br>**Warning**: This feature is deprecated and it should NOT be used as it cannot be considered secure.<br>Instead use a sanitize library, like [DOMPurify](https://github.com/cure53/DOMPurify) (recommended), [sanitize-html](https://github.com/apostrophecms/sanitize-html) or [insane](https://github.com/bevacqua/insane) on the output HTML! |
|   sanitizer   |      Function       |           null            |                                                                              A function to sanitize the HTML passed into `markdownString`.                                                                              |
|    silent     |       Boolean       |           false           |                                                                                    If true, the parser does not throw any exception.                                                                                    |
|     slug      |      Function       | str => built_in_slug(str) |                                                                                    Slugify `id` attribute for heading and footnote.                                                                                     |
|  smartLists   |       Boolean       |           false           |                                                                          If true, use smarter list behavior than those found in `markdown.pl`.                                                                          |
|  smartypants  |       Boolean       |           false           |                                                                     If true, use "smart" typographic punctuation for things like quotes and dashes.                                                                     |
| trimLinkText  |      Function       |           null            |                                                                                               Useful for text truncation.                                                                                               |
|     xhtml     |       Boolean       |           false           |                                                        Self-close the tags for void elements (&lt;br/&gt;, &lt;img/&gt;, etc.) with a "/" as required by XHTML.                                                         |
