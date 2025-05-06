/**
 * Servicio que gestiona la autenticación de usuarios
 * Maneja la creación de usuarios, login, logout y generación de tokens JWT
 */
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

  /**
   * Crea un nuevo usuario en la base de datos
   * @param createAuthDto Datos del usuario a crear
   * @returns Usuario creado con su token de autenticación
   * @throws BadRequestException si el usuario ya existe
   */
  async create(createAuthDto: CreateUserDto) {

    try {
      // Extraemos la contraseña para hashearla por separado
      const { password, ...userData } = createAuthDto;

      // Verificamos si el usuario ya existe
      const userExists = await this.userRepository.findOne({
        where: { email: userData.email },
        select: { email: true }
      })

      if (userExists) {
        throw new BadRequestException('User already exists'); //TODO: create custom exception
      }

      // Creamos el usuario con la contraseña hasheada
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      })

      await this.userRepository.save(user);

      // Devolvemos el usuario y generamos su token
      return {
        email: user.email,
        token: this.getJwtToken({ id: user.id })
      }

    } catch (error) {
      this.handleDBError(error);
    }

  }

  /**
   * Autentica a un usuario en el sistema
   * @param loginUserDto Credenciales de usuario (email y contraseña)
   * @returns Token JWT para uso en peticiones autenticadas
   * @throws BadRequestException si las credenciales son inválidas
   */
  async login(loginUserDto: LoginUserDto): Promise<{ token: string }> {
    const { password, email } = loginUserDto;

    // Buscamos al usuario por email
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true }
    })

    if (!user) {
      throw new BadRequestException('User not found, check your credentials');
    }

    // Verificamos la contraseña
    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException('Invalid password');
    }

    // Activamos al usuario si estaba inactivo
    if (!user.isActive) {
      await this.userRepository.update(user.id, { isActive: true });
    }

    // Generamos y devolvemos el token JWT
    return {
      token: this.getJwtToken({ id: user.id })
    };
  }

  /**
   * Cierra la sesión de un usuario marcándolo como inactivo
   * @param user Usuario a desconectar
   * @returns Mensaje de confirmación
   * @throws BadRequestException si el usuario no existe
   */
  async logOut(user: User): Promise<{ message: string }> {
    const { id } = user;

    // Verificamos que el usuario existe
    const userExists = await this.userRepository.findOne({
      where: { id },
      select: { id: true }
    })

    if (!userExists) {
      throw new BadRequestException('User not found');
    }

    // Marcamos al usuario como inactivo
    await this.userRepository.update(id, { isActive: false });

    return {
      message: 'User logged out successfully'
    }
  }

  /**
   * Maneja errores de base de datos
   * @param error Error capturado
   * @throws InternalServerErrorException o BadRequestException según el error
   */
  private handleDBError(error: any): never {
    if (error.code === '23505') {
      throw new InternalServerErrorException('User already exists');
    }
    throw new BadRequestException({ message: 'Database error', error: error.message });
  }

  /**
   * Genera un token JWT para el usuario
   * @param payload Datos a incluir en el token (ID de usuario)
   * @returns Token JWT firmado
   */
  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

}
