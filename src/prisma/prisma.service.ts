import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.getOrThrow<string>('DATABASE_URL'),
      }),
      log: config.get('PRISMA_QUERY_LOG') === 'true' ? ['query'] : [],
    });
  }

  async onModuleInit() {
    // С driver adapter $connect() не открывает соединение (пул подключается
    // лениво), поэтому простой запрос нужен, чтобы приложение падало сразу
    // при недоступной базе, а не на первом запросе к API.
    await this.$queryRaw`SELECT 1`;
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
