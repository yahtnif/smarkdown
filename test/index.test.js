const fs = require('fs-extra')
const { expect } = require('chai')
const Smarkdown = require('../dist/smarkdown')
const { setExtensions, unsetExtensions } = require('./extensions')
const { testFunc } = require('./utils')

global.fs = fs
global.expect = expect
global.Smarkdown = Smarkdown

describe('Smarkdown', () => {
  describe('base', () => {
    testFunc({
      dir: 'test/base'
    })
  })

  describe('options', () => {
    testFunc({
      dir: 'test/options'
    })
  })

  describe('extensions', () => {
    testFunc({
      dir: 'test/extensions',
      runAtFirstAndOnce() {
        setExtensions()
      }
    })

    testFunc({
      title: 'unset',
      dir: 'test/unset-extensions',
      runAtFirstAndOnce() {
        unsetExtensions()
      }
    })

    it('no-duplicate', function() {
      const testRegex = /^\n$/

      Smarkdown.setRule(testRegex, () => 'old')
      Smarkdown.setRule(testRegex, () => 'new')

      expect(Smarkdown.BlockLexer.blockRenderers[0].renderer()).to.equal('new')
      expect(Smarkdown.BlockLexer.blockRenderers.length).to.equal(1)
    })
  })
})