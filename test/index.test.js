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

  describe('advanced', () => {
    testFunc({
      dir: 'test/advanced'
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
      const testRegex = /^$/

      Smarkdown.setBlockRule(testRegex, () => 'old')
      Smarkdown.setBlockRule(testRegex, () => 'new')

      expect(Smarkdown.blockRenderers[0].renderer()).to.equal('new')
      expect(Smarkdown.blockRenderers.length).to.equal(1)
    })
  })
})