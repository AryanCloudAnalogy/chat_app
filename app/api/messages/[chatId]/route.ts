import { NextRequest, NextResponse } from 'next/server';
import admin from '@/app/config/firebaseAdmin';
import { verifyAuthToken } from '@/app/utills/auth';
import { State } from '@/app/Types';

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const response = NextResponse.next();
    const user = await verifyAuthToken(request);

    if (!user || !user.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = (await params);
    const db = admin.firestore();
    const snap = await db
      .collection('messages')
      .where('chatId', '==', chatId)
      .orderBy('time', 'asc')
      .get();

    return NextResponse.json(snap.docs.map((d:any) => d.data()));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}
