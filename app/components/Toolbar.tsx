"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { signOut } from "../redux/userSlice";
import { SearchBox } from "./SearchBox";
import { ChatList } from "./ChatList";
import { CreateGroup } from "./CreateGroup";
import { JoinGroup } from "./JoinGroup";
import { ApiUser } from "../Types";

type ToolbarProps = {
  setReciever: React.Dispatch<React.SetStateAction<ApiUser | null>>;
  setChatId: React.Dispatch<React.SetStateAction<string | null>>;
  userId: string | null;
  currentUser: ApiUser;
};

export const Toolbar = ({
  setReciever,
  setChatId,
  currentUser,
}: ToolbarProps) => {
  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
      await fetch("/auth/logout", { method: "POST", credentials: "include" });
      dispatch(signOut());
      setDropdownOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleGroupCreated = (chat: any) => {
    setReciever({
      uid: chat.chatId,
      name: chat.name,
      isGroup: true,
      groupName: chat.name,
    });
    setChatId(chat.chatId);
  };

  const handleGroupJoined = (chat: any) => {
    setReciever({
      uid: chat.chatId,
      name: chat.name,
      isGroup: true,
      groupName: chat.name,
    });
    setChatId(chat.chatId);
  };

  return (
    <>
      <div className="h-15 w-full bg-[#ffff] flex gap-5 justify-evenly items-center px-10 border-b-4 border-[#f1f3f6] py-4 shadow-md">
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateGroup(true)}
            className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            + Group
          </button>
          <button
            onClick={() => setShowJoinGroup(true)}
            className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            Join
          </button>
        </div>
        <div className="relative">
          <img
            src={currentUser?.photoUrl || "https://via.placeholder.com/32"}
            alt="Profile"
            className="w-8 h-8 rounded-full cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="px-4">
        <SearchBox setReciever={setReciever} setChatId={setChatId} />
      </div>
      <ChatList setReciever={setReciever} setChatId={setChatId} />
      {showCreateGroup && (
        <CreateGroup
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}
      {showJoinGroup && (
        <JoinGroup
          onClose={() => setShowJoinGroup(false)}
          onGroupJoined={handleGroupJoined}
        />
      )}
    </>
  );
};
