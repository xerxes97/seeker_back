import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { MatchingModule } from './matching/matching.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FirebaseModule } from './core/db/firebase.module';
import firebaseConfig from './core/db/config';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [firebaseConfig],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('THROTTLE_TTL') || 60000,
            limit: configService.get('THROTTLE_LIMIT') || 10,
          },
        ],
      }),
    }),
    PostsModule,
    UserProfileModule,
    MatchingModule,
    UserModule,
    AuthModule,
    FirebaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
