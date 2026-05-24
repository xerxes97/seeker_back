import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const mode = configService.get('ENV') || 'dev';
  const origin = configService.get('FRONT_DOMAIN');
  const isProd = mode !== 'dev';

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true, transformOptions: { enableImplicitConversion: true }, }));

  app.enableCors(
    isProd
      ? {
          origin: [origin],
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
          credentials: true,
        }
      : {
          origin: (origin, callback) => {
            callback(null, origin);
          },
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
          credentials: true,
        },
  );

  const port = configService.get('PORT') || 3001;
  await app.listen(port);
  console.log(`Server running in ${mode} mode on port ${port}`);
}
bootstrap();
