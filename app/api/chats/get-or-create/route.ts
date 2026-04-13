
import { NextRequest, NextResponse } from 'next/server';
import admin from '@/app/config/firebaseAdmin';
import { verifyAuthToken } from '@/app/utills/auth';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const user = await verifyAuthToken(request);

    if (!user || !user.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { participantIds } = await request.json();
    if (!Array.isArray(participantIds) || participantIds.length < 2) {
      return NextResponse.json({ error: "participantIds must be an array of 2+ ids" }, { status: 400 });
    }

    const normalized = [...new Set(participantIds)].sort();

    const db = admin.firestore();
    const chatId = normalized.join('_');
    const chatRef = db.collection('chats').doc(chatId);

    const existing = await chatRef.get();
    if (existing.exists) {
      return NextResponse.json(existing.data());
    }

    const newChat = {
      chatId,
      participants: normalized,
      lastMessage: null,
      unRead: normalized.reduce((acc: any, id: string) => {
        acc[id] = 0;
        return acc;
      }, {}),
    };

    await chatRef.set(newChat);
    return NextResponse.json(newChat, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}