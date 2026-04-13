"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createGroup } from "../redux/chatThunks";
import { State } from "@/app/Types";
import type { AppDispatch } from "@/app/redux/store";

type Props = {
  onClose: () => void;
  onGroupCreated: (chat: any) => void;
};

export const CreateGroup = ({ onClose, onGroupCreated }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, currentUserId } = useSelector((state: State) => state.user);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const otherUsers = Object.values(users).filter(
    (u: any) => u.uid !== currentUserId
  );

  const toggleUser = (uid: string) => {
    setSelectedUsers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) {
      alert("Group name and at least 2 participants required");
      return;
    }

    try {
      const result = await dispatch(
        createGroup({ name: groupName, participantIds: selectedUsers })
      ).unwrap();
      onGroupCreated(result);
      onClose();
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Create Group</h2>
        
        <input
          type="text"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <p className="text-sm font-semibold mb-2">Select participants:</p>
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {otherUsers.map((user: any) => (
            <label key={user.uid} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.uid)}
                onChange={() => toggleUser(user.uid)}
              />
              <span>{user.name || user.email}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
