import { NestFactory, Reflector } from '@nestjs/core';

import { AppModule } from './app.module';

import { CustomLogger } from './common/logger/custom-logger.service';
import CustomValidationPipe from './common/pipes/CustomValidation.pipe';
import { ResponseInterceptor } from './common/interceptors';

const CORS_ORIGINS_WHITELIST = process.env.CORS_ORIGINS_WHITELIST
  ? process.env.CORS_ORIGINS_WHITELIST.split(',').map((origin) => origin.trim())
  : [];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ): void => {
      if (!origin) {
        return callback(null, true);
      }

      // Allow any localhost (any port)
      if (/^http:\/\/localhost(:\\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      if (CORS_ORIGINS_WHITELIST.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
    },
  });

  app.setGlobalPrefix('api');
  app.useLogger(new CustomLogger());
  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
