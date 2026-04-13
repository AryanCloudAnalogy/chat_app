import { NextRequest, NextResponse } from "next/server";

const clients = new Map<import("ws").WebSocket, string>();

export function UPGRADE(client: import("ws").WebSocket) {
  console.log("Client connected");

  client.on("message", (message: any) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === "REGISTER") {
        clients.set(client, data.userId);
        clients.forEach((uid, ws) => {
          if (ws !== client && ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: "USER_ONLINE", userId: data.userId }));
          }
        });

        const onlineUsers = Array.from(new Set(clients.values()));
        client.send(JSON.stringify({ type: "ONLINE_USERS", users: onlineUsers }));
        return;
      }

      if (data.type === "TYPING" || data.type === "STOP_TYPING") {
        const { chatId, senderId, recipientId, participantIds } = data;
        const recipients = Array.isArray(participantIds) && participantIds.length > 0 ? participantIds : [recipientId];
        clients.forEach((userId, ws) => {
          if (recipients.includes(userId) && userId !== senderId && ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: data.type, chatId, senderId }));
          }
        });
        return;
      }

      if (data.type === "SEND_MESSAGE") {
        const { chatId, message: msg, recipientId, participantIds } = data;
        
        const recipients = Array.isArray(participantIds) && participantIds.length > 0 
          ? participantIds 
          : [recipientId];

        clients.forEach((userId, ws) => {
          if (recipients.includes(userId) && userId !== msg.senderId && ws.readyState === ws.OPEN) {
            ws.send(
              JSON.stringify({
                type: "NEW_MESSAGE",
                chatId,
                message: msg,
              }),
            );
          }
        });
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  client.on("close", () => {
    const userId = clients.get(client);
    if (userId) {
      clients.delete(client);
    } else {
      console.log("Client disconnected");
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (data.type === "TYPING" || data.type === "STOP_TYPING") {
      const { chatId, senderId, recipientId, participantIds } = data;
      const recipients = Array.isArray(participantIds) && participantIds.length > 0 
        ? participantIds 
        : [recipientId];

      clients.forEach((userId, ws) => {
        if (recipients.includes(userId) && ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: data.type,
            chatId,
            senderId,
          }));
        }
      });
    }

    if (data.type === "SEND_MESSAGE") {
      const { chatId, message: msg, recipientId, participantIds } = data;
      const recipients = Array.isArray(participantIds) && participantIds.length > 0 
        ? participantIds 
        : [recipientId];

      clients.forEach((userId, ws) => {
        if (recipients.includes(userId) && ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: "NEW_MESSAGE",
            chatId,
            message: msg,
          }));
        }
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in WS POST handler:", error);
    return NextResponse.json({ error: "Failed to broadcast" }, { status: 500 });
  }
}
