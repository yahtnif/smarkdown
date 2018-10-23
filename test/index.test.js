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
  })

  describe('unset-extensions', () => {
    testFunc({
      dir: 'test/unset-extensions',
      runAtFirstAndOnce() {
        unsetExtensions()
      }
    })
  })
})