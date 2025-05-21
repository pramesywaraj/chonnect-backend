import { NestFactory, Reflector } from '@nestjs/core';

import { AppModule } from './app.module';

import { CustomLogger } from './common/logger/custom-logger.service';
import CustomValidationPipe from './common/pipes/CustomValidation.pipe';
import { ResponseInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  app.setGlobalPrefix('api');
  app.useLogger(new CustomLogger());
  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
