import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import Joi from 'joi';

export interface ConfigType {
  database: TypeOrmModuleOptions;
}

export const appConfigSchema = Joi.object({
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.number().valid(0, 1).required(),
});
