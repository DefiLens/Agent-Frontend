"use client"
import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { DataState } from "@/app/context/dataProvider";

const Sidebar = () => {
  const [showHistory, setShowHistory] = useState(true);
  const {
    recentChats,
    selectedChat,
    setSelectedChat,
    setMessages,
    fetchMessages,
  } = DataState();

  return (
    <div className="bg-zinc-900 flex flex-col gap-1 h-full justify-between overflow-hidden border-zinc-800 border-r">
      <div className="flex flex-col gap-3 items-center px-2 py-4 ">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-center py-2">
            <img
              height={50}
              width={50}
              src="/assets/snapbam.svg"
              alt="DefiLens"
              className="h-8 w-8 mr-2 block"
            />
            <img
              height={50}
              width={50}
              src="/assets/snapbam_text.svg"
              alt="DefiLens"
              className="w-24 mr-2"
            />
          </div>
          <button
            onClick={() => {
              setSelectedChat(null);
              setMessages([]);
            }}
            className={`flex justify-center items-center gap-2 rounded-xl px-3 py-2 cursor-pointer bg-zinc-950 text-white`}
          >
            + New Chat
          </button>

          <button
            className="px-2 font-semibold flex items-center gap-1 justify-between"
            onClick={() => setShowHistory(!showHistory)}
          >
            Recent Chats{" "}
            <IoIosArrowDown
              className={`transition-all duration-200 ${showHistory ? " rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto p-3 hide-sidebar rounded-xl bg-zinc-950 mx-2 -mt-3 mb-2">
          {recentChats?.length > 0 ? (
            recentChats.map((chat: any) => (
              <div
                key={chat._id}
                className="relative"
                onClick={() => {
                  setSelectedChat(chat._id);
                  fetchMessages(chat._id);
                }}
              >
                <div
                  className={`${
                    chat._id === selectedChat
                      ? "bg-white bg-opacity-15"
                      : "bg-white bg-opacity-5"
                  } flex items-center gap-2 rounded-lg hover:bg-zinc-800 px-3 py-1 cursor-pointer transition-all duration-200`}
                >
                  <p className="text-ellipsis overflow-hidden whitespace-nowrap text-sm">
                    {chat.chatName}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col gap-3 p-2 text-center">
              No recent chats
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
