import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import { JWT_EXPIRES_IN, JWT_EXPIRES_IN_REMEMBER } from './config/cookie.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const existing = await this.userService.getUserByEmail(dto.email);
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.userService.createUser({
      ...dto,
      name: `user_${crypto.randomBytes(4).toString('hex')}`,
      password: hashedPassword,
    });

    return {
      success: true,
      message: 'User registered successfully',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.getUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userWithPassword = user as unknown as { password: string };
    
    const isPasswordValid = await bcrypt.compare(dto.password, userWithPassword.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const expiresIn = dto.remember ? JWT_EXPIRES_IN_REMEMBER : JWT_EXPIRES_IN;
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn }),
    };
  }
}
