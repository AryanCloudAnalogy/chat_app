import { NextResponse } from 'next/server';
import admin from '@/app/config/firebaseAdmin';
import { verifyAuthToken } from '@/app/utills/auth';

export async function GET(request: Request) {
  try {
    const user = await verifyAuthToken(request);
    const uid = user.uid;

    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      return NextResponse.json(userSnap.data());
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch user data" }, { status: 500 });
  }
}