import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { configuration, envValidationSchema } from './config';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { StorageModule } from './storage';
import { UsersModule } from './users';
import { ServiceRequestsModule } from './service-requests';
import { SurveysModule } from './surveys';
import { EstimatesModule } from './estimates';
import { WorkOrdersModule } from './work-orders';
import { PaymentsModule } from './payments';
import { InvoicesModule } from './invoices';
import { NotificationsModule } from './notifications';
import { ReportsModule } from './reports';
import { SearchModule } from './search';
import { JobsModule } from './jobs';
import { ActivityModule } from './activity';
import { ProductionModule } from './production';
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
    AuthModule,
    StorageModule,
    UsersModule,
    ServiceRequestsModule,
    SurveysModule,
    EstimatesModule,
    WorkOrdersModule,
    PaymentsModule,
    InvoicesModule,
    NotificationsModule,
    ReportsModule,
    SearchModule,
    JobsModule,
    ActivityModule,
    ProductionModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('(.*)');
  }
}
