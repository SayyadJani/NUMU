import baseConfig from '@numu/config-eslint/base';

export default [
  ...baseConfig,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
];
