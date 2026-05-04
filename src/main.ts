import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Pharmacy Management API')
    .setDescription('Pharmacy Management System API Specification')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

    // bootstrap 함수 내부에 추가
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,             
    forbidNonWhitelisted: true,  
    transform: true,            
  }));

  await app.listen(3000);
}
bootstrap();