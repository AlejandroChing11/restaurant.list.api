import { Controller, Get, Post, Body } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/user.decorator';
import { ValidRoles } from 'src/auth/interfaces';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@ApiTags('transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Auth(ValidRoles.user)
  @Post('search')
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @GetUser() user: User,
    ) {
    return this.transactionService.create(createTransactionDto, user);
  }

  @Auth(ValidRoles.user)
  @Get('history')
  findAll(
    @GetUser() user: User,
  ) {
    return this.transactionService.findAll(user);
  }

}
