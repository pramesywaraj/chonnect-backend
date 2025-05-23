import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';

import { TypedConfigService } from './typed-config.service';
import { typeOrmConfig } from './config/database.config';
import { appConfigSchema } from './config.types';

import { CustomLogger } from './logger/custom-logger.service';

import CustomExceptionFilter from './exceptions/custom-exception.filter';

import LoggingMiddleware from './middlewares/logging.middleware';
import { RequestContextMiddleware } from './request-context/request-context.middleware';

import { User, Message, MessageStatus, Room, RoomUser } from '../entities';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: TypedConfigService) => {
        const dbConfig = configService.get<TypedConfigService>('database');
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
      useClass: CustomExceptionFilter,
    },
  ],
})
export default class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware, LoggingMiddleware).forRoutes('*path');
  }
}
