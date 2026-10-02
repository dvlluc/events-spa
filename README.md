# events-spa

SPA «События»: список событий с серверной пагинацией, модальные CRUD-операции.

## Фактические версии

Источник правды — `package.json` (для Node/pnpm — текущее окружение, см. `.nvmrc` и `engines`).

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
| pnpm                          | 12.8.1                       |

## Setup

```sh
pnpm install
cp .env.example .env
```

Без `.env` приложение не стартует и печатает ошибку по переменной `VITE_API_BASE_URL`.

### Разработка

```sh
pnpm dev
```

### Type-check и сборка

```sh
pnpm type-check
pnpm build
```

### Линтеры

```sh
pnpm lint
pnpm format
```

### Тесты

```sh
pnpm test:unit
```

End-to-end (Playwright):

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```
