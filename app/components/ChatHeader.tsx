"use client"
import React from "react";
import { formatDate } from "../utills/formatDate";
import { SocketContext } from "../page";
import { ApiUser } from "../Types";

export const ChatHeader = ({ reciever, chatId }:{reciever:ApiUser, chatId?: string | null}) => {
  const { onlineUsers, typingUsers } = React.useContext(SocketContext);
  const name = reciever?.name || reciever?.email || "Unknown";
  const photoUrl = reciever?.photoUrl;
  const isOnline = !reciever.isGroup && (onlineUsers.includes(reciever.uid) || reciever.uid === 'gini_001');
  const typingInChat = (chatId && typingUsers[chatId]) || [];
  const isTyping = typingInChat.length > 0;

  let statusText = reciever.status === "online" || isOnline
    ? "Online"
    : reciever.activeOn ? `Last Seen ${formatDate(reciever.activeOn)}` : 'Offline';

  if (isTyping) {
    statusText = reciever.isGroup ? `${typingInChat.length} typing...` : "typing...";
  }

  return (
    <>
      {reciever != null ? (
        <div className="h-15 w-full bg-[#ffff] flex gap-5 items-center px-10 border-b-4 border-[#f1f3f6] shadow-md">
          {photoUrl ? (
            <img
              src={photoUrl}
              className="w-10 h-10 rounded-full object-cover"
              alt={name}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200" />
          )}
          <div className="flex flex-col gap-1 justify-center">
            <p className="font-medium ">{name}</p>
            <p className={`whitespace-nowrap font-light text-sm ${isOnline || isTyping ? 'text-green-500' : ''}`}>
              {statusText}
            </p>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
