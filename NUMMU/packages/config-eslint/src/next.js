import nextPlugin from '@next/eslint-plugin-next';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import baseConfig from './base.js';

/**
 * ESLint flat config for Next.js applications.
 * @type {import("typescript-eslint").Config}
 */
const config = tseslint.config(...baseConfig, {
  plugins: {
    '@next/next': nextPlugin,
    react: pluginReact,
    'react-hooks': pluginReactHooks,
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs['core-web-vitals'].rules,
    ...pluginReact.configs.recommended.rules,
    ...pluginReactHooks.configs.recommended.rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
});

export default config;
