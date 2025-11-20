// @ts-check
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { globalIgnores } from 'eslint/config'
import { combine } from '@antfu/eslint-config'

export default combine([
  ...nextVitals,
  ...nextTs,
    // Override default ignores of eslint-config-next.
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node-modules/**',
  ]),
])
