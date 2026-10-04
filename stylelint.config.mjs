// at-rules Tailwind 4 (плюс v3-совместимые) — не входят в известные списки stylelint.
const TAILWIND_AT_RULES = [
  'tailwind',
  'apply',
  'theme',
  'utility',
  'variant',
  'custom-variant',
  'plugin',
  'config',
  'source',
  'reference',
  'layer',
  'screen',
]

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recommended-vue/scss'],
  ignoreFiles: ['**/node_modules/**', 'dist/**', 'coverage/**', 'public/**', 'test-results/**'],
  rules: {
    'at-rule-no-unknown': [true, { ignoreAtRules: TAILWIND_AT_RULES }],
    'scss/at-rule-no-unknown': [true, { ignoreAtRules: TAILWIND_AT_RULES }],
  },
  overrides: [
    {
      files: ['**/*.scss', '**/*.vue'],
      rules: {
        'at-rule-no-unknown': null,
      },
    },
  ],
}
