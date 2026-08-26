import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Prefix
  app.setGlobalPrefix('api');

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tagdiah Home Decor & Arts — Backend API')
    .setDescription(
      'Comprehensive RESTful API for Storefront & Admin Dashboard with Prisma ORM and User Management',
    )
    .setVersion('1.0')
    .addTag('System & Health', 'Health checks and diagnostics')
    .addTag('User Management', 'Admin staff, roles, and security audit logs')
    .addTag('Products', 'Catalogue, pricing, inventory, and categories')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Tagdiah API Docs',
    customCss: '.swagger-ui .topbar { background-color: #2B2724; }',
  });

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Tagdiah Backend is running on port: ${port}`);
  logger.log(`📚 Swagger API Documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
