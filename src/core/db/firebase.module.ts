import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { firebaseProvider } from "./firebase.service";
import { FirebaseRepository } from "./firebase.repository";

@Module({
  imports: [ConfigModule],
  providers: [firebaseProvider, FirebaseRepository],
  exports: [firebaseProvider, FirebaseRepository],
})
export class FirebaseModule {}