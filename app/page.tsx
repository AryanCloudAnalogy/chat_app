"use client";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import { Toolbar } from "./components/Toolbar";
import { ChatWindow } from "./components/ChatWindow";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser, checkAuth } from "./redux/userThunks";
import { setCurrentUserId } from "./redux/userSlice";
import type { AppDispatch, RootState } from "@/app/redux/store";
import { State, ApiUser } from "./Types";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { log } from "console";

export const SocketContext = React.createContext<{
  socket: WebSocket | null;
  onlineUsers: string[];
  typingUsers: Record<string, string[]>;
  dynamicChats: Record<string, { lastMessage?: any, unRead?: number }>;
}>({
  socket: null, onlineUsers: [], typingUsers: {}, dynamicChats: {}
});

function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const [reciever, setReciever] = useState<ApiUser | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  const {
    status,
    error,
    currentUserId,
    isAuthenticated,
    currentUser,
    authChecked,
  } = useSelector((state: State) => state.user);

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [dynamicChats, setDynamicChats] = useState<Record<string, { lastMessage?: any, unRead?: number }>>({});

  const activeChatIdRef = useRef(chatId);
  useEffect(() => { activeChatIdRef.current = chatId; }, [chatId]);

  const { chats } = useSelector((state: State) => state.chat);
  const chatsRef = useRef(chats);
  useEffect(() => { chatsRef.current = chats; }, [chats]);

  useEffect(() => {
    if (!currentUserId) return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    console.log(window.location.protocol);
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "REGISTER", userId: currentUserId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ONLINE_USERS") {
          setOnlineUsers(data.users);
        } else if (data.type === "USER_ONLINE") {
          setOnlineUsers(prev => Array.from(new Set([...prev, data.userId])));
        } else if (data.type === "USER_OFFLINE") {
          setOnlineUsers(prev => prev.filter(id => id !== data.userId));
        } else if (data.type === "TYPING") {
          setTypingUsers(prev => ({
            ...prev,
            [data.chatId]: Array.from(new Set([...(prev[data.chatId] || []), data.senderId]))
          }));
        } else if (data.type === "STOP_TYPING") {
          setTypingUsers(prev => ({
            ...prev,
            [data.chatId]: (prev[data.chatId] || []).filter(id => id !== data.senderId)
          }));
        } else if (data.type === "NEW_MESSAGE") {
          setDynamicChats(prev => {
            const chatInRedux = chatsRef.current?.find((c: any) => c.chatId === data.chatId);
            const baseUnread = chatInRedux?.unRead?.[currentUserId] || 0;
            const chatData = prev[data.chatId];
            const currentUnread = chatData?.unRead !== undefined ? chatData.unRead : baseUnread;
            const isCurrentlyOpen = activeChatIdRef.current === data.chatId;

            return {
              ...prev,
              [data.chatId]: {
                ...chatData,
                lastMessage: data.message,
                unRead: isCurrentlyOpen ? 0 : currentUnread + 1
              }
            };
          });
        }
      } catch (e) {
        console.error(e);
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [currentUserId]);

  useEffect(() => {
    const handleLocalMessage = (e: any) => {
      const msg = e.detail;
      setDynamicChats(prev => ({ ...prev, [msg.chatId]: { ...prev[msg.chatId], lastMessage: msg } }));
    };
    window.addEventListener("local_message_sent", handleLocalMessage as EventListener);
    return () => window.removeEventListener("local_message_sent", handleLocalMessage as EventListener);
  }, []);

  useEffect(() => {
    if (chatId) {
      setDynamicChats(prev => ({ ...prev, [chatId]: { ...prev[chatId], unRead: 0 } }));

      if (currentUserId) {
        fetch("/api/chats/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ chatId })
        }).catch(err => console.error("Failed to clear unread:", err));
      }
    }
  }, [chatId, currentUserId]);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && currentUser?.uid) {
      dispatch(setCurrentUserId(currentUser.uid));
      dispatch(fetchUser(currentUser.uid));
    }
  }, [isAuthenticated, currentUser, dispatch]);

  if (!authChecked) {
    return (
      <div className="h-screen w-screen overflow-clip">
        <div className="flex items-center justify-center h-full">
          <p>Loading ...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen overflow-clip">
        <Navbar />
        <div className="flex items-center justify-center h-full">
          <p>Please sign in to continue.</p>
        </div>
      </div>
    );
  }

  if (status === "loading" && !currentUserId) {
    return <p>Loading ...</p>;
  }

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, typingUsers, dynamicChats }}>
      <div className="h-screen w-screen overflow-clip text-black">
        <Navbar />
        <div className="h-full w-full grid grid-cols-[minmax(25%,300px)_auto] bg-[#f1f3f6] overflow-auto">
          <div className="h-full w-full bg-[#f9fbfc] flex flex-col gap-2">
            <Toolbar
              setReciever={setReciever}
              userId={currentUserId}
              setChatId={setChatId}
              currentUser={currentUser}
            />
          </div>

          <div className="h-[93vh] w-full bg-[#ffffff]">
            <ChatWindow reciever={reciever} chatId={chatId} />
          </div>
        </div>
      </div>
    </SocketContext.Provider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <HomePage />
    </Provider>
  );
}

export default App;
