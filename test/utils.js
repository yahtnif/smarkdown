const klawSync = require('klaw-sync')
const fs = require('fs-extra')
const { expect } = require('chai')
const JSON5 = require('json5')

exports.testFunc = function ({ dir, Smarkdown }) {
  const files = klawSync(dir, { nodir: true })

  for (const file of files) {
    const filename = file.path.split('/').slice(-1)[0]

    const data = fs.readFileSync(file.path, 'utf-8')

    let [options, text] = data.split('\n===\n')

    if (text) {
      options = options
        .trim()
        .split(/\n+/)
        .map(s => s + ',')
        .join('\n')
      options = JSON5.parse(`{${options}}`)
    } else {
      text = options
      options = null
    }

    let [actual, expected] = text.split(/\n{4,}/)

    if (!expected.endsWith('\n')) {
      expected += '\n'
    }

    it(filename, function() {
      expect(Smarkdown.parse(actual, options)).to.equal(expected)
    })
  }
}