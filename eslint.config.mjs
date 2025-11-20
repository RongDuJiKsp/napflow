// @ts-check
import {
  GLOB_TESTS, typescript as antfuTypescript, combine, javascript,
  node, stylistic, unicorn,
} from '@antfu/eslint-config'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import sonar from 'eslint-plugin-sonarjs'
import oxlint from 'eslint-plugin-oxlint'

export default combine(
  stylistic({
    lessOpinionated: true,
    jsx: false,
    semi: false,
    quotes: 'single',
    overrides: {
      'style/indent': ['error', 2],
      'style/quotes': ['error', 'single'],
      'curly': ['error', 'multi-or-nest', 'consistent'],
      'style/comma-spacing': ['error', { before: false, after: true }],
      'style/quote-props': ['warn', 'consistent-as-needed'],
      'style/indent-binary-ops': 'off',
      'style/multiline-ternary': 'off',
      'antfu/top-level-function': 'off',
      'antfu/curly': 'off',
      'antfu/consistent-chaining': 'off',
      'style/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
      'style/dot-location': ['error', 'property'],
      'style/object-curly-newline': ['error', { consistent: true, multiline: true }],
      'style/template-curly-spacing': ['error', 'never'],
      'style/keyword-spacing': 'off',
      'style/member-delimiter-style': 'off',
    },
  }),
  javascript(),
  antfuTypescript({
    overrides: {
      'ts/consistent-type-definitions': ['warn', 'type'],
      'ts/no-empty-object-type': 'off',
    },
  }),
  unicorn(),
  node(),
  {
    rules: {
      'ts/no-require-imports': 'off',
      'no-console': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react/display-name': 'off',
      'array-callback-return': ['error', { allowImplicit: false, checkForEach: false }],
      'camelcase': 'off',
      'default-case-last': 'error',
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: false,
        },
      ],
      'unused-imports/no-unused-vars': 'warn',
      'unused-imports/no-unused-imports': 'warn',
      'no-empty-function': 'error',
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2025,
        ...globals.node,
        React: 'readable',
        JSX: 'readable',
      },
    },
  },
  {
    rules: reactHooks.configs.recommended.rules,
    plugins: {
      'react-hooks': reactHooks,
    },
  },
  {
    rules: {
      ...sonar.configs.recommended.rules,
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/no-nested-functions': 'warn',
      'sonarjs/no-nested-conditional': 'warn',
      'sonarjs/nested-control-flow': 'warn',
      'sonarjs/no-small-switch': 'off',
      'sonarjs/no-nested-template-literals': 'warn',
      'sonarjs/redundant-type-aliases': 'off',
      'sonarjs/regex-complexity': 'warn',
      'sonarjs/no-ignored-exceptions': 'off',
      'sonarjs/no-commented-code': 'warn',
      'sonarjs/no-unused-vars': 'warn',
      'sonarjs/prefer-single-boolean-return': 'warn',
      'sonarjs/duplicates-in-character-class': 'off',
      'sonarjs/single-char-in-character-classes': 'off',
      'sonarjs/anchor-precedence': 'warn',
      'sonarjs/updated-loop-counter': 'off',
      'sonarjs/no-dead-store': 'error',
      'sonarjs/no-duplicated-branches': 'warn',
      'sonarjs/max-lines': 'warn',
      'sonarjs/no-variable-usage-before-declaration': 'error',
      'sonarjs/no-hardcoded-passwords': 'off',
      'sonarjs/no-hardcoded-secrets': 'off',
      'sonarjs/pseudo-random': 'off',
      'sonarjs/slow-regex': 'warn',
      'sonarjs/todo-tag': 'warn',
      'sonarjs/table-header': 'off',
    },
    plugins: {
      sonarjs: sonar,
    },
  },
  {
    rules: {
      'antfu/consistent-list-newline': 'off',
      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',
      'node/no-callback-literal': 'off',
      'eslint-comments/no-unused-disable': 'off',
      'style/indent': ['error', 2, { SwitchCase: 1, ignoreComments: true }],
      'unicorn/prefer-number-properties': 'warn',
      'unicorn/no-new-array': 'warn',
    },
  },
  // Tests environment
  {
    files: GLOB_TESTS,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  oxlint.configs['flat/recommended'],
)
