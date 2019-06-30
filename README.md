<div align="center">
	<div>
		<img width="300" src="https://github.com/yahtnif/static/raw/master/logo/smarkdown.svg?sanitize=true" alt="smarkdown">
	</div>
</div>

[![npm](https://badgen.net/npm/v/smarkdown)](https://www.npmjs.com/package/smarkdown)
[![gzip size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/smarkdown/dist/smarkdown.min.js?compression=gzip)](https://cdn.jsdelivr.net/npm/smarkdown/dist/smarkdown.min.js)
[![install size](https://badgen.net/packagephobia/install/smarkdown)](https://packagephobia.now.sh/result?p=smarkdown)
[![downloads](https://badgen.net/npm/dt/smarkdown)](https://www.npmjs.com/package/smarkdown)
[![Build Status](https://travis-ci.org/yahtnif/smarkdown.svg?branch=master)](https://travis-ci.org/yahtnif/smarkdown)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

> Markdown parser, simplicity and extensibility. Fork of [marked](https://github.com/markedjs/marked) and [marked-ts](https://github.com/KostyaTretyak/marked-ts).

## Features

- **Awesome:** ES6, TypeScript, Rollup, Jest...
- **Extensible:** Add your own [extensions](#extensions)
- **Fast:** Low-level compiler for parsing markdown without caching or blocking for long periods of time
- **Lightweight:** It's 9kb of minified and gzipped

## Table of contents

- [Install](#install)
- [Usage](#usage)
- [Syntax highlighting](./docs/syntax-highlighting.md)
- [Options](./docs/options.md)
- [Extension](./docs/extension.md)
- [Renderer](./docs/renderer.md)
- [Comparison](#comparison)
- [License](#license)

## Install

```sh
yarn add smarkdown
# or
npm install smarkdown
```

**browser (CDN):** [jsDelivr](https://www.jsdelivr.com/package/npm/smarkdown) | [unpkg](https://unpkg.com/smarkdown/)

## Usage

Import the library as a module:

```js
const Smarkdown = require('smarkdown')
```

Or import the library with a script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/smarkdown/dist/smarkdown.min.js"></script>
```

Example:

```js
// Reset options
// Smarkdown.resetOptions()

// Set options
Smarkdown.setOptions({
  breaks: true
})

const str = 'I am using **Smarkdown**.'

console.log(Smarkdown.parse(str))
// <p>I am using <strong>Smarkdown</strong>.</p>

console.log(Smarkdown.parse(str, { nop: true }))
// I am using <strong>Smarkdown</strong>.
```

## Comparison

|                    |                                                                                      Smarkdown                                                                                       |                                                                             Marked                                                                             |                                                                                         markdown-it                                                                                          |
| :----------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|      Version       |                                                [![npm](https://badgen.net/npm/v/smarkdown)](https://www.npmjs.com/package/smarkdown)                                                 |                                        [![npm](https://badgen.net/npm/v/marked)](https://www.npmjs.com/package/marked)                                         |                                                  [![npm](https://badgen.net/npm/v/markdown-it)](https://www.npmjs.com/package/markdown-it)                                                   |
| Minified & Gzipped | [![gzip size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/smarkdown/dist/smarkdown.min.js?compression=gzip)](https://cdn.jsdelivr.net/npm/smarkdown/dist/smarkdown.min.js) | [![gzip size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/marked/marked.min.js?compression=gzip)](https://cdn.jsdelivr.net/npm/marked/marked.min.js) | [![gzip size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/markdown-it/dist/markdown-it.min.js?compression=gzip)](https://cdn.jsdelivr.net/npm/markdown-it/dist/markdown-it.min.js) |

## License

[Anti 996](./LICENSE)
