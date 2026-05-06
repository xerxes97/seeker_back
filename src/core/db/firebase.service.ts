import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export const firebaseProvider = {
  provide: 'FIREBASE_DB',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    if (admin.apps.length > 0) {
      return admin.app();
    }
    const config: admin.AppOptions = {
      credential: admin.credential.cert({
        clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
        privateKey: configService.get('FIREBASE_PRIVATE_KEY'),
        projectId: configService.get('FIREBASE_PROJECT_ID'),
      }),
    };
    return admin.initializeApp(config);
  },
};
