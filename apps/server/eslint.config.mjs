// @ts-check
import { globalIgnores } from 'eslint/config'
import { combine } from '@antfu/eslint-config'
import base from '../../eslint.config.mjs'
export default combine(base, [
  // Override default ignores of eslint-config-next.
  globalIgnores(['node_modules/', 'dist/', 'src/prisma/generated']),
])
