"use client"
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserByEmail } from "../redux/userThunks";
import { getOrCreateChat } from "../redux/chatThunks";
import { State } from "@/app/Types";
import type { AppDispatch } from "@/app/redux/store";

type Props = {
  setReciever?: (user: State["user"]) => void;
  setChatId?: (chatId: string) => void;
};

export const SearchBox = ({ setReciever, setChatId }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUserId } = useSelector((state: State) => state.user);

  const handleAddUser = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    const emailInput = window.prompt("Enter user's email");
    const email = String(emailInput || "").trim().toLowerCase();
    if (!email) return;

    const isEmailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmailLike) {
      window.alert("Please enter a valid email.");
      return;
    }

    try {
      const user = await dispatch(fetchUserByEmail(email)).unwrap();
      if (!currentUserId || !user?.uid) return;

      const chat = await dispatch(
        getOrCreateChat([currentUserId, user.uid])
      ).unwrap();

      setReciever?.(user);
      setChatId?.(chat.chatId);
    } catch (e) {
      if (e instanceof Error) {
        window.alert(e.message);
      } else {
        window.alert("User not found.");
      }
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="relative">
        <input
          type="email"
          className="bg-[#ffff] px-10 pr-16 border-b-4 border-[#f1f3f6] py-4 w-full rounded-2xl shadow-md outline-0"
          placeholder="Search"
        />
        <button
          type="button"
          onClick={handleAddUser}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl"
          aria-label="Add user"
        >
          Add
        </button>
      </div>
    </form>
  );
};