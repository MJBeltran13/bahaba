import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin with service account
const serviceAccount = {
  projectId: "bahaba-a4a2e",
  privateKeyId: "98d78dfbbd6cdbfd3061df2dc2a5a9ec4015929a",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDGN4NNo/9k40my\n+h1ZDs1II58kgsTMVGWnwvxQpK2kMOowS+QW/msSnVoSZ81Z6snpN0wqqL/LoLJX\nT5NRV9eDVO/j8M2VcO/QI9dJIV4kWx8AGNjTxBJWS58Cz3/xwAZtJzc3uFMUmq0P\n6so3ZoGD+/z9j7rMXeHBt7DVSxfd4TKxbjcu67bjlZgKWPo3yNekaP7wz6BsJJz/\nR2BdXcSlpbKJkJofG2sY2HBG4H+mV+uJt7lkaa4PrOxWdf4cLMbbrOHCg0weYIrO\ndMhZoMow2d8n5wPc2dOektHl1F/8kRVxlr4ezw/tUXdagJs5dw4CLqO8OAg0+57E\nqclDg9BTAgMBAAECggEAW7PzG0h0L8i3oAX27ezbLDTOu6WERsQFA8hB001cyEmZ\nDx8NN1YdU09ZDIrZhnAJWcwrgNDxatO9rocyML/jBO+WzG3rrufBCxqJz1uQomFF\nxlW4esCLe0EhH7vABahBUN6DvVOZnD6zMln9lAPoh5ddRDHqygHlICpLtWI4eH2W\nuSkRZu6TYWuUeCrDdi8NkN9SeQJ9Afa4Z579kOTjI58L5f83s5X0KHLLHoXixK6w\nSP5+HWXtH88wxeWxkJTL0UXRhK3Ob7tneE73ps8MsR+QKItj+YUrNXLKK+Jd+Bs6\n6ZVN6jFjd39HP2wf01lhQ9N+gThQPWuiTIHr74ragQKBgQDsYu3ThBd/MkBbgu2K\n+5iy6KyA0coiHJFNEz7jKwbBmoUvBeKXkt2MiSbSid35tZcrj5N2RG39fTMIuN8X\nykRKDvL00iGRh8pY4UlGGUP1QNCLRz8ajcQ652Ci3Kj5VGrMilNhwKbT4Px7Ke9G\n9tb7rnB7xyhsKc0q3wMrLAEnlwKBgQDWqdNhxqh+4uut+ZRE8XX0XvRB70q+tlln\ntlbMfy/NEdz4u2EG2Nvcrvn+281rx0RsSkMA1EwdrakqoZZucKfPBQvEl8RR6ZXd\nMTO/8Jn/wq1RpcsQlE89tXTsLSIhq9q+H3Wv2+8cOfhShlKnE4kRIodsi1x2+t7A\nJ896r26UpQKBgQCNDj+CfwkSYqcatFcRHy8wWz1MpWMr1cYyqvBU2EDw2EbvF2Du\nN7oyeUkMSy6FKoHpgYRqB01m/QWuB7tAU/dKBf+ebaGQWOo6/TwfM0ZlG+cVpU8X\nhk75I0Z8CJZgKaqNIWG+LBqgxlmDGTPqMbN5fc8rXV1Wpd8C3Q7j/R83QwKBgHD6\n7wtOII6v5jUp37StlVRpyYsOY7ueg83HNUXqRwFavn+XN4kACC/NVDyj+SkZttR7\n/WnpUqpoJVoPs/oqhte5oyj0a9pk44CIjeEexB7NmqUXapouRMqIv6IyWv130ugv\n7KQDUIT9qcndcpEHAiQnlTk23BKvFR/zlArRXJUVAoGAHvev3Ao1fyMFG1tIUFg8\nNQ/LjVIn3hLRZrYchTH7UTZ6xDS872wkFsbNUK17OqJLrs8P/K8IPA9xgUtWTabE\nScVGCvEbqHg9y/lsYOmrVRf14XXWKsBo4lDmgNaR7WBPZ+AhpQwEaX8YA78zWfvf\nSjUN7fDmj7T6LUWH7y3EyC0=\n-----END PRIVATE KEY-----\n",
  clientEmail: "firebase-adminsdk-fbsvc@bahaba-a4a2e.iam.gserviceaccount.com"
};

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

// Generate test data
async function generateData() {
  const now = Date.now();
  
  // Create initial document to ensure collection exists
  await db.collection('readings').doc('initial').set({
    timestamp: now,
    gateId: 'north',
    level: 15,
    risk: 'low'
  });
  
  const batch = db.batch();
  let count = 0;
  
  // Generate readings for the last 2 hours
  for (let i = 0; i < 24; i++) {
    const timestamp = now - i * 5 * 60 * 1000; // Every 5 minutes
    const gates = ['north', 'south', 'east'];
    
    for (const gateId of gates) {
      const doc = db.collection('readings').doc();
      
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
      
      batch.set(doc, {
        timestamp,
        gateId,
        level,
        risk
      });
      
      count++;
    }
  }
  
  await batch.commit();
  console.log(`Generated ${count} readings successfully!`);
}

// Run the generator
generateData().catch(console.error);