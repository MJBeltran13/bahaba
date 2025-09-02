import { NextRequest } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { ReadingSchema } from '@/lib/models';

export async function GET() {
  const db = getAdminDb();
  const snapshot = await db
    .collection('readings')
    .orderBy('timestamp', 'desc')
    .limit(200)
    .get();
  const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return Response.json({ data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ReadingSchema.safeParse(body);
  if (!parsed.success) {
    return new Response('Invalid reading payload', { status: 400 });
  }
  const db = getAdminDb();
  const docRef = await db.collection('readings').add(parsed.data);
  return Response.json({ id: docRef.id });
}


