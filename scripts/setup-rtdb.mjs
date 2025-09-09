import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAAdnk5PIVXorEssRHpw5cHpNiCQ8F3b9U",
  authDomain: "bahaba-a4a2e.firebaseapp.com",
  databaseURL: "https://bahaba-a4a2e-default-rtdb.firebaseio.com",
  projectId: "bahaba-a4a2e",
  storageBucket: "bahaba-a4a2e.firebasestorage.app",
  messagingSenderId: "1063278281195",
  appId: "1:1063278281195:web:debf924a7812eb2f18d9ae",
  measurementId: "G-G6YENY4Q41"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Clear existing mock data
async function clearMockData() {
  try {
    await remove(ref(db, 'readings'));
    console.log('Cleared existing mock data');
  } catch (error) {
    console.error('Error clearing mock data:', error);
  }
}

// Run the cleanup
clearMockData().catch(console.error);
