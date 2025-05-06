/**
 * Controlador para gestionar las operaciones de autenticación de usuarios
 * Maneja endpoints para registro, login y logout de usuarios
 */
import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponse } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { Auth } from './decorators/user.decorator';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint para crear un nuevo usuario en el sistema
   * @param createUserDto Datos necesarios para crear un usuario
   * @returns Usuario creado y su token de autenticación
   */
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  /**
   * Endpoint para autenticar a un usuario en el sistema
   * @param loginUsuarioDto Credenciales de inicio de sesión
   * @returns Token JWT para autenticación
   */
  @ApiResponse({
    status: 201,
    description: 'Login successful',
  })
  @ApiResponse({
    status: 403,
    description: 'Token expired',
  })
  @Post('login')
  login(@Body() loginUsuarioDto: LoginUserDto): Promise<{ token: string }> {
    return this.authService.login(loginUsuarioDto);
  }

  /**
   * Endpoint para cerrar la sesión de un usuario
   * Requiere autenticación con rol de usuario
   * @param user Usuario actual obtenido del token JWT
   * @returns Mensaje de confirmación de cierre de sesión
   */
  @Auth(ValidRoles.user)
  @Get('logout')
  logout(
    @GetUser() user: User
  ) {
    return this.authService.logOut(user);
  }
}
