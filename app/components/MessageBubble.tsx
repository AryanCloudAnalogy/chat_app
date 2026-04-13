"use client"
import React from "react";
import { State } from "../Types";

const MessageSentBubble = ({ message, id }: {
  message: {
    id: null | undefined;
    text: string;
    time: string | number | Date;
    status: string;
    senderId: string;
    messageId: null | undefined; message: State["messages"]
  },id:string
}) => {
  return (
    <>
      <div className={"flex justify-end mb-2"} key={message.id} id={id}>
        <div
          className={
            "max-w-xs md:max-w-md px-3 py-2 rounded-lg shadow bg-blue-500 text-white"
          }
        >
          {/* Message text */}
          <p className="text-sm">{message.text}</p>

          {/* Timestamp + status */}
          <div className="flex justify-end items-center gap-1 mt-1">
            <span className="text-[10px] opacity-70">
              {new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }).format(new Date(message.time))}
            </span>
            <span className="text-[10px] opacity-70">
              {message.status === "read" ? "✓✓" : "✓"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

const MessageRecievedBubble = ({ message ,id, senderName, isGroup}: {
  message: {
    id: null | undefined;
    text: string;
    time: string | number | Date;
    status: string;
    senderId: string;
    messageId: null | undefined; message: State["messages"]
  },id:string, senderName?: string, isGroup?: boolean
}) => {
  return (
    <>
      <div className={"flex justify-start mb-2"} key={message.id} id={id}>
        <div
          className={
            "max-w-xs md:max-w-md px-3 py-2 rounded-lg shadow bg-gray-200 text-gray-900 flex flex-col"
          }
        >
          {isGroup && (
            <span className="text-xs font-bold text-blue-600 mb-1">{senderName}</span>
          )}
          {/* Message text */}
          <p className="text-sm">{message.text}</p>

          {/* Timestamp + status */}
          <div className="flex justify-end items-center gap-1 mt-1">
            <span className="text-[10px] opacity-70">
              {new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }).format(new Date(message.time))}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export const MessageBubble = ({ type, message, id ,senderName ,isGroup}: {
  type: string, message: {
    id: null | undefined;
    text: string;
    time: string | number | Date;
    status: string;
    senderId: string;
    messageId: null | undefined; message: State["messages"]
  },id:string, senderName?: string, isGroup?: boolean
}) => {
  return (
    <>
      {type === "sent" ? (
        <MessageSentBubble message={message} id={id} />
      ) : (
        <MessageRecievedBubble message={message} id={id} senderName={senderName} isGroup={isGroup} />
      )}
    </>
  );
};
