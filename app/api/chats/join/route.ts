import { NextRequest, NextResponse } from "next/server";
import admin from "@/app/config/firebaseAdmin";
import { verifyAuthToken } from "@/app/utills/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);

    if (!user || !user.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await request.json();

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const chatRef = db.collection("chats").doc(chatId);
    const chatSnap = await chatRef.get();

    if (!chatSnap.exists) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const chat = chatSnap.data();

    if (!chat?.isGroup) {
      return NextResponse.json(
        { error: "Cannot join a direct chat" },
        { status: 400 }
      );
    }

    if (chat.participants.includes(user.uid)) {
      return NextResponse.json(chat);
    }

    const updatedParticipants = [...chat.participants, user.uid];
    const updatedUnRead = { ...chat.unRead, [user.uid]: 0 };

    await chatRef.update({
      participants: updatedParticipants,
      unRead: updatedUnRead,
    });

    const updatedChat = {
      ...chat,
      participants: updatedParticipants,
      unRead: updatedUnRead,
    };

    return NextResponse.json(updatedChat);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
