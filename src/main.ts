import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 0.0.0.0 — слушать на всех интерфейсах (нужно в Docker / Render / Railway).
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
void bootstrap();
