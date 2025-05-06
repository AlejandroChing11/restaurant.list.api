import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Repository, ObjectLiteral } from 'typeorm';
import axios from 'axios';
import { User } from '../auth/entities/user.entity';

// Mock para axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T extends ObjectLiteral = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: MockRepository<Transaction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get(getRepositoryToken(Transaction));

    // Configuración de variables de entorno para las pruebas
    process.env.GEOGRAPHY_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction record and return restaurant data for direct coordinates', async () => {
      // Mock data
      const user = { id: 'user-id', name: 'Test User' } as User;
      const createTransactionDto = {
        searchTerm: '4.60971, -74.08175', // Coordenadas directas
        radius: 1000,
      };

      transactionRepository.create!.mockReturnValue({
        id: 'transaction-id',
        ...createTransactionDto,
        user,
      });
      transactionRepository.save!.mockResolvedValue({
        id: 'transaction-id',
        ...createTransactionDto,
        user,
      });

      // Mock axios responses para places API
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          features: [
            {
              properties: {
                place_id: 'rest1',
                name: 'Restaurant 1',
                formatted: 'Address 1',
                categories: ['restaurant'],
                distance: 100,
                phone: '123456789',
                website: 'http://rest1.com',
              },
              geometry: {
                coordinates: [-74.08175, 4.60971],
              },
            },
          ],
        },
      });

      const result = await service.create(createTransactionDto, user);

      expect(transactionRepository.create).toHaveBeenCalled();
      expect(transactionRepository.save).toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('restaurants');

      if (result.restaurants && Array.isArray(result.restaurants)) {
        expect(result.restaurants.length).toBe(1);
        if (result.restaurants.length > 0) {
          expect(result.restaurants[0].name).toBe('Restaurant 1');
        }
      }

      expect(result.searchLocation).toBeDefined();
      if (result.searchLocation) {
        expect(result.searchLocation.query).toBe(createTransactionDto.searchTerm);
      }
    });

    it('should create a transaction record and return restaurant data for text location', async () => {
      // Mock data
      const user = { id: 'user-id', name: 'Test User' } as User;
      const createTransactionDto = {
        searchTerm: 'Bogotá', // Ubicación de texto
        radius: 1000,
      };

      // Mock repository responses
      transactionRepository.create!.mockReturnValue({
        id: 'transaction-id',
        ...createTransactionDto,
        user,
      });
      transactionRepository.save!.mockResolvedValue({
        id: 'transaction-id',
        ...createTransactionDto,
        user,
      });

      // Mock axios response para geocode API
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          features: [
            {
              geometry: {
                coordinates: [-74.08175, 4.60971],
              },
            },
          ],
        },
      });

      // Mock axios response para places API
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          features: [
            {
              properties: {
                place_id: 'rest1',
                name: 'Restaurant 1',
                formatted: 'Address 1',
                categories: ['restaurant'],
                distance: 100,
              },
              geometry: {
                coordinates: [-74.08175, 4.60971],
              },
            },
          ],
        },
      });

      const result = await service.create(createTransactionDto, user);

      expect(transactionRepository.create).toHaveBeenCalled();
      expect(transactionRepository.save).toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalledTimes(2); // Llamadas a geocode y places APIs
      expect(result).toHaveProperty('restaurants');

      if (result.restaurants && Array.isArray(result.restaurants)) {
        expect(result.restaurants.length).toBe(1);
      }

      expect(result.searchLocation).toBeDefined();
      if (result.searchLocation) {
        expect(result.searchLocation.query).toBe(createTransactionDto.searchTerm);
      }
    });

    it('should handle location not found error', async () => {
      // Mock data
      const user = { id: 'user-id', name: 'Test User' } as User;
      const createTransactionDto = {
        searchTerm: 'InvalidLocation',
        radius: 1000,
      };

      transactionRepository.create!.mockReturnValue({
        id: 'transaction-id',
        ...createTransactionDto,
        user,
      });
      transactionRepository.save!.mockResolvedValue({
        id: 'transaction-id',
        ...createTransactionDto,
        user,
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          features: [],
        },
      });

      const result = await service.create(createTransactionDto, user);

      expect(transactionRepository.create).toHaveBeenCalled();
      expect(transactionRepository.save).toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('error', 'Ubicación no encontrada');
      expect(result).toHaveProperty('restaurants');

      if (result.restaurants && Array.isArray(result.restaurants)) {
        expect(result.restaurants.length).toBe(0);
      }
    });
  });

  describe('findAll', () => {
    it('should return all transactions for a user', async () => {
      // Mock data
      const user = { id: 'user-id', name: 'Test User' } as User;
      const transactions = [
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

      transactionRepository.find!.mockResolvedValue(transactions);

      const result = await service.findAll(user);

      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: {
          user: {
            id: user.id,
          },
        },
      });
      expect(result).toEqual(transactions);
    });

    it('should return a message when no transactions are found', async () => {
      // Mock data
      const user = { id: 'user-id', name: 'Test User' } as User;

      transactionRepository.find!.mockResolvedValue([]);

      const result = await service.findAll(user);

      expect(transactionRepository.find).toHaveBeenCalled();
      expect(result).toEqual({ message: 'No hay transacciones' });
    });
  });
});
