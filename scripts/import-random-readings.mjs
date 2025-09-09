import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(new URL('../bahaba-a4a2e-firebase-adminsdk-fbsvc-98d78dfbbd.json', import.meta.url))
);

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://bahaba-a4a2e-default-rtdb.firebaseio.com"
});

const db = getDatabase();

// Function to generate a random number between min and max (inclusive)
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to determine risk level based on water level
function getRiskLevel(level) {
  if (level >= 20) return 'danger';
  if (level >= 13) return 'warning';
  if (level >= 8) return 'low';
  return 'low';
}

// Generate random readings for the last 90 minutes
async function generateAndImportReadings() {
  const readings = [];
  const now = Date.now();
  const gates = ['north', 'south', 'east'];
  
  // Generate data points every 10 minutes for the last 90 minutes
  for (let minutesAgo = 90; minutesAgo >= 0; minutesAgo -= 10) {
    const timestamp = now - (minutesAgo * 60 * 1000);
    
    // Generate readings for each gate
    for (const gate of gates) {
      // Generate slightly different ranges for each gate
      let minLevel, maxLevel;
      switch (gate) {
        case 'north':
          minLevel = 8;
          maxLevel = 22;
          break;
        case 'south':
          minLevel = 6;
          maxLevel = 20;
          break;
        case 'east':
          minLevel = 7;
          maxLevel = 21;
          break;
      }
      
      const level = randomBetween(minLevel, maxLevel);
      readings.push({
        timestamp,
        gateId: gate,
        level,
        risk: getRiskLevel(level)
      });
    }
  }

  try {
    // Clear existing readings
    await db.ref('readings').set(null);
    
    // Import new readings
    await db.ref('readings').set(readings);
    console.log(`Successfully imported ${readings.length} random readings`);
  } catch (error) {
    console.error('Error importing readings:', error);
  }
  
  // Close the database connection
  process.exit(0);
}

// Run the import
generateAndImportReadings();
