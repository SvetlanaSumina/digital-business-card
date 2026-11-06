import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileLoadersFactory } from './profile/profile.loaders';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ProfileModule],
      inject: [ProfileLoadersFactory],
      useFactory: async (profileLoadersFactory: ProfileLoadersFactory) => {
        // @nestjs/apollo — ES-модуль, поэтому плагин тоже импортируется как ESM:
        // статический импорт подтянул бы CommonJS-типы @apollo/server,
        // которые TypeScript считает несовместимыми с ESM-типами.
        const { ApolloServerPluginLandingPageLocalDefault } =
          await import('@apollo/server/plugin/landingPage/default');

        return {
          autoSchemaFile: true,
          sortSchema: true,
          // В production Apollo по умолчанию отключает Sandbox и introspection;
          // визитка должна быть доступна для изучения, поэтому оба включены.
          playground: false,
          introspection: true,
          plugins: [ApolloServerPluginLandingPageLocalDefault()],
          // Вызывается на каждый запрос: у каждого запроса свои DataLoader'ы,
          // поэтому батчинг и кеш не смешиваются между запросами.
          context: () => ({ loaders: profileLoadersFactory.create() }),
        };
      },
    }),
    PrismaModule,
    ProfileModule,
  ],
})
export class AppModule {}
