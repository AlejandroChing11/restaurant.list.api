/**
 * Servicio que gestiona la búsqueda de restaurantes y el registro de transacciones
 * Se conecta con APIs externas para geolocalización y búsqueda de lugares
 */
import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class TransactionService {

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ){}

  /**
   * Crea una transacción y busca restaurantes según término de búsqueda
   * @param createTransactionDto Datos de la búsqueda (término y radio opcional)
   * @param user Usuario que realiza la búsqueda
   * @returns Listado de restaurantes encontrados con metadatos
   */
  async create(createTransactionDto: CreateTransactionDto, user: User) {

    try {
      // Creamos y guardamos el registro de la transacción
      const transaction = this.transactionRepository.create({
        ...createTransactionDto,
        user: user
      });
      await this.transactionRepository.save(transaction);

      let lat, lon;

      // Comprobamos si el término de búsqueda es directamente coordenadas
      const coordsPattern = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
      const coordsMatch = createTransactionDto.searchTerm.match(coordsPattern);

      if (coordsMatch) {
        // Si el usuario ingresó coordenadas directamente
        lat = parseFloat(coordsMatch[1]);
        lon = parseFloat(coordsMatch[3]);
      } else {
        // Si el usuario ingresó una dirección o lugar, convertimos a coordenadas
        const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(createTransactionDto.searchTerm)}&apiKey=${process.env.GEOGRAPHY_API_KEY}`;
        const geocodeResponse = await axios.get(geocodeUrl);

        if (!geocodeResponse.data.features || geocodeResponse.data.features.length === 0) {
          return { error: 'Ubicación no encontrada', restaurants: [] };
        }

        const location = geocodeResponse.data.features[0].geometry.coordinates;
        lon = location[0];
        lat = location[1];
      }

      // Establecemos el radio de búsqueda (por defecto 1000m si no se especificó)
      const radius = createTransactionDto.radius || 1000;

      // Realizamos la búsqueda de restaurantes cercanos
      const placesUrl = `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${lon},${lat},${radius}&limit=20&apiKey=${process.env.GEOGRAPHY_API_KEY}`;
      
      const restaurantsResponse = await axios.get(placesUrl);

      // Transformamos la respuesta para tener un formato más limpio
      const restaurants = restaurantsResponse.data.features.map(place => {
        const properties = place.properties;
        return {
          id: properties.place_id,
          name: properties.name,
          location: {
            lat: place.geometry.coordinates[1],
            lon: place.geometry.coordinates[0]
          },
          address: {
            formatted: properties.formatted,
            street: properties.street,
            housenumber: properties.housenumber,
            suburb: properties.suburb,
            city: properties.city,
            state: properties.state,
            postcode: properties.postcode,
            country: properties.country
          },
          contact: {
            phone: properties.phone,
            website: properties.website
          },
          categories: properties.categories,
          distance: properties.distance,
          opening_hours: properties.opening_hours,
          wheelchair: properties.wheelchair
        };
      });

      // Devolvemos el resultado estructurado
      return {
        searchLocation: {
          query: createTransactionDto.searchTerm,
          resolvedLocation: {
            lat,
            lon
          }
        },
        count: restaurants.length,
        restaurants: restaurants
      };

    } catch (error) {
      console.error('Error buscando restaurantes:', error);
      throw new Error('Error al buscar restaurantes: ' + error.message);
    }
  }

  /**
   * Obtiene el historial de búsquedas de un usuario
   * @param user Usuario del que se quiere obtener el historial
   * @returns Listado de transacciones del usuario
   */
  async findAll(user: User) {

    try {
      // Buscamos todas las transacciones del usuario
      const transactions = await this.transactionRepository.find({
        where: {
          user: {
            id: user.id
          }
        }
      })

      if (transactions.length === 0) {
        return { message: 'No hay transacciones' };
      }

      return transactions;

    } catch (error) {
      console.error('Error buscando transacciones:', error);
      throw new Error('Error al buscar transacciones: ' + error.message);
    }
  }
}
