import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Res,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { GetUserId } from './decorators/get-user.decorator';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { getCookieConfig, getCookieOptions } from './config/cookie.config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

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

  @Get('verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify authentication status' })
  @ApiResponse({ status: 200, description: 'Returns true if user is authenticated' })
  verify(@GetUserId() userId: string | undefined) {
    return { valid: !!userId };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { access_token } = await this.authService.login(dto);
      const isProd = this.configService.get('ENV') !== 'dev';

      res.cookie('access_token', access_token, getCookieConfig(isProd, dto.remember));

      return { success: true, token: access_token, userInfo: { name: 'John Doe' } };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      throw new BadRequestException(message);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  logout(@Res({ passthrough: true }) res: Response) {
    const isProd = this.configService.get('ENV') !== 'dev';

    res.clearCookie('access_token', getCookieOptions(isProd));

    return { success: true };
  }
}
