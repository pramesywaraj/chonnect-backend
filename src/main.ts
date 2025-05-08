import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { CustomLogger } from './common/logger/custom-logger.service';
import CustomValidationPipe from './common/pipes/CustomValidation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useLogger(new CustomLogger());
  app.useGlobalPipes(new CustomValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
