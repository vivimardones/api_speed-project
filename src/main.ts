// Debe ser el primer import - carga las variables de entorno
import './config';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Configuración de CORS más explícita
    app.enableCors({
      origin: '*', // puedes restringir a dominios específicos
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // Configuración de Swagger
    const config = new DocumentBuilder()
      .setTitle('Club Speed API')
      .setDescription('API REST para gestión de club deportivo con Firebase')
      .setVersion('1.0.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Validación global de DTOs
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // elimina propiedades no definidas en DTO
        forbidNonWhitelisted: true, // lanza error si llegan propiedades extra
        transform: true, // convierte tipos automáticamente (ej: string → number)
      }),
    );

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log(`Documentación Swagger en http://localhost:${port}/api`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error al iniciar NestJS:', error.message);
    } else {
      console.error('Error desconocido al iniciar NestJS:', error);
    }
  }
}

void bootstrap();
