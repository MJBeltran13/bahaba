import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import fs from 'fs';

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importData() {
  try {
    // Read JSON file
    const jsonData = JSON.parse(fs.readFileSync('./data/readings.json', 'utf8'));
    
    // Import each reading
    for (const reading of jsonData.readings) {
      try {
        const docRef = await addDoc(collection(db, 'readings'), reading);
        console.log('Added document with ID:', docRef.id);
      } catch (e) {
        console.error('Error adding document:', e);
      }
    }
    
    console.log('Import completed!');
  } catch (e) {
    console.error('Error:', e);
  }
}

// Run the import
importData();
