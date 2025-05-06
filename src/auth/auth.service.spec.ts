import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository, ObjectLiteral } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T extends ObjectLiteral = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

// Mock para bcrypt
jest.mock('bcrypt', () => ({
  hashSync: jest.fn().mockReturnValue('hashed_password'),
  compareSync: jest.fn().mockImplementation((plaintext, hash) => {
    // Simular verificación de contraseña
    return plaintext === 'TestPassword123' && hash === 'hashed_password';
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user and return it with token', async () => {
      // Mock data
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
      };

      userRepository.findOne!.mockResolvedValue(null); // Usuario no existe previamente
      userRepository.create!.mockReturnValue({
        id: 'test-id',
        ...createUserDto,
        password: 'hashed_password',
        isActive: true,
        roles: ['user'],
        transactions: [],
      });
      userRepository.save!.mockResolvedValue({
        id: 'test-id',
        name: createUserDto.name,
        email: createUserDto.email,
        isActive: true,
        roles: ['user'],
        transactions: [],
      });

      const result = await service.create(createUserDto);

      expect(userRepository.findOne).toHaveBeenCalled();
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'test-id');
      expect(result).toHaveProperty('name', createUserDto.name);
      expect(result).toHaveProperty('email', createUserDto.email);
      expect(result.password).toBe('test-token'); // El token JWT
    });

    it('should throw an exception if user already exists', async () => {
      // Mock data
      const createUserDto = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'TestPassword123',
      };

      userRepository.findOne!.mockResolvedValue({ email: createUserDto.email });

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userRepository.findOne).toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return a token when credentials are valid', async () => {
      const loginUserDto = {
        email: 'test@example.com',
        password: 'TestPassword123',
      };

      // Mock user exists with matching password
      userRepository.findOne!.mockResolvedValue({
        id: 'test-id',
        email: loginUserDto.email,
        password: 'hashed_password',
      });

      const result = await service.login(loginUserDto);

      expect(result).toHaveProperty('token', 'test-token');
      expect(userRepository.findOne).toHaveBeenCalled();
    });

    it('should throw an exception if user is not found', async () => {
      // Mock data
      const loginUserDto = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123',
      };

      userRepository.findOne!.mockResolvedValue(null);

      await expect(service.login(loginUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userRepository.findOne).toHaveBeenCalled();
    });

    it('should throw an exception if password is invalid', async () => {
      // Mock data
      const loginUserDto = {
        email: 'test@example.com',
        password: 'WrongPassword123',
      };

      userRepository.findOne!.mockResolvedValue({
        id: 'test-id',
        email: loginUserDto.email,
        password: 'hashed_password',
      });

      await expect(service.login(loginUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('logOut', () => {
    it('should mark the user as inactive', async () => {
      // Mock data
      const user = {
        id: 'test-id',
        email: 'test@example.com',
      } as User;

      // Mock user exists
      userRepository.findOne!.mockResolvedValue({ id: user.id });
      userRepository.update!.mockResolvedValue({ affected: 1 });

      const result = await service.logOut(user);

      expect(result).toHaveProperty('message', 'User logged out successfully');
      expect(userRepository.findOne).toHaveBeenCalled();
      expect(userRepository.update).toHaveBeenCalledWith(user.id, {
        isActive: false,
      });
    });

    it('should throw an exception if user is not found', async () => {
      // Mock data
      const user = {
        id: 'nonexistent-id',
        email: 'nonexistent@example.com',
      } as User;

      userRepository.findOne!.mockResolvedValue(null);

      await expect(service.logOut(user)).rejects.toThrow(
        BadRequestException,
      );
      expect(userRepository.findOne).toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });
});
