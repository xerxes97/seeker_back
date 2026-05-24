import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        JwtStrategy.fromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  private static fromCookie(req: Request): string | null {
    if (req.cookies?.access_token) {
      return req.cookies.access_token;
    }
    return null;
  }

  validate(payload: any) {
    if (!payload) return null;
    const typedPayload = payload as Record<string, any>;
    return {
      userId: typedPayload.sub as string,
      email: typedPayload.email as string,
    };
  }
}
