import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase-admin/firestore'
import { firebaseConfig } from "../constants/config";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);