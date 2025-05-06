import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  async create(createAuthDto: CreateUserDto) {

    try {

      const { password, ...userData } = createAuthDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      })

      await this.userRepository.save(user);

      return {
        ...user,
        password: this.getJwtToken(user)
      }


    } catch (error) {
      this.handleDBError(error);
    }

  }

  async login(loginUserDto: LoginUserDto): Promise<{ token: string }> {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true }
    })

    if (!user) {
      throw new BadRequestException('User not found, check your credentials');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException('Invalid password');
    }

    return {
      token: this.getJwtToken({ id: user.id })
    };
  }

  private handleDBError(error: any): never {
    if (error.code === '23505') {
      throw new InternalServerErrorException('Usuario ya existe');
    }
    throw new BadRequestException({ message: 'Error en la base de datos', error: error.message });
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

}
