import { NextRequest, NextResponse } from "next/server";
import admin from "@/app/config/firebaseAdmin";
import { verifyAuthToken } from "@/app/utills/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    if (!user || !user.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, lastMessage, participantIds } = await request.json();

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    const db = admin.firestore();
    const chatRef = db.collection("chats").doc(chatId);

    const updates: any = {};

    if (lastMessage) {
      updates.lastMessage = {
        text: lastMessage.text,
        time: lastMessage.time,
      };
    }

    if (participantIds && Array.isArray(participantIds)) {
      participantIds.forEach((id: string) => {
        if (id !== user.uid) {
          updates[`unRead.${id}`] = admin.firestore.FieldValue.increment(1);
        }
      });
    }

    if (Object.keys(updates).length > 0) {
      await chatRef.update(updates);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}
