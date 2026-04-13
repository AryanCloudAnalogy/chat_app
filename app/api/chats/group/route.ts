import { NextRequest, NextResponse } from "next/server";
import admin from "@/app/config/firebaseAdmin";
import { verifyAuthToken } from "@/app/utills/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);

    if (!user || !user.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, participantIds } = await request.json();

    if (!name || !Array.isArray(participantIds) || participantIds.length < 2) {
      return NextResponse.json(
        { error: "Group name and at least 2 participants are required" },
        { status: 400 }
      );
    }

    if (!participantIds.includes(user.uid)) {
      participantIds.push(user.uid);
    }

    const db = admin.firestore();
    const chatId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newChat = {
      chatId,
      name,
      isGroup: true,
      participants: participantIds,
      adminId: user.uid,
      lastMessage: null,
      unRead: participantIds.reduce((acc: Record<string, number>, id: string) => {
        acc[id] = 0;
        return acc;
      }, {}),
      createdAt: new Date().toISOString(),
    };

    await db.collection("chats").doc(chatId).set(newChat);
    return NextResponse.json(newChat, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
