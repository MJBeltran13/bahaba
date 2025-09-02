import { NextRequest } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { getServerEnv } from '@/lib/env';

export async function POST(req: NextRequest) {
  const env = getServerEnv();
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');
  if (token !== env.SEED_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const db = getAdminDb();
  const now = Date.now();
  const batch = db.batch();

  for (let i = 0; i < 20; i++) {
    const wRef = db.collection('weather').doc();
    batch.set(wRef, {
      timestamp: now - i * 60_000,
      temperatureC: 20 + Math.sin(i / 3) * 3,
      humidityPct: 60 + (i % 10),
      windKph: 10 + (i % 5),
      rainMm: Math.max(0, (i % 4) - 2),
    });

    const gates = ['north', 'south', 'east', 'west'];
    for (const gateId of gates) {
      const rRef = db.collection('readings').doc();
      const level = 50 + (i * 3) % 40;
      const risk = level > 80 ? 'high' : level > 65 ? 'medium' : 'low';
      batch.set(rRef, {
        timestamp: now - i * 60_000,
        gateId,
        level,
        risk,
      });
    }
  }

  await batch.commit();
  return Response.json({ ok: true });
}


