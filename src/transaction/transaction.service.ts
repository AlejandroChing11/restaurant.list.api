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

  async create(createTransactionDto: CreateTransactionDto, user: User) {

    try {

      const transaction = this.transactionRepository.create({
        ...createTransactionDto,
        user: user
      });
      await this.transactionRepository.save(transaction);

      let lat, lon;

      const coordsPattern = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
      const coordsMatch = createTransactionDto.searchTerm.match(coordsPattern);

      if (coordsMatch) {
        lat = parseFloat(coordsMatch[1]);
        lon = parseFloat(coordsMatch[3]);
      } else {

        const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(createTransactionDto.searchTerm)}&apiKey=${process.env.GEOGRAPHY_API_KEY}`;
        const geocodeResponse = await axios.get(geocodeUrl);

        if (!geocodeResponse.data.features || geocodeResponse.data.features.length === 0) {
          return { error: 'Ubicación no encontrada', restaurants: [] };
        }

        const location = geocodeResponse.data.features[0].geometry.coordinates;
        lon = location[0];
        lat = location[1];

      }

      const radius = createTransactionDto.radius || 1000;
      const placesUrl = `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${lon},${lat},${radius}&limit=20&apiKey=${process.env.GEOGRAPHY_API_KEY}`;
      
      const restaurantsResponse = await axios.get(placesUrl);

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

  async findAll(user: User) {

    try {

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
