import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { CustomLogger } from './common/logger/custom-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useLogger(new CustomLogger());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
