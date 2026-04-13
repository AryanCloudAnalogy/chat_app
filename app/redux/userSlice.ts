import { createSlice, current } from "@reduxjs/toolkit";
import { fetchUser, checkAuth, fetchUserByEmail } from "./userThunks";
import { ApiUser } from "@/app/Types";

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: {} as Record<string, ApiUser>,
    currentUserId: null as string | null,
    isAuthenticated: false,
    currentUser: null as any,
    authChecked: false,
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    setCurrentUserId: (state, action) => {
      state.currentUserId = action.payload;
    },
    signIn: (state, action) => {
      state.isAuthenticated = true;
      state.currentUser = action.payload;
      state.currentUserId = action.payload.uid;
    },
    signOut: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.currentUserId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users[action.payload.uid] = action.payload;

      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch user";
      })
      .addCase(checkAuth.pending, (state) => {
        state.status = "loading";
        state.authChecked = false;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        state.currentUser = action.payload;
        state.currentUserId = action.payload.uid;
        state.authChecked = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Authentication failed";
        state.isAuthenticated = false;
        state.currentUser = null;
        state.currentUserId = null;
        state.authChecked = true;
      })
      .addCase(fetchUserByEmail.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserByEmail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users[action.payload.uid] = action.payload;
      })
      .addCase(fetchUserByEmail.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch user";
      });
  },
});

export const { setCurrentUserId, signIn, signOut } = userSlice.actions;
export default userSlice.reducer;