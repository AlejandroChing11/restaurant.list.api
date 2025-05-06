import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';

// Crear un mock para la entidad Transaction
jest.mock('../transaction/entities/transaction.entity', () => ({
  Transaction: class MockTransaction { }
}));

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock de AuthService para las pruebas
  const mockAuthService = {
    create: jest.fn(),
    login: jest.fn(),
    logOut: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
      };

      const expectedResult = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'token-123',
        isActive: true,
        roles: ['user'],
        transactions: [],
      };

      jest.spyOn(authService, 'create').mockImplementation(() => Promise.resolve(expectedResult));

      const result = await controller.create(createUserDto);

      expect(authService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('login', () => {
    it('should login a user and return a token', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'TestPassword123',
      };

      // Mock return value del servicio
      const expectedResult = { token: 'test-token-123' };

      jest.spyOn(authService, 'login').mockImplementation(() => Promise.resolve(expectedResult));

      const result = await controller.login(loginUserDto);

      expect(authService.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('logout', () => {
    it('should log out a user', async () => {
      const user = {
        id: 'test-id',
        email: 'test@example.com',
        isActive: true,
        roles: ['user'],
        name: 'Test User',
        password: 'hashed_password',
        transactions: [],
      } as User;

      // Mock return value del servicio
      const expectedResult = { message: 'User logged out successfully' };

      jest.spyOn(authService, 'logOut').mockImplementation(() => Promise.resolve(expectedResult));

      const result = await controller.logout(user);

      expect(authService.logOut).toHaveBeenCalledWith(user);
      expect(result).toBe(expectedResult);
    });
  });
});
