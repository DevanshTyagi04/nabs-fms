import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import compression from 'compression';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters';
import { ResponseInterceptor } from './common/interceptors';
import { API_PREFIX } from './common/constants';
import { createOpenApiConfig, DocsController } from './docs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // 1. Logger Setup
  const logger = app.get(Logger);
  app.useLogger(logger);

  // 2. Configuration & Environment Variables
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const environment = configService.get<string>('NODE_ENV') || 'development';

  // 3. Security Middlewares & Headers
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 4. Global API Prefix
  app.setGlobalPrefix(API_PREFIX);

  // 5. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 6. Global Interceptors & Exception Filters
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 7. Enable Graceful Shutdown Hooks
  app.enableShutdownHooks();

  // 8. Swagger OpenAPI Setup & Controller Injection
  const swaggerConfig = createOpenApiConfig();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Inject generated OpenAPI document into DocsController (Single Source of Truth)
  try {
    const docsController = app.get(DocsController);
    docsController.setOpenApiDocument(document);
  } catch {
    // Graceful fallback during isolated unit testing
  }

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 9. Start Application
  await app.listen(port);
  logger.log(`🚀 NABS Application running in [${environment}] mode on port ${port}`);
  logger.log(`📚 Swagger Documentation available at http://localhost:${port}/api/docs`);
  logger.log(`🟢 Health probes available at http://localhost:${port}${API_PREFIX}/health`);
}

bootstrap();
