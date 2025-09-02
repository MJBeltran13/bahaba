import { NextRequest } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { WeatherSchema } from '@/lib/models';

export async function GET() {
  const db = getAdminDb();
  const snapshot = await db
    .collection('weather')
    .orderBy('timestamp', 'desc')
    .limit(50)
    .get();
  const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return Response.json({ data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = WeatherSchema.safeParse(body);
  if (!parsed.success) {
    return new Response('Invalid weather payload', { status: 400 });
  }
  const db = getAdminDb();
  const docRef = await db.collection('weather').add(parsed.data);
  return Response.json({ id: docRef.id });
}


