"use client";
import React, { useEffect, useRef, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatDate } from "../utills/formatDate";
import { fetchUser } from "../redux/userThunks";
import { fetchChats } from "../redux/chatThunks";
import type { RootState, AppDispatch } from "../redux/store";
import { State } from "../Types";
import { SocketContext } from "../page";
import { ApiUser } from "../Types";

type Props = {
  setReciever: React.Dispatch<React.SetStateAction<ApiUser | null>>;
  setChatId: React.Dispatch<React.SetStateAction<string | null>>;
};

export const ChatList = ({ setReciever, setChatId }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { dynamicChats, onlineUsers, typingUsers } = useContext(SocketContext);

  const { chats } = useSelector((state: State) => state.chat);
  const { users, currentUserId: userId } = useSelector(
    (state: State) => state.user,
  );

  const lastFetchedUserRef = useRef<string | null>(null);
  const requestedUsersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    if (lastFetchedUserRef.current === userId) return;

    lastFetchedUserRef.current = userId;
    dispatch(fetchChats(userId));
  }, [userId, dispatch]);

  useEffect(() => {
    if (!chats?.length || !userId) return;

    const idsToFetch: string[] = [];

    chats.forEach((chat: State["chat"]["chats"][number]) => {
      const otherUserIds = chat.participants.filter((id: string) => id !== userId);

      otherUserIds.forEach((otherUserId) => {
        if (
          otherUserId &&
          !users[otherUserId] &&
          !requestedUsersRef.current.has(otherUserId)
        ) {
          requestedUsersRef.current.add(otherUserId);
          idsToFetch.push(otherUserId);
        }
      });
    });

    idsToFetch.forEach((id) => dispatch(fetchUser(id)));
  }, [chats, users, userId, dispatch]);

  return (
    <div className="flex flex-col w-full gap-4 p-4 overflow-auto h-full">
      {chats.map((chat: State["chat"]["chats"][number]) => {
        const otherUserId = chat.participants.find((id) => id !== userId);
        const otherUser = otherUserId ? users[otherUserId] : undefined;
        const isGroup = chat.isGroup;

      const dynChat = dynamicChats[chat.chatId];
      const lastMessage = dynChat?.lastMessage || chat.lastMessage;
      let unRead = chat.unRead[userId] || 0;
      if (dynChat?.unRead !== undefined) {
        unRead = dynChat.unRead;
      }
      const isTyping = typingUsers[chat.chatId] && typingUsers[chat.chatId].length > 0;
      const isUserOnline = !isGroup && otherUserId && (onlineUsers.includes(otherUserId) || otherUserId === 'gini_001');

        const handleClick = () => {
          if (isGroup) {
            setReciever({
              uid: chat.chatId,
              name: chat.name,
              isGroup: true,
              groupName: chat.name,
            });
          } else {
            setReciever(otherUser ?? null);
          }
          setChatId(chat.chatId);
        };

        return (
          <div
            key={chat.chatId}
            className="grid grid-cols-[20%_auto_auto] shadow-xl rounded-2xl border-b-4 border-[#f1f3f6] bg-[#ffff] p-2 cursor-pointer"
            onClick={handleClick}
          >
          <div className="relative w-12 h-12">
            <img
              src={
                isGroup ? "https://via.placeholder.com/48" : otherUser?.photoUrl
              }
              alt={isGroup ? chat.name : otherUser?.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            {isUserOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>

            <div className="flex flex-col gap-1 justify-center">
              <p className="font-medium w-[15ch] truncate text-gray-600">
                {isGroup ? chat.name : otherUser?.name}
              </p>
              <p className="text-sm text-gray-600 truncate w-[15ch]">
              {isTyping ? (
                <span className="text-blue-500 italic">typing...</span>
              ) : (
                lastMessage?.text
              )}
              </p>
            </div>

            <div className="flex flex-col gap-2 items-center">
              <p className="font-light text-xs whitespace-nowrap">
              {lastMessage?.time
                ? formatDate(lastMessage.time)
                  : ""}
              </p>

            {userId && unRead > 0 && (
                <p className="border-2 border-gray-300 px-2 bg-gray-200 rounded-full text-xs">
                {unRead}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
