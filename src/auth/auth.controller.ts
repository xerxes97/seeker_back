import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 200, description: 'User registered successfully' })
  async register(@Body() dto: CreateUserDto) {
    try {
      return await this.authService.register(dto);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      throw new BadRequestException(message);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async login(@Body() dto: LoginDto) {
    try {
      return await this.authService.login(dto);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      throw new BadRequestException(message);
    }
  }
}
