// @ts-check
import { globalIgnores } from 'eslint/config'
import { combine } from '@antfu/eslint-config'
export default combine([
    // Override default ignores of eslint-config-next.
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node-modules/**',
  ]),
])
