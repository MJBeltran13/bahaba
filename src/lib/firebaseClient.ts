import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getDatabase, ref, onValue, query, limitToLast, orderByChild } from 'firebase/database';

let app = undefined as unknown as ReturnType<typeof initializeApp> | undefined;
let analyticsInstance: Analytics | null = null;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAdnk5PIVXorEssRHpw5cHpNiCQ8F3b9U",
  authDomain: "bahaba-a4a2e.firebaseapp.com",
  databaseURL: "https://bahaba-a4a2e-default-rtdb.firebaseio.com",
  projectId: "bahaba-a4a2e",
  storageBucket: "bahaba-a4a2e.firebasestorage.app",
  messagingSenderId: "1063278281195",
  appId: "1:1063278281195:web:debf924a7812eb2f18d9ae",
  measurementId: "G-G6YENY4Q41"
} as const;

export function getFirebaseApp() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  return app;
}

export function getRealtimeDb() {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  return getDatabase(firebaseApp);
}

export function subscribeToReadings(callback: (readings: any[]) => void, errorCallback?: (error: Error) => void) {
  const db = getRealtimeDb();
  if (!db) return () => {};

  try {
    const readingsRef = ref(db, 'readings');
    const readingsQuery = query(
      readingsRef,
      orderByChild('timestamp'),
      limitToLast(200)
    );

    const unsubscribe = onValue(readingsQuery, 
      (snapshot) => {
        const readings: any[] = [];
        snapshot.forEach((childSnapshot) => {
          readings.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        // Sort by timestamp in descending order (most recent first)
        readings.sort((a, b) => b.timestamp - a.timestamp);
        callback(readings);
      },
      (error) => {
        console.error('Realtime Database error:', error);
        if (errorCallback) errorCallback(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up Realtime Database listener:', error);
    if (errorCallback) errorCallback(error as Error);
    return () => {};
  }
}

export async function getClientAnalytics() {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (typeof window === 'undefined') return null;
  if (analyticsInstance) return analyticsInstance;
  
  // Only initialize analytics in production and if supported
  if (process.env.NODE_ENV === 'production') {
    const supported = await isSupported().catch(() => false);
    if (supported) {
      analyticsInstance = getAnalytics(firebaseApp);
    }
  }
  return analyticsInstance;
}

