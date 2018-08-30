const klawSync = require('klaw-sync')
const fs = require('fs-extra')
const { expect } = require('chai')
const Smarkdown = require('../dist/smarkdown')

const files = klawSync('test/tasks', { nodir: true })

describe('Smarkdown', function() {
  for (const file of files) {
    const data = fs.readFileSync(file.path, 'utf-8')
    const filename = file.path.split('/').slice(-1)[0]
    const [text, html] = data.split(/\n{3}/)

    it(filename, function() {
      expect(Smarkdown.parse(text)).to.equal(html)
    })
  }
})