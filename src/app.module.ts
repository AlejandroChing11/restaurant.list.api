/**
 * Módulo principal de la aplicación que integra todos los componentes
 * y configura la conexión a la base de datos PostgreSQL.
 */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';

import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    // Configuración para variables de entorno, disponible globalmente
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configuración de la conexión a la base de datos PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432, // TODO: usar variables de entorno
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // Patrón de búsqueda para entidades de la base de datos
      entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
      autoLoadEntities: true,
      synchronize: true, // NOTA: En producción es recomendable desactivar synchronize
    }),
    // Registro de la entidad User para inyección de dependencias
    TypeOrmModule.forFeature([User]),

    // Módulo de autenticación y gestión de usuarios
    AuthModule,

    // Módulo para gestión de búsquedas de restaurantes
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
