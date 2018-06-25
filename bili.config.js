module.exports = {
  banner: true,
  input: 'src/index.ts',
  format: ['es', 'umd', 'umd-min'],
  sizeLimit: {
    'es': '14KB',
    'umd': '15KB',
    'umd-min': '9KB'
  }
}