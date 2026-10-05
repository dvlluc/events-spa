import pluginVitest from '@vitest/eslint-plugin'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from 'eslint-config-prettier/flat'
import pluginOxlint from 'eslint-plugin-oxlint'
import pluginPlaywright from 'eslint-plugin-playwright'
import pluginVue from 'eslint-plugin-vue'
import { globalIgnores } from 'eslint/config'

/** Файлы, которым разрешён импорт "@mocks". */
const MOCKS_ALLOWED = [
  'src/app/main.ts',
  '**/*.spec.ts',
  'vitest.config.ts',
  'playwright.config.ts',
]

/**
 * Глубокие импорты: слой/сегмент можно импортировать только через index.ts,
 * внутри слайса — относительные пути. Семантика паттернов — gitignore:
 * "слой/слайс/*" матчит вместе со всем содержимым каталога.
 */
const deepImports = {
  group: ['@/pages/*/*', '@/features/*/*', '@/entities/*/*', '@/shared/*/*'],
  message: 'Глубокий импорт запрещён: импортируйте через index.ts слайса или сегмента shared.',
}

const mocksImports = {
  group: ['@mocks', '@mocks/*'],
  message: '@mocks разрешён только в src/app/main.ts, *.spec.ts и конфигах vitest/playwright.',
}

const higherLayersMessage =
  'Импорты только вниз по слоям: app → pages → features → entities → shared.'

/** Запрет импортов слоёв выше текущего. */
const LAYERS = [
  { path: 'src/shared', forbidden: ['@/entities/*', '@/features/*', '@/pages/*', '@/app/*'] },
  { path: 'src/entities', forbidden: ['@/features/*', '@/pages/*', '@/app/*'] },
  { path: 'src/features', forbidden: ['@/pages/*', '@/app/*'] },
  { path: 'src/pages', forbidden: ['@/app/*'] },
]

type RestrictedPatterns = Array<{ group: string[]; message: string }>

const restricted = (patterns: RestrictedPatterns): ['error', { patterns: RestrictedPatterns }] => [
  'error',
  { patterns },
]

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    '**/test-results/**',
    '**/playwright-report/**',
    '**/public/**',
  ]),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/*.spec.ts'],
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  {
    name: 'app/project-rules',
    files: ['**/*.{vue,ts,mts,tsx}'],
    rules: {
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/define-macros-order': 'error',
      'vue/no-v-html': 'error',
      'vue/component-api-style': ['error', ['script-setup']],

      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-magic-numbers': [
        'error',
        { ignore: [0, 1, -1], ignoreEnums: true, ignoreTypeIndexes: true },
      ],
    },
  },

  // Конфиги инструментов: таймауты и порты — не доменные константы.
  {
    name: 'app/project-rules/tool-configs',
    files: ['**/*.config.ts', '**/*.config.mts'],
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
    },
  },

  {
    name: 'app/project-rules/exceptions',
    files: ['**/*.spec.ts', 'e2e/**', 'mocks/**', '**/config/constants.ts'],
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
    },
  },

  // Границы слоёв: база — глубокие импорты и @mocks для всех, кроме разрешённых файлов.
  {
    name: 'fsd/base',
    files: ['**/*.{vue,ts,mts,tsx}'],
    ignores: MOCKS_ALLOWED,
    rules: {
      'no-restricted-imports': restricted([deepImports, mocksImports]),
    },
  },

  {
    name: 'fsd/mocks-allowed',
    files: MOCKS_ALLOWED,
    rules: {
      'no-restricted-imports': restricted([deepImports]),
    },
  },

  ...LAYERS.flatMap(({ path, forbidden }) => [
    {
      name: `fsd/${path}`,
      files: [`${path}/**/*.{ts,mts,tsx,vue}`],
      ignores: ['**/*.spec.ts'],
      rules: {
        'no-restricted-imports': restricted([
          deepImports,
          mocksImports,
          { group: forbidden, message: higherLayersMessage },
        ]),
      },
    },
    {
      name: `fsd/${path}/spec`,
      files: [`${path}/**/*.spec.ts`],
      rules: {
        'no-restricted-imports': restricted([
          deepImports,
          { group: forbidden, message: higherLayersMessage },
        ]),
      },
    },
  ]),

  skipFormatting,
)
