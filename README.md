<p align="center">
  <img src="./public/favicon.svg" alt="events-spa logo" width="64" height="64" />
</p>

# Events SPA

SPA для управления событиями (CRUD): список с серверной пагинацией, создание, редактирование и удаление через модальные окна. [Демо](https://events-spa.vercel.app/).

## Стек

Vue 3 · Vite · TypeScript · Pinia · TanStack Query · TanStack Virtual · Zod · Tailwind CSS 4 (раскладка) · SCSS (темы) · Vitest · Playwright · MSW

## Фактические версии

Источник правды — `package.json`.

| Пакет                         | Версия                       |
| ----------------------------- | ---------------------------- |
| vue                           | ^3.5.42                      |
| vite                          | ^8.2.2                       |
| pinia                         | ^4.0.3                       |
| vue-router                    | ^5.3.1                       |
| tailwindcss                   | ^4.3.3                       |
| zod                           | ^4.6.5                       |
| @tanstack/vue-query           | ^5.104.0                     |
| @tanstack/vue-virtual         | ^3.13.39                     |
| msw                           | ^3.0.1                       |
| vitest                        | ^5.0.3                       |
| playwright (@playwright/test) | ^1.63.0                      |
| node                          | 24.18.0 (LTS, `.nvmrc` = 24) |
| pnpm                          | 12.8.1 (`packageManager`)    |

## Требования

- Node.js 24 LTS (`.nvmrc`)
- pnpm (версия в `packageManager`)

## Запуск

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Без `.env` приложение не стартует: нужен `VITE_API_BASE_URL`.

Для тестов один раз: `pnpm exec playwright install chromium`.

## Скрипты

| Команда                                                           | Назначение                                     |
| ----------------------------------------------------------------- | ---------------------------------------------- |
| `pnpm dev`                                                        | dev-сервер                                     |
| `pnpm build` / `pnpm preview`                                     | сборка / просмотр сборки                       |
| `pnpm lint` / `pnpm lint:style` / `pnpm lint:fsd` / `pnpm format` | ESLint+Oxlint / Stylelint / Steiger / Prettier |
| `pnpm type-check`                                                 | vue-tsc                                        |
| `pnpm test:unit` / `pnpm test:component` / `pnpm test:e2e`        | тесты                                          |
| `pnpm test`                                                       | все тесты: unit + component + e2e              |
| `pnpm seed`                                                       | наполнить реальный mockapi тестовыми событиями |

## Бэкенд

mockapi.io, контракт — `openapi-specification.yaml`. Базовый URL в `VITE_API_BASE_URL`.
API не возвращает общее количество записей, поэтому пагинация «Назад / Вперёд» с выбором размера страницы (5, 10, 20, 50, 100).
Страница за пределами диапазона возвращает `[]`; список не даёт уйти за последнюю страницу (пробный запрос следующей), а на пустой ответ страницы > 1 происходит откат на шаг назад.

Ресурс mockapi ограничен 100 записями: `pnpm seed` добавляет 50 событий и завершится ошибкой 400 «Max number of elements reached», если свободного места меньше.

## Архитектура

Feature-Sliced Design: `app → pages → features → entities → shared`. Страница `pages/events`, фичи `event-form` и `event-delete`, сущность `entities/event`. Импорты только вниз, наружу из слайса через `index.ts`. Границы проверяют ESLint и Steiger.

## Константы и темы

- Пагинация, виртуализация, сортировка: `src/pages/events/config/constants.ts`
- Валидация формы: `src/features/event-form/config/constants.ts`
- Форматирование дат: `src/entities/event/config/constants.ts`
- HTTP, кэш, тема по умолчанию: `src/shared/config/constants.ts`
- Тема = запись в `$themes` (`src/app/styles/_themes.scss`)
- Виртуализация включается, когда на странице больше `VIRTUALIZATION.THRESHOLD` (50) элементов

## Качество

Pre-commit: lint-staged (ESLint, Oxlint, Stylelint, Prettier), commit-msg: commitlint (Conventional Commits), pre-push: type-check + lint:fsd + unit-тесты.
CI: `.github/workflows/ci.yml` — install (кэш pnpm) → lint → lint:fsd → type-check → test → build → e2e.

## Развёртывание

Статика — готовый `dist/`. На Vercel настройки задаёт `vercel.json`: для файлов `dist/assets/*` (имена с хэшем) — `Cache-Control: public, max-age=31536000, immutable`, для корня — `no-cache`-эквивалент (`max-age=0, must-revalidate`, в нём имена бандлов), rewrite `/(.*)` → `/index.html` для SPA-fallback (остальным путям Vercel ставит `max-age=0, must-revalidate` по умолчанию). На других хостингах — те же заголовки вручную; сжатие brotli/gzip включает сам хостинг.

Файлы сборки разложены по назначению (шаблоны имён и группы — `vite/output.ts` и `vite/code-splitting.ts`): `dist/assets/js/` — entry и асинхронные чанки приложения, `dist/assets/vendor/` — чанки `node_modules`, `dist/assets/css/` — стили, `dist/assets/static/` — прочие ассеты. Имена всегда с `[hash]`, поэтому годятся `immutable`-заголовки. Конфиг Vite разбит на блоки в `vite/` (`constants`, `aliases`, `plugins`, `output`, `code-splitting`), `vite.config.ts` их только собирает.
