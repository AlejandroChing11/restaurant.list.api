import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService],
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    AuthModule
  ],
})
export class TransactionModule {}
