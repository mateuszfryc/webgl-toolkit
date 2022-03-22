const WARN = 'warn';

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
    'linebreak-style': [WARN, 'windows'],
    'no-unused-vars': WARN,
    indent: [WARN, 2],
    quotes: [WARN, 'single'],
    semi: [WARN, 'always'],
  },
};
