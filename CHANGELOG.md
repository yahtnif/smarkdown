# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

- Make code fences compliant (+ fix marked#1058). marked#1387
- Fix handling of adjacent lists. marked#684
- Limit ordered list marker length. marked#1391
- Fix empty list items. marked#1395
- Fix strong tag. marked#1400

## [0.10.0](https://github.com/yahtnif/smarkdown/releases/tag/v0.10.0) - 2018-12-28

### Changed

- Auto resolve `regExp` to startsWith `^` #setRule
- Revert: setOption -> setOptions, resetOption -> resetOptions

## [0.9.0](https://github.com/yahtnif/smarkdown/releases/tag/v0.9.0) - 2018-12-07

### Added

- Jest

### Changed

- Rename: setOptions -> setOption, resetOptions -> resetOption

### Fixed

- Make autolinks case insensitive. marked#1384
- Fix bold around autolink email address. marked#1385

## [0.8.0](https://github.com/yahtnif/smarkdown/releases/tag/v0.8.0) - 2018-12-06

### Added

- Add setRule and unsetRule to InlineLexer and BlockLexer
- Export: BlockLexer, InlineLexer, Parser

### Changed

- Remove: setBlockRule, unsetBlockRule, setInlineRule, unsetInlineRule

### Fixed

- Fix emphasis followed by a punctuation. marked#1383
- Ensure RegExp in setRule MUST start with '^'

## [0.7.0](https://github.com/yahtnif/smarkdown/releases/tag/v0.7.0) - 2018-12-05

### Added

- Add `setRule` and `unsetRule`

### Changed

- Use indexOf instead of includes
- Use .source instead of .toString()
- Update setRules

## [0.6.3](https://github.com/yahtnif/smarkdown/releases/tag/v0.6.3) - 2018-11-12

### Fixed

- Fix continue in nested loops

## [0.6.2](https://github.com/yahtnif/smarkdown/releases/tag/v0.6.2) - 2018-10-23

### Changed

- Ensure unique rules

## [0.6.1](https://github.com/yahtnif/smarkdown/releases/tag/v0.6.1) - 2018-10-23

### Added

- Add extension examples: small text, large text

### Fixed

- Fix breakText: escape RegExp special characters

## [0.6.0](https://github.com/yahtnif/smarkdown/releases/tag/v0.6.0) - 2018-10-23

### Added

- Allow unsetting rules
- Add resetOptions
- Add test: footnote

### Changed

- Move tables into gfm

## [0.5.1](https://github.com/yahtnif/smarkdown/releases/tag/v0.5.1) - 2018-10-22

### Fixed

- Fix breaks: requires 'gfm' enable

## [0.5.0](https://github.com/yahtnif/smarkdown/releases/tag/v0.5.0) - 2018-10-22

### Changed

- Update codes

## [0.4.9](https://github.com/yahtnif/smarkdown/releases/tag/v0.4.9) - 2018-10-22

### Changed

- Make URL handling consistent between links and images. marked#1359
- Update tsconfig

## [0.4.8](https://github.com/yahtnif/smarkdown/releases/tag/v0.4.8) - 2018-10-19

### Fixed

- Fix noopExec: match nothing

## [0.4.7](https://github.com/yahtnif/smarkdown/releases/tag/v0.4.7) - 2018-10-19

### Added

- Add test: extensions
- Add test: option

### Changed

- Rename SmarkdownOptions to Options
- Reduce <any>
- Update rules type

### Fixed

- Fix breakText when a marked subexpression at the beginning
- Fix emphasis closing by single \_ (part of left-flanking run). marked#1351

## [0.4.6](https://github.com/yahtnif/smarkdown/releases/tag/v0.4.6) - 2018-10-14

### Added

- Add more tests
- Add banner

### Fixed

- Fix TokenType

## [0.4.5](https://github.com/yahtnif/smarkdown/releases/tag/v0.4.5) - 2018-09-30

### Fixed

- Fix loose lists

## [0.4.4](https://github.com/yahtnif/smarkdown/releases/tag/v0.4.4) - 2018-09-27

### Added

- Add size-limit

### Fixed

- Fix inline code regex. marked#1337

## [0.4.3](https://github.com/yahtnif/smarkdown/releases/tag/v0.4.3) - 2018-09-19

### Fixed

- Fix auto-linking email. marked#1338

## [0.4.2](https://github.com/yahtnif/smarkdown/releases/tag/v0.4.2) - 2018-09-18

### Fixed

- Fix typographic substitution in (pre|code|kbd|script) blocks when smartypants=true. marked#1335

## [0.4.1](https://github.com/yahtnif/smarkdown/releases/tag/v0.4.1) - 2018-08-30

### Changed

- Update rollup

## [0.4.0](https://github.com/yahtnif/smarkdown/releases/tag/v0.4.0) - 2018-08-30

### Changed

- Update export, only export: Smarkdown, Renderer
- Revert: keep strikethrough text wrapped in two tildes for GFM
- Use textBreak instead of inlineSplitChars

## [0.3.0](https://github.com/yahtnif/smarkdown/releases/tag/v0.3.0) - 2018-08-29

### Added

- Add .travis.yml

### Fixed

- Fix breaks in getRulesExtra

## [0.2.0](https://github.com/yahtnif/smarkdown/releases/tag/v0.2.0) - 2018-08-25

### Changed

- Rename isNoP to nop

## [0.1.7](https://github.com/yahtnif/smarkdown/releases/tag/v0.1.7) - 2018-08-24

### Added

- Add options to setBlockRule

### Changed

- Change InlineRuleOption:priority to Number

## [0.1.6](https://github.com/yahtnif/smarkdown/releases/tag/v0.1.6) - 2018-08-23

### Fixed

- Fix getOptions

## [0.1.5](https://github.com/yahtnif/smarkdown/releases/tag/v0.1.5) - 2018-08-21

### Changed

- Update tablecell
- Add hard line break when backslash at EOL. marked#1303
- Loose lists. marked#1304
- Enable CommonMark spec 468. marked#1305
- Updated inline grammar regexes for strong and em. marked#1315

### Security

- Security: use rtrim, not unsafe /X+\$/. marked#1260

### Fixed

- Strikethrough support for GFM. marked#1258
- Fix gfm extended autolinking requiring multiple backpedals. marked #1293

## [0.1.4](https://github.com/yahtnif/smarkdown/releases/tag/v0.1.4) - 2018-07-04

### Changed

- Setting headerId default to false

### Fixed

- Fix renderer options

## [0.1.3](https://github.com/yahtnif/smarkdown/releases/tag/v0.1.3) - 2018-07-01

### Fixed

- GFM table compliance
- Fix issues link references and prototypes. marked#1299

## [0.1.2](https://github.com/yahtnif/smarkdown/releases/tag/v0.1.2) - 2018-06-24

### Added

- Add getOptions

## [0.1.1](https://github.com/yahtnif/smarkdown/releases/tag/v0.1.1) - 2018-06-24

### Changed

- Allow passing Renderer without new in setOptions
