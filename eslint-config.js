module.exports = {
  ...require('./eslint-config-vanilla'),
  extends: [
    '@optimistdigital/eslint-config-rules/react',
    'prettier',
  ],
  rules: {
    'arrow-body-style': 0,
    'react/jsx-indent': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    // Turning jsx-a11y rules into warnings so they don't start blocking the build
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/anchor-has-content': 'warn',
    'jsx-a11y/anchor-is-valid': [
      'warn',
      {
        aspects: ['noHref', 'invalidHref'],
      },
    ],
    'jsx-a11y/aria-activedescendant-has-tabindex': 'warn',
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-proptypes': 'warn',
    'jsx-a11y/aria-role': ['warn', { ignoreNonDOM: true }],
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/heading-has-content': 'warn',
    'jsx-a11y/iframe-has-title': 'warn',
    'jsx-a11y/img-redundant-alt': 'warn',
    'jsx-a11y/no-access-key': 'warn',
    'jsx-a11y/no-distracting-elements': 'warn',
    'jsx-a11y/no-redundant-roles': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn',
    'jsx-a11y/scope': 'warn',
    'jsx-a11y/no-autofocus': 'off',
    'jsx-a11y/autocomplete-valid': 'warn',
    'jsx-a11y/label-has-associated-control': 'warn',
    // Potential jsx-a11y rules we might want to enable to be more strict:
    // 'jsx-a11y/click-events-have-key-events': 'warn',
    // 'jsx-a11y/control-has-associated-label': 'warn',
    // 'jsx-a11y/mouse-events-have-key-events': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['import', 'react', 'react-hooks', 'jsx-a11y'],
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
