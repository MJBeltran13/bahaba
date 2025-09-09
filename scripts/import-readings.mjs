import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import fs from 'fs';

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

async function importReadings() {
  try {
    // Read the JSON file
    const data = JSON.parse(fs.readFileSync('./data/readings.json', 'utf8'));
    
    // Import each reading
    for (const reading of data.readings) {
      const { id, ...readingData } = reading;
      await set(ref(db, `readings/${id}`), readingData);
      console.log(`Imported reading: ${id}`);
    }
    
    console.log('All readings imported successfully!');
  } catch (error) {
    console.error('Error importing readings:', error);
  }
}

// Run the import
importReadings().catch(console.error);
