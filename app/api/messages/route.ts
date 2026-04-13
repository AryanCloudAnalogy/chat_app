import { NextRequest, NextResponse } from "next/server";
import admin from "@/app/config/firebaseAdmin";
import { verifyAuthToken } from "@/app/utills/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);

    if (!user || !user.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newMessage } = await request.json();
    if (!newMessage?.chatId || !newMessage?.senderId || !newMessage?.text) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const messageId = String(
      newMessage.messageId ||
      `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    );
    const messageDoc = {
      messageId,
      chatId: String(newMessage.chatId),
      senderId: String(newMessage.senderId),
      receiverId: String(newMessage.receiverId),
      text: String(newMessage.text),
      time: String(newMessage.time || new Date().toISOString()),
      status: String(newMessage.status || "delivered"),
    };

    const db = admin.firestore();
    await db.collection("messages").doc(messageId).set(messageDoc);

    const chatRef = db.collection("chats").doc(messageDoc.chatId);
    const chatSnap = await chatRef.get();

    if (chatSnap.exists) {
      const chat = chatSnap.data();
      const participants = Array.isArray(chat?.participants)
        ? chat.participants
        : [];
      const updatedUnRead = { ...(chat?.unRead || {}) };

      participants.forEach((uid: string) => {
        if (uid === messageDoc.senderId) return;
        updatedUnRead[uid] = (updatedUnRead[uid] || 0) + 1;
      });

      await chatRef.update({
        lastMessage: {
          text: messageDoc.text,
          time: messageDoc.time,
          senderId: messageDoc.senderId,
        },
        unRead: updatedUnRead,
      });
    }
    if (messageDoc.receiverId == 'gini_001') {
      await fetch(`${request.nextUrl.origin}/api/ws`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TYPING",
          chatId: messageDoc.chatId,
          recipientId: messageDoc.senderId,
          senderId: messageDoc.receiverId,
        }),
      }).catch(err => console.error("Internal WS broadcast failed:", err));
      const res = await getAnswerFromAI(messageDoc.text);
      const newMesageDoc = {
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        chatId: String(newMessage.chatId),
        senderId: String(newMessage.receiverId),
        receiverId: String(newMessage.senderId),
        text: String(res.text),
        time: String(new Date().toISOString()),
        status: String(newMessage.status || "delivered"),
      };
      await db.collection("messages").doc(newMesageDoc.messageId).set(newMesageDoc);

      await chatRef.update({
        lastMessage: {
          text: newMesageDoc.text,
          time: newMesageDoc.time,
          senderId: newMesageDoc.senderId,
        },
        [`unRead.${newMesageDoc.receiverId}`]: admin.firestore.FieldValue.increment(1),
      });

      await fetch(`${request.nextUrl.origin}/api/ws`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "STOP_TYPING",
          chatId: messageDoc.chatId,
          recipientId: messageDoc.senderId,
          senderId: messageDoc.receiverId,
        }),
      }).catch(err => console.error("Internal WS broadcast failed:", err));

      await fetch(`${request.nextUrl.origin}/api/ws`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SEND_MESSAGE",
          chatId: newMesageDoc.chatId,
          recipientId: newMesageDoc.receiverId,
          message: newMesageDoc,
        }),
      }).catch(err => console.error("Internal WS broadcast failed:", err));
    }

    return NextResponse.json(messageDoc, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

async function getAnswerFromAI(message: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `You are a sarcastic, witty, and slightly dramatic Genie trapped inside a Node.js 
  server. You are legally obligated to answer questions, but you do so with 
  puns, playful insults, and magical flair. 

  Rules:
  1. Never give a boring answer.
  2. Use emoji like 🧞‍♂️, ✨, and 💨.
  3. If a user asks for something impossible, mock them gently.
  4. Keep it short and punchy.

  User message: ${message}
`;

  try {
    const result = await model.generateContent(prompt);
    const res = await result.response.text();
    return { text: res };
  } catch (error) {
    console.error("Error generating content:", error);
    return { text: "Internal Server Error" }
  }
}
