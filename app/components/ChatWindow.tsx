"use client"
import { useEffect, useRef } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages } from "../redux/messagesThunk";
import type { RootState, AppDispatch } from "../redux/store";
import { State, ApiUser } from "../Types";

type Props = {
  reciever: ApiUser | null;
  chatId: string | null;
};

export const ChatWindow = ({ reciever, chatId }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { messages } = useSelector(
    (state: State) => state.messages
  );

  const { isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );


  const lastFetchedChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!chatId) return;
    if (!isAuthenticated) return;
    if (lastFetchedChatIdRef.current === chatId) return;

    lastFetchedChatIdRef.current = chatId;
    dispatch(fetchMessages(chatId));
  }, [chatId, isAuthenticated, dispatch]);

  return (
    <div className="flex flex-col justify-between h-full w-full overflow-clip">
      {reciever == null ? (
        <p className="text-center">
          Select a chat to start a conversation.
        </p>
      ) : (
        <>
          <ChatHeader reciever={reciever} chatId={chatId} />
          <MessageList messages={messages} isGroup={reciever.isGroup} />
          <ChatInput chatId={chatId} receiverId={reciever.uid} />
        </>
      )}
    </div>
  );
};
