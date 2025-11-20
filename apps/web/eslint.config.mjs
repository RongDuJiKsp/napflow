// @ts-check
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import reactHooks from 'eslint-plugin-react-hooks'
import { globalIgnores } from 'eslint/config'
import { combine } from '@antfu/eslint-config'
import base from '../../eslint.config.mjs'

export default combine(base, [
  ...nextVitals,
  ...nextTs,
  {
    rules: reactHooks.configs.recommended.rules,
    plugins: {
      'react-hooks': reactHooks,
    },
  },
    // Override default ignores of eslint-config-next.
  globalIgnores([
    '.next/',
    'out/',
    'build/',
    'next-env.d.ts',
    'node-modules/',
  ]),
])
