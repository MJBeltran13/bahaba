import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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
const db = getFirestore(app);

async function generateData() {
  const now = Date.now();
  let count = 0;
  
  // Generate readings for the last 2 hours
  for (let i = 0; i < 24; i++) {
    const timestamp = now - i * 5 * 60 * 1000; // Every 5 minutes
    const gates = ['north', 'south', 'east'];
    
    for (const gateId of gates) {
      // Simulate rising water levels based on time
      const baseLevel = 15; // Base water level
      const timeVariation = Math.sin((i / 24) * Math.PI) * 10; // Varies by ±10 inches
      const randomVariation = (Math.random() - 0.5) * 5; // Random ±2.5 inches
      
      // Add gate-specific patterns
      const gateVariation = 
        gateId === 'north' ? 5 : // North gate runs higher
        gateId === 'south' ? -2 : // South gate runs lower
        0; // East gate is baseline
      
      const level = Math.max(5, baseLevel + timeVariation + randomVariation + gateVariation);
      const risk = level > 32 ? 'high' : level > 20 ? 'medium' : 'low';
      
      try {
        await addDoc(collection(db, 'readings'), {
          timestamp,
          gateId,
          level,
          risk
        });
        count++;
        console.log(`Added reading ${count}: Gate ${gateId}, Level ${level.toFixed(1)}`);
      } catch (err) {
        console.error('Error adding reading:', err);
      }
    }
  }
  
  console.log(`\nGenerated ${count} readings successfully!`);
}

// Run the generator
generateData().catch(console.error);
