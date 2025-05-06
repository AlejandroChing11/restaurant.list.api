/**
 * Punto de entrada principal de la aplicación NestJS.
 * Configura y arranca el servidor web con Swagger para documentación API.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Crea la instancia de la aplicación NestJS
  const app = await NestFactory.create(AppModule);
  // Establece el prefijo 'api' para todas las rutas
  app.setGlobalPrefix('api');

  // Configura Swagger para documentación API
  const config = new DocumentBuilder()
    .setTitle('List Restaurants RESTFUL API')
    .setDescription('A fast and simple RESTful API to list restaurants')
    .setVersion('1.0')
    .build();

  // Genera la documentación Swagger y la expone en /api/docs
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Inicia el servidor en el puerto especificado en variables de entorno o 3000 por defecto
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
