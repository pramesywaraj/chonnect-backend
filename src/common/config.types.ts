import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Joi from 'joi';

import { AuthConfig } from './config/auth.config';

export interface ConfigType {
  auth: AuthConfig;
  database: TypeOrmModuleOptions;
}

export const appConfigSchema = Joi.object({
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.number().valid(0, 1).required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
});
