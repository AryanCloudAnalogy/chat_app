import { createAsyncThunk } from "@reduxjs/toolkit";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { signOut } from "./userSlice";
import { State } from "../Types";

type RejectedValue = string;

export const fetchUser = createAsyncThunk<
  State["user"],
  string,
  { rejectValue: RejectedValue }
>("user/fetchUser", async (userId, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    return (await response.json()) as any;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to fetch user");
  }
});

export const checkAuth = createAsyncThunk<
  State["user"],
  void,
  { rejectValue: RejectedValue }
>("user/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Not authenticated");
    }

    return (await response.json()) as any;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Authentication failed");
  }
});

export const fetchUserByEmail = createAsyncThunk<
  State["user"],
  string,
  { rejectValue: RejectedValue }
>("user/fetchUserByEmail", async (email, { rejectWithValue }) => {
  console.log(email);
  try {
    const response = await fetch(
      `/api/users/email/${encodeURIComponent(email)}`,
      { credentials: "include" },
    );

    if (!response.ok) {
      let message = "Failed to fetch user";

      try {
        const data = await response.json();
        message = data?.error ?? message;
      } catch {}

      throw new Error(message);
    }

    return (await response.json()) as any;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to fetch user");
  }
});
