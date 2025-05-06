/**
 * Controlador para gestionar las operaciones de búsqueda de restaurantes
 * y el historial de transacciones de los usuarios
 */
import { Controller, Get, Post, Body } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/user.decorator';
import { ValidRoles } from '../auth/interfaces';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * Endpoint para buscar restaurantes según término de búsqueda y radio
   * Requiere autenticación con rol de usuario
   * @param createTransactionDto Datos de la búsqueda (término y radio opcional)
   * @param user Usuario autenticado que realiza la búsqueda
   * @returns Lista de restaurantes encontrados y metadatos de la búsqueda
   */
  @Auth(ValidRoles.user)
  @Post('search')
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @GetUser() user: User,
    ) {
    return this.transactionService.create(createTransactionDto, user);
  }

  /**
   * Endpoint para obtener el historial de búsquedas de un usuario
   * Requiere autenticación con rol de usuario
   * @param user Usuario autenticado del que se quiere obtener el historial
   * @returns Lista de transacciones/búsquedas realizadas por el usuario
   */
  @Auth(ValidRoles.user)
  @Get('history')
  findAll(
    @GetUser() user: User,
  ) {
    return this.transactionService.findAll(user);
  }

}
