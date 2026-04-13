import { createSlice } from "@reduxjs/toolkit";
import { fetchChats } from "./chatThunks";
import { State } from "@/app/Types";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: [] as State["chat"]["chats"],
    chatStatus: "idle",
    chatError: '',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.chatStatus = "loading";
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chatStatus = "succeeded";
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.chatStatus = "failed";
        state.chatError = String(action.payload);
      });
  },
});

export default chatSlice.reducer;