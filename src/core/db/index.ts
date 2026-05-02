import * as admin from 'firebase-admin';
import { firebaseConfig } from "../constants/config";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: firebaseConfig.projectId,
  });
}
export const db = admin.firestore();