# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY prisma ./prisma
COPY prisma.config.ts tsconfig*.json nest-cli.json ./
COPY src ./src
# prisma generate читает только схему; URL — заглушка для конфига.
RUN DATABASE_URL=postgresql://build/placeholder npx prisma generate \
  && npm run build \
  && npm run build:seed


FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
# Install-скрипты пропущены (postinstall приложения запустил бы prisma generate,
# который здесь не нужен), поэтому движок схем Prisma для `migrate deploy`
# скачивается явно, пока файлы образа принадлежат root.
RUN npm ci --omit=dev --ignore-scripts \
  && node node_modules/@prisma/engines/scripts/postinstall.js \
  && npm cache clean --force

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-seed ./dist-seed

USER node
EXPOSE 3000

# Применить миграции, заполнить базу и запустить сервер.
# exec заменяет shell, чтобы приложение напрямую получало сигналы остановки.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist-seed/prisma/seed.js && exec node dist/main"]
