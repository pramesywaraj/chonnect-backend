import { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Joi from 'joi';

export interface ConfigType {
  auth_jwt: JwtModuleOptions;
  auth_jwt_refresh: JwtSignOptions;
  database: TypeOrmModuleOptions;
}

export const appConfigSchema = Joi.object({
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.number().valid(0, 1).required(),
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
});
