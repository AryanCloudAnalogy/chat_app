import { NextRequest, NextResponse } from 'next/server';
import admin from '@/app/config/firebaseAdmin';
import { verifyAuthToken } from '@/app/utills/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; }>; }) {
    try {
        const user = await verifyAuthToken(request);
        if (!user || !user.uid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = admin.firestore();
        const id = (await params).id;
        const userRef = db.collection('users').doc(id);
        const userSnap = await userRef.get();

        if (!userSnap.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        return NextResponse.json(userSnap.data());
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
