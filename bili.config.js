module.exports = {
  input: 'src/index.ts',
  format: ['es', 'umd', 'umd-min'],
  sizeLimit: {
    'es': '15KB',
    'umd': '16KB',
    'umd-min': '10KB'
  }
}