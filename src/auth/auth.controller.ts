import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponse } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

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



}
