import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { FirebaseModule } from './core/db/firebase.module';
import firebaseConfig from './core/db/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [firebaseConfig],
    }),
    PostsModule,
    UserProfileModule,
    FirebaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
