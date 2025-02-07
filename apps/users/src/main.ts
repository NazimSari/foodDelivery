import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(UsersModule);

  // CORS'u etkinleştir
  app.enableCors({
    origin: 'http://localhost:3000', // Frontend URL'si
    credentials: true, // Cookie, Authorization gibi bilgileri iletmek için
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'servers/email-templates'));
  app.setViewEngine('ejs');

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
