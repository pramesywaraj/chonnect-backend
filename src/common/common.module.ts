import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';

import { TypedConfigService } from './typed-config.service';
import { typeOrmConfig } from './database.config';
import { appConfigSchema } from './config.types';
import { RequestContextMiddleware } from './request-context/request-context.middleware';
import { CustomLogger } from './logger/custom-logger.service';

import HttpExceptionFilter from './exceptions/http-exception.filter';
import AnyExceptionFilter from './exceptions/any-exception.filter';

import { User, Message, MessageStatus, Room, RoomUser } from '../entities';

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
          entities: [User, Message, MessageStatus, Room, RoomUser],
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeOrmConfig],
      validationSchema: appConfigSchema,
    }),
  ],
  providers: [
    CustomLogger,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AnyExceptionFilter,
    },
  ],
})
export default class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*path');
  }
}
