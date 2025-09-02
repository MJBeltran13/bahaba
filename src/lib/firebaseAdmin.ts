import { cert, getApps, initializeApp, App, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getServerEnv } from './env';

let adminApp: App | undefined;

export function getAdminApp(): App {
  if (!getApps().length) {
    const env = getServerEnv();
    const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    adminApp = initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      projectId: env.FIREBASE_PROJECT_ID,
    });
  } else {
    adminApp = getApp();
  }
  return adminApp!;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}


