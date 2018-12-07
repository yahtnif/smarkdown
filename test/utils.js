const klawSync = require('klaw-sync')
const JSON5 = require('json5')

exports.testFunc = function ({ dir, runAtFirstAndOnce, title }) {
  const files = klawSync(dir, { nodir: true })

  for (const file of files) {
    const filename = file.path.split('/').slice(-1)[0]

    const data = fs.readFileSync(file.path, 'utf-8')

    let [option, text] = data.split('\n===\n')

    if (text) {
      option = option
        .trim()
        .split(/\n+/)
        .map(s => s + ',')
        .join('\n')
      option = JSON5.parse(`{${option}}`)
    } else {
      text = option
      option = null
    }

    let [actual, expected] = text.split(/\n{4,}/)

    let testTitle = title ? `${title} - ${filename}` : filename

    it(testTitle, function() {
      if (runAtFirstAndOnce) {
        runAtFirstAndOnce()
        runAtFirstAndOnce = null
      }
      expect(Smarkdown.parse(actual, option).trim()).to.equal(expected.trim())
    })
  }
}