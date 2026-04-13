"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { joinGroup } from "../redux/chatThunks";
import type { AppDispatch } from "@/app/redux/store";

type Props = {
  onClose: () => void;
  onGroupJoined: (chat: any) => void;
};

export const JoinGroup = ({ onClose, onGroupJoined }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [chatId, setChatId] = useState("");

  const handleJoin = async () => {
    if (!chatId.trim()) {
      alert("Please enter a group ID");
      return;
    }

    try {
      const result = await dispatch(joinGroup(chatId)).unwrap();
      onGroupJoined(result);
      onClose();
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Join Group</h2>
        
        <input
          type="text"
          placeholder="Enter group ID"
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};
