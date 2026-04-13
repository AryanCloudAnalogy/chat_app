import { createAsyncThunk } from "@reduxjs/toolkit";
import { addMessage } from "./messagesSlice";

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (chatId: string) => {
    const response = await fetch(`/api/messages/${chatId}`, {
      credentials: "include",
    });
    if (!response.ok) {
      if (response.status === 401) {
        console.warn("Auth failed for messages, returning empty list");
        return [];
      }
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (newMessage: any, { dispatch, getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const chat = state.chat?.chats?.find((c: any) => c.chatId === newMessage.chatId);
      const participantIds = chat?.participants || [];

      // 1. Save to Database via API
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to send message: ${response.statusText}`,
        );
      }

      const savedMessage = await response.json();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent("local_message_sent", { detail: savedMessage }));
      }

      dispatch({
        type: "socket/send",
        payload: {
          type: "SEND_MESSAGE",
          chatId: savedMessage.chatId,
          recipientId: savedMessage.receiverId,
          participantIds,
          message: savedMessage,
        },
      });

      return savedMessage;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);
export const addSocketMessage = createAsyncThunk(
  "messages/addMessage",
  async (updatedMessage: any, { dispatch, rejectWithValue }) => {
    try {
      dispatch(addMessage(updatedMessage));
      console.log("s");
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);
