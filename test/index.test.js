const Smarkdown = require('../dist/smarkdown')
const setExtensions = require('./set-extensions')
const { testFunc } = require('./utils')

describe('Smarkdown', () => {
  describe('base', () => {
    testFunc({
      dir: 'test/base',
      Smarkdown
    })
  })

  describe('advanced', () => {
    testFunc({
      dir: 'test/advanced',
      Smarkdown
    })
  })

  describe('extensions', () => {
    testFunc({
      dir: 'test/extensions',
      Smarkdown: setExtensions(Smarkdown)
    })
  })
})