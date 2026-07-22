import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { configuration, envValidationSchema } from './config';
import { PrismaModule } from './prisma';
import { HealthModule } from './health';
import { AuthModule } from './auth';
import { RequestIdMiddleware } from './common/middlewares';
import { REQUEST_ID_HEADER } from './common/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        return {
          pinoHttp: {
            level: isProduction ? 'info' : 'debug',
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                    colorize: true,
                    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
                  },
                },
            customProps: (req: any) => ({
              requestId: req.headers[REQUEST_ID_HEADER] || req.requestId,
              userId: req.user?.id || null,
            }),
            serializers: {
              req(req) {
                return {
                  id: req.headers[REQUEST_ID_HEADER] || req.raw.requestId,
                  method: req.method,
                  url: req.url,
                  remoteAddress: req.remoteAddress,
                };
              },
              res(res) {
                return {
                  statusCode: res.statusCode,
                };
              },
            },
          },
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    HealthModule,
    AuthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('(.*)');
  }
}
