import { Controller, Get } from '@nestjs/common';

// Render проверяет живость обычным GET без заголовка Accept: text/html.
// GET /graphql в этом случае не отдаёт Sandbox: Apollo считает его GraphQL-запросом
// и отвечает 400 из-за защиты от CSRF. Отдельный маршрут возвращает 200.
@Controller('health')
export class HealthController {
  @Get()
  check(): string {
    return 'ok';
  }
}
