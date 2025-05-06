import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { User } from '../auth/entities/user.entity';

// Crear un mock para la entidad Transaction
jest.mock('../transaction/entities/transaction.entity', () => ({
  Transaction: class MockTransaction { }
}));

jest.mock('../auth/decorators/user.decorator', () => ({
  Auth: () => jest.fn(),
}));

jest.mock('../auth/decorators/get-user.decorator', () => ({
  GetUser: () => jest.fn(),
}));

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionService: TransactionService;

  // Mock del TransactionService para las pruebas
  const mockTransactionService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    transactionService = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should search restaurants and return results', async () => {
      // Mock data
      const user = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        isActive: true,
        roles: ['user'],
        password: 'hashed_password',
        transactions: [],
      } as User;

      const createTransactionDto: CreateTransactionDto = {
        searchTerm: 'Bogotá',
        radius: 1000,
      };

      const expectedResult = {
        searchLocation: {
          query: 'Bogotá',
          resolvedLocation: {
            lat: 4.60971,
            lon: -74.08175,
          },
        },
        count: 1,
        restaurants: [
          {
            id: 'rest1',
            name: 'Restaurant 1',
            // ... otros datos de restaurante
          },
        ],
      };

      jest.spyOn(transactionService, 'create').mockImplementation(() => Promise.resolve(expectedResult));

      const result = await controller.create(createTransactionDto, user);

      expect(transactionService.create).toHaveBeenCalledWith(
        createTransactionDto,
        user
      );
      expect(result).toBe(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return transaction history for a user', async () => {
      // Mock data
      const user = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        isActive: true,
        roles: ['user'],
        password: 'hashed_password',
        transactions: [],
      } as User;

      // Mock return value del servicio
      const expectedResult = [
        {
          id: 'transaction-1',
          searchTerm: 'Bogotá',
          radius: 1000,
          user,
        },
        {
          id: 'transaction-2',
          searchTerm: 'Medellín',
          radius: 500,
          user,
        },
      ];

      jest.spyOn(transactionService, 'findAll').mockImplementation(() => Promise.resolve(expectedResult));

      // Execute controller method
      const result = await controller.findAll(user);

      // Assertions
      expect(transactionService.findAll).toHaveBeenCalledWith(user);
      expect(result).toBe(expectedResult);
    });

    it('should return message when no transactions are found', async () => {
      const user = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        isActive: true,
        roles: ['user'],
        password: 'hashed_password',
        transactions: [],
      } as User;

      // Mock return value del servicio
      const expectedResult = { message: 'No hay transacciones' };

      jest.spyOn(transactionService, 'findAll').mockImplementation(() => Promise.resolve(expectedResult));

      const result = await controller.findAll(user);

      expect(transactionService.findAll).toHaveBeenCalledWith(user);
      expect(result).toBe(expectedResult);
    });
  });
});
