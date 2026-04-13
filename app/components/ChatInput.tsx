"use client";
import React, { useState, useRef, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";

import { sendMessage } from "../redux/messagesThunk";
import { State } from "../Types";
import { AppDispatch } from "../redux/store";
import { addMessage } from "../redux/messagesSlice";
import { SocketContext } from "../page";

type Props = {
  chatId: string | null;
  receiverId: string | null;
};

export const ChatInput = ({ chatId, receiverId }: Props) => {
  const [text, setText] = useState("");
  const { currentUserId } = useSelector((state: State) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const { socket } = useContext(SocketContext);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const Chat: any = useSelector((state: State) => state.chat);
  const chat = Chat.chats?.find((c: any) => c.chatId === chatId);
  const participantIds = chat?.participants || [];

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() || !currentUserId) return;

    const newMessage: any = {
      messageId: `m_${currentUserId}_${Date.now()}`,
      chatId,
      senderId: currentUserId,
      receiverId,
      text,
      time: new Date().toISOString(),
      status: "Sending",
    };

    dispatch(sendMessage(newMessage));
    setText("");

    if (socket && socket.readyState === WebSocket.OPEN && currentUserId && chatId) {
      socket.send(JSON.stringify({
        type: "STOP_TYPING",
        chatId,
        senderId: currentUserId,
        recipientId: receiverId,
        participantIds
      }));
    }

    return dispatch(addMessage(newMessage));
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    
    if (socket && socket.readyState === WebSocket.OPEN && currentUserId && chatId) {
      socket.send(JSON.stringify({
        type: "TYPING",
        chatId,
        senderId: currentUserId,
        recipientId: receiverId,
        participantIds
      }));
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: "STOP_TYPING",
            chatId,
            senderId: currentUserId,
            recipientId: receiverId,
            participantIds
          }));
        }
      }, 2000);
    }
  };

  return (
    <form onSubmit={handleSend} className="flex items-center gap-2 p-3">
      <button type="button" className="text-gray-500 hover:text-gray-700">
        😊
      </button>

      <input
        type="text"
        value={text}
        onChange={handleTyping}
        placeholder="Type a message..."
        className="flex-1 px-3 py-2 rounded-full border"
      />

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-full"
      >
        Send
      </button>
    </form>
  );
};
