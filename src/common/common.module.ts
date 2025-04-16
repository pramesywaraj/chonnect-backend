import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { TypedConfigService } from './typed-config.service';
import { typeOrmConfig } from './database.config';
import { appConfigSchema } from './config.types';
import { RequestContextMiddleware } from './request-context/request-context.middleware';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: TypedConfigService) => {
        const dbConfig = configService.get<TypeOrmModuleOptions>('database');
        return {
          ...dbConfig,
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeOrmConfig],
      validationSchema: appConfigSchema,
    }),
  ],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*path');
  }
}
