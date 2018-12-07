module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: ['**/__tests__/**/*.(js|ts)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
}
