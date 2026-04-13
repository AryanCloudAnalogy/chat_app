import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchChats = createAsyncThunk<
  any[],
  string,
  { rejectValue: string }
>("chat/fetchChats", async (userId, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/chats/${userId}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch chats");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to fetch chats");
  }
});

export const getOrCreateChat = createAsyncThunk<
  { chatId: string },
  [string, string],
  { rejectValue: string }
>("chat/getOrCreateChat", async (participantIds, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/chats/get-or-create", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ participantIds }),
    });

    if (!response.ok) {
      throw new Error("Failed to create chat");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to create chat");
  }
});

export const createGroup = createAsyncThunk<
  any,
  { name: string; participantIds: string[] },
  { rejectValue: string }
>("chat/createGroup", async ({ name, participantIds }, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/chats/group", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, participantIds }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to create group");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to create group");
  }
});

export const joinGroup = createAsyncThunk<any, string, { rejectValue: string }>(
  "chat/joinGroup",
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/chats/join", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to join group");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to join group");
    }
  },
);
