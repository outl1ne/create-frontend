module.exports = {
  ...require('./eslint-config-vanilla'),
  extends: ['@optimistdigital/eslint-config-rules/react', 'prettier'],
  rules: {
    'react/jsx-indent': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['import', 'react', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      generators: false,
      objectLiteralDuplicateProperties: false,
      jsx: true,
    },
  },
};
