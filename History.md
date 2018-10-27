# Changelog


## Unreleased


## 0.6.1 / 2018-10-23

### Added

* Add extension examples: small text, large text

### Fixed

* Fix breakText: escape RegExp special characters


## 0.6.0 / 2018-10-23

### Added

* Allow unsetting rules
* Add resetOptions
* Add test: footnote

### Changed

* Move tables into gfm


## 0.5.1 / 2018-10-22

### Fixed

* Fix breaks: requires 'gfm' enable


## 0.5.0 / 2018-10-22

### Changed

* Update codes


## 0.4.9 / 2018-10-22

### Changed

* Make URL handling consistent between links and images, marked#1359
* Update tsconfig


## 0.4.8 / 2018-10-19

### Fixed

* Fix noopExec: match nothing


## 0.4.7 / 2018-10-19

### Added

* Add test: extensions
* Add test: option

### Changed

* Rename SmarkdownOptions to Options
* Reduce <any>
* Update rules type

### Fixed

* Fix breakText when a marked subexpression at the beginning
* Fix emphasis closing by single _ (part of left-flanking run), marked#1351


## 0.4.6 / 2018-10-14

### Added

* Add more tests
* Add banner

### Fixed

* Fix TokenType


## 0.4.5 / 2018-09-30

### Fixed

* Fix loose lists


## 0.4.4 / 2018-09-27

### Added

* Add size-limit

### Fixed

* Fix inline code regex, marked#1337


## 0.4.3 / 2018-09-19

### Fixed

* Fix auto-linking email, marked#1338


## 0.4.2 / 2018-09-18

### Fixed

* Fix typographic substitution in (pre|code|kbd|script) blocks when smartypants=true, marked#1335


## 0.4.1 / 2018-08-30

### Changed

* Update rollup


## 0.4.0 / 2018-08-30

### Changed

* Update export, only export: Smarkdown, Renderer
* Revert: keep strikethrough text wrapped in two tildes for GFM
* Use textBreak instead of inlineSplitChars


## 0.3.0 / 2018-08-29

### Added

* Add .travis.yml

### Fixed

* Fix breaks in getRulesExtra


## 0.2.0 / 2018-08-25

### Changed

* Rename isNoP to nop


## 0.1.7 / 2018-08-24

### Added

* Add options to setBlockRule

### Changed

* Change InlineRuleOption:priority to Number


## 0.1.6 / 2018-08-23

### Fixed

* Fix getOptions


## 0.1.5 / 2018-08-21

### Changed

* Update tablecell
* Add hard line break when backslash at EOL, marked#1303
* Loose lists, marked#1304
* Enable CommonMark spec 468, marked#1305
* Updated inline grammar regexes for strong and em, marked#1315

### Security

* Security: use rtrim, not unsafe /X+$/, marked#1260

### Fixed

* Strikethrough support for GFM, marked#1258
* Fix gfm extended autolinking requiring multiple backpedals, marked #1293


## 0.1.4 / 2018-07-04

### Changed

* Setting headerId default to false

### Fixed

* Fix renderer options


## 0.1.3 / 2018-07-01

### Fixed

* GFM table compliance
* Fix issues link references and prototypes, marked#1299


## 0.1.2 / 2018-06-24

### Added

* Add getOptions


## 0.1.1 / 2018-06-24

### Changed

* Allow passing Renderer without new in setOptions