const klawSync = require('klaw-sync')
const fs = require('fs-extra')
const { expect } = require('chai')
const { Smarkdown, SmarkdownOptions } = require('../dist/smarkdown')

function M(str, options) {
  return Smarkdown.parse(str, options)
}

const files = klawSync('test/tasks', { nodir: true })

describe('Smarkdown', function() {
  for (const file of files) {
    const data = fs.readFileSync(file.path, 'utf-8')
    const filename = file.path.split('/').slice(-1)[0]
    const [text, html] = data.split(/\n{3}/)

    it(filename, function() {
      expect(M(text)).to.equal(html)
    })
  }
})