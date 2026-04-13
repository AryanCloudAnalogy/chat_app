import { createSlice } from "@reduxjs/toolkit";
import { fetchMessages } from "./messagesThunk";
import { State } from '@/app/Types'

const initialState = {
  id: null,
  text: "",
  time: "",
  status: "idle",
  messages: [],
  messageStatus: "idle",
  messageError: "",
} as State["messages"];

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      const existingMessage = state.messages.find(
        (msg) => msg.messageId === messageId
      );
      if (existingMessage) {
        existingMessage.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.messageStatus = "loading";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messageStatus = "succeeded";
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messageStatus = "failed";
        state.messageError = action.error?.message ? action.error?.message : 'Something went wrong';
      })

  },
});

export const { addMessage, updateMessageStatus } = messagesSlice.actions;

export default messagesSlice.reducer;