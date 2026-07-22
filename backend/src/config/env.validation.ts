import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().required().messages({
    'any.required': 'DATABASE_URL environment variable is required',
  }),
  JWT_ACCESS_SECRET: Joi.string().required().messages({
    'any.required': 'JWT_ACCESS_SECRET environment variable is required',
  }),
  JWT_REFRESH_SECRET: Joi.string().required().messages({
    'any.required': 'JWT_REFRESH_SECRET environment variable is required',
  }),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
  REDIS_URL: Joi.string().required().messages({
    'any.required': 'REDIS_URL environment variable is required',
  }),
});
