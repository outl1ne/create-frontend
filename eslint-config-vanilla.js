module.exports = {
  extends: ['@optimistdigital/eslint-config-rules', 'prettier'],
  parser: 'babel-eslint',
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true,
  },
  rules: {
    'arrow-body-style': 0,
  },
  plugins: ['import'],
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      generators: false,
      objectLiteralDuplicateProperties: false,
    },
  },
  globals: {
    __DEVELOPMENT__: true,
    __PRODUCTION__: true,
    __DEBUG__: true,
    __OCF_MANIFEST_PATH__: true,
    __TARGET__: true,
    __USE_STYLED_JSX__: true,
  },
};
