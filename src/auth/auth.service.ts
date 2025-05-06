import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';

import { JwtPayload } from './interfaces';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

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

      const userExists = await this.userRepository.findOne({
        where: { email: userData.email },
        select: { email: true }
      })

      if (userExists) {
        throw new BadRequestException('User already exists'); //TODO: create custom exception
      }

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

  async logOut(user: User): Promise<void> {
    const { id } = user;

    const userExists = await this.userRepository.findOne({
      where: { id },
      select: { id: true }
    })

    if (!userExists) {
      throw new BadRequestException('User not found');
    }

    await this.userRepository.update(id, { isActive: false });
  }

  private handleDBError(error: any): never {
    if (error.code === '23505') {
      throw new InternalServerErrorException('User already exists');
    }
    throw new BadRequestException({ message: 'Database error', error: error.message });
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

}
