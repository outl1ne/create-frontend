module.exports = {
  extends: ['@optimistdigital/eslint-config-rules', 'prettier'],
  rules: {
    'flowtype/define-flow-type': 1,
    'react/jsx-indent': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  parser: 'babel-eslint',
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['import', 'react', 'flowtype', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      generators: false,
      objectLiteralDuplicateProperties: false,
      jsx: true,
    },
  },
  globals: {
    __DEVELOPMENT__: true,
    __PRODUCTION__: true,
    __DEBUG__: true,
    __OCF_MANIFEST_PATH__: true,
    __TARGET__: true,
  },
};
