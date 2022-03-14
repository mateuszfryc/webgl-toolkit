module.exports = {
  env: {
    browser: true,
    es2021: true,
    // this is needed to remove the 'module not defined' warn at the top of this file
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'linebreak-style': ['warn', 'windows'],
    indent: ['warn', 2],
    quotes: ['warn', 'single'],
    semi: ['warn', 'always'],
  },
};
