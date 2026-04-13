"use client"
import React, { useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { useSelector } from "react-redux";
import { State } from "../Types";

export const MessageList = ({ messages, isGroup }: { messages: State["messages"]["messages"], isGroup?: boolean }) => {
  const { currentUserId, users } = useSelector((state: State) => state.user);
  const safeMessages = Array.isArray(messages) ? messages : [];
  const uniqueMessages = Array.from(
    new Map(safeMessages.map((msg: any) => [msg.messageId, msg])).values()
  );

  function scrollToBottom() {
    const element = document.getElementById("messages-end");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
  useEffect(() => {
    scrollToBottom();
  }, [uniqueMessages]);
  return (
    <div className=" overflow-auto">
      {/* <MessageBubble /> */}
      {uniqueMessages.map((message: any, idx: number
      ) => {
        const isSent = message.senderId === currentUserId;
        const sender = users ? users[message.senderId] : null;
        return (
          <MessageBubble
            type={isSent ? "sent" : "recieved"}
            message={message}
            key={message.messageId}
            senderName={sender?.name || sender?.email || message.senderId}
            isGroup={isGroup}
            id={idx + 1 === uniqueMessages.length ? "messages-end" : ""}
          />
        );
      })}
    </div>
  );
};