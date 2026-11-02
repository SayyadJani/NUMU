import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import baseConfig from './base.js';

/**
 * ESLint flat config for internal React library packages.
 * @type {import("typescript-eslint").Config}
 */
const config = tseslint.config(...baseConfig, {
  plugins: {
    react: pluginReact,
    'react-hooks': pluginReactHooks,
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    ...pluginReact.configs.recommended.rules,
    ...pluginReactHooks.configs.recommended.rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
});

export default config;
