import { NextResponse } from 'next/server';
import admin from '@/app/config/firebaseAdmin';
import { State } from '@/app/Types';
import { verifyAuthToken } from '@/app/utills/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  
  try {
    // await verifyAuthToken(request);
    const userId = (await params).id;
    const db = admin.firestore();
    const snap = await db.collection('chats').where('participants', 'array-contains', userId).get();
    const chats = snap.docs.map((d: any) => d.data());
    return NextResponse.json(chats);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Invalid token' }, { status: 401 });
  }
}