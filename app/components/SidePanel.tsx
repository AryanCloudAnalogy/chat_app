"use client"
import React from "react";
import { SearchBox } from "./SearchBox";
import { ChatList } from "./ChatList";

export const SidePanel = ({setReciever,userId , setChatId}:{setReciever:React.Dispatch<React.SetStateAction<any>>,userId:string,setChatId:React.Dispatch<React.SetStateAction<string | null>>}) => {
  return (
    <>
      <div className="px-4">
        <SearchBox />
      </div>
      <ChatList setReciever = {setReciever}  setChatId={setChatId}/>
    </>
  );
};
