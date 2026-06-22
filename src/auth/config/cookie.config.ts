import { CookieOptions } from 'express';

export const JWT_EXPIRES_IN = '7d';
export const JWT_EXPIRES_IN_REMEMBER = '30d';
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
export const COOKIE_MAX_AGE_REMEMBER = 30 * 24 * 60 * 60 * 1000;

export function getCookieOptions(isProd: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  };
}

export function getCookieConfig(
  isProd: boolean,
  remember?: boolean,
): CookieOptions {
  return {
    ...getCookieOptions(isProd),
    maxAge: remember ? COOKIE_MAX_AGE_REMEMBER : COOKIE_MAX_AGE,
  };
}
