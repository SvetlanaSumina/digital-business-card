# Цифровая визитка

GraphQL API профиля backend-разработчика: NestJS, Prisma, PostgreSQL, Docker.

## Стек

- **NestJS** — HTTP-сервер и DI
- **GraphQL (Apollo, code-first)** — единый endpoint `/graphql`
- **Prisma 7** + **PostgreSQL** — схема, миграции, доступ к данным
- **DataLoader** — батчинг вложенных полей без N+1
- **Docker Compose** — локальный запуск приложения и базы с нуля

## Архитектура

Запрос идёт по слоям **Resolver → Service → Repository → Prisma**:

| Слой | Роль |
| --- | --- |
| `ProfileResolver` | GraphQL: `@Query profile` и `@ResolveField` для связей |
| `ProfileService` | Бизнес-логика (например, `NotFoundException`) |
| `ProfileRepository` | Только SQL через Prisma |
| `ProfileLoaders` | DataLoader: один SQL на связь на GraphQL-запрос |

Связи (`links`, `skills`, `experience`, `projects`) подгружаются **только если их запросили** в query.

## Быстрый старт (локально)

Нужны Node.js 24+ и Docker Desktop.

```bash
cp .env.example .env
npm install
docker compose up -d db
npm run prisma:deploy
npm run prisma:seed
npm run start:dev
```

Sandbox: [http://localhost:3000/graphql](http://localhost:3000/graphql)

### Всё через Docker (с нуля)

```bash
docker compose down -v
docker compose up --build
```

Контейнер `app` ждёт `healthy` у Postgres, применяет миграции, делает seed и стартует сервер.

## Пример запроса

```graphql
query {
  profile {
    name
    description
    links { label url }
    skills { name }
    experience { company position startDate endDate achievements }
    projects { name url }
  }
}
```

Postman: **New → GraphQL**, URL `http://localhost:3000/graphql` (или URL деплоя).

## Скрипты

| Команда | Назначение |
| --- | --- |
| `npm run start:dev` | Разработка с hot-reload |
| `npm run build` / `npm run start:prod` | Сборка и production-запуск |
| `npm run lint` | Oxlint |
| `npm test` / `npm run test:e2e` | Unit и e2e-тесты |
| `npm run prisma:seed` | Идемпотентное заполнение базы |
| `npm run prisma:studio` | UI для просмотра таблиц |

E2e требуют запущенную базу с данными (`docker compose up -d db` + migrate + seed).

## Деплой на Render

В репозитории есть [`render.yaml`](./render.yaml): Web Service из Dockerfile + Free Postgres.

1. Запушьте код на GitHub.
2. [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
3. Подключите репозиторий и подтвердите создание сервисов.
4. Дождитесь деплоя (migrate + seed выполняются в `CMD` Dockerfile).
5. Откройте `https://<имя-сервиса>.onrender.com/graphql`.

Переменная `DATABASE_URL` подставляется из Postgres автоматически. Free-инстанс БД живёт 30 дней — для сдачи задания этого достаточно. Free Web Service засыпает без трафика (~15 мин); первый запрос после сна может занять около минуты.

Альтернатива вручную: **New → Web Service** (Docker) + **New → PostgreSQL**, в сервисе задать `DATABASE_URL` из Internal/External Database URL.

## Переменные окружения

См. [`.env.example`](./.env.example). В git попадает только пример; файл `.env` в `.gitignore`.
