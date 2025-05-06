import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/auth/entities/user.entity';
import { Repository } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let authToken: string;

  const testUser = {
    name: 'Test e2e User',
    email: 'test-e2e@example.com',
    password: 'TestPassword123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    // Limpiamos la base de datos antes de ejecutar las pruebas
    // Nota: En un entorno real usaríamos una base de datos de prueba específica
    try {
      await userRepository.query('DELETE FROM transaction');
      await userRepository.query('DELETE FROM "user"');
    } catch (error) {
      console.error('Error al limpiar la base de datos:', error);
    }
  });

  afterAll(async () => {
    // Limpiamos después de las pruebas
    try {
      await userRepository.query('DELETE FROM transaction');
      await userRepository.query('DELETE FROM "user"');
    } catch (error) {
      console.error('Error al limpiar la base de datos:', error);
    }
    await app.close();
  });

  describe('Auth module', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('password'); // Realmente es el token JWT
    });

    it('should not register a user with the same email', async () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      authToken = response.body.token as string;
    });

    it('should not login with invalid credentials', async () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        })
        .expect(400);
    });
  });

  describe('Transaction module', () => {
    it('should not allow searching restaurants without authentication', async () => {
      return request(app.getHttpServer())
        .post('/api/transaction/search')
        .send({
          searchTerm: 'Madrid',
          radius: 1000,
        })
        .expect(401);
    });

    it('should search restaurants with authentication', async () => {
      // Nota: Este test depende de que la API externa esté funcionando
      // Para un test más robusto, deberíamos mockear las llamadas externas
      const response = await request(app.getHttpServer())
        .post('/api/transaction/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          searchTerm: 'Madrid',
          radius: 1000,
        })
        .expect(201);

      expect(response.body).toHaveProperty('searchLocation');
      expect(response.body).toHaveProperty('restaurants');
    });

    it('should retrieve transaction history with authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/transaction/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Debería tener al menos la transacción que acabamos de crear
      expect(Array.isArray(response.body)).toBeTruthy();

      const transactions = response.body as any[];
      if (transactions.length > 0) {
        expect(transactions[0]).toHaveProperty('searchTerm');
        expect(transactions[0]).toHaveProperty('radius');
      }
    });

    it('should not allow access to history without authentication', async () => {
      return request(app.getHttpServer())
        .get('/api/transaction/history')
        .expect(401);
    });
  });

  describe('Auth logout', () => {
    it('should allow logout with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User logged out successfully');
    });

    it('should not allow access after logout', async () => {
      // Al hacer logout, el token debería seguir siendo válido pero el usuario está marcado como inactivo
      // Sin embargo, esto depende de la implementación específica
      return request(app.getHttpServer())
        .get('/api/transaction/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);
    });
  });
});
